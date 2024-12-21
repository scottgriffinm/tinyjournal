import { getToken } from "next-auth/jwt";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const PRODUCT_ID = process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID;
const PRICE_ID = process.env.STRIPE_SUBSCRIPTION_PRICE_ID; // Ensure this matches your Stripe Price ID

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { action } = req.body;
    if (!action || (action !== "upgrade" && action !== "cancel-renewal")) {
      return res.status(400).json({ error: "Invalid action specified" });
    }

    const customers = await stripe.customers.list({ email: token.email });

    if (customers.data.length === 0) {
      if (action === "cancel-renewal") {
        return res
          .status(400)
          .json({ error: "You do not have a paid subscription to cancel." });
      }

      // Create a new customer if upgrading
      const customer = await stripe.customers.create({
        email: token.email,
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: PRICE_ID, // Replace with your Stripe Price ID
            quantity: 1,
          },
        ],
        customer: customer.id,
        success_url: `${process.env.NEXTAUTH_URL}/account`,
        cancel_url: `${process.env.NEXTAUTH_URL}/account`,
      });

      return res.status(200).json({ url: session.url });
    }

    const customer = customers.data[0];
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
    });

    if (action === "upgrade") {
      const hasProduct = subscriptions.data.some(sub =>
        sub.items.data.some(item => item.price.product === PRODUCT_ID)
      );

      if (hasProduct) {
        return res.status(400).json({ error: "You already have the paid tier." });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "subscription",
        line_items: [
          {
            price: PRICE_ID, // Replace with your Stripe Price ID
            quantity: 1,
          },
        ],
        customer: customer.id,
        success_url: `${process.env.NEXTAUTH_URL}/account`,
        cancel_url: `${process.env.NEXTAUTH_URL}/account`,
      });

      return res.status(200).json({ url: session.url });
    }

    if (action === "cancel-renewal") {
      const subscription = subscriptions.data.find(sub =>
        sub.items.data.some(item => item.price.product === PRODUCT_ID)
      );

      if (!subscription) {
        return res
          .status(400)
          .json({ error: "You do not have a paid subscription to cancel." });
      }

      // Set subscription to cancel at the end of the billing period
      await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });

      return res.status(200).json({
        message: "Your subscription renewal has been canceled. You will retain benefits until the subscription ends.",
      });
    }
  } catch (error) {
    console.error("Error in switch-tier handler:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}