import { getToken } from "next-auth/jwt";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const PRODUCT_ID = process.env.STRIPE_SUBSCRIPTION_PRODUCT_ID;

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Validate user session
    let token;
    if (process.env.TEST_MODE) { // test mode: spoof token
      token = {email: process.env.TEST_EMAIL};
    } else { 
     token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token || !token.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

    const customers = await stripe.customers.list({ email: token.email });

    if (customers.data.length === 0) {
      // No Stripe customer exists
      return res.status(200).json({ tier: "free", expiryDate: null });
    }

    const customer = customers.data[0];
    var subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: "active",
    });

    if (subscriptions.data.length === 0) {
      // No active subscription exists
      return res.status(200).json({ tier: "free", expiryDate: null });
    }

    // Filter subscriptions by the specific product ID
    const subscription = subscriptions.data.find(sub =>
      sub.items.data.some(item => item.price.product === PRODUCT_ID)
    );

    if (!subscription) {
      // No subscription with the specific product ID exists
      return res.status(200).json({ tier: "free", expiryDate: null });
    }

    // user has plus subscription
    const tier = "plus";
    const expiryDate = new Date(subscription.current_period_end * 1000).toISOString();
    const isRenewing = !subscription.cancel_at_period_end; // Determine if subscription auto-renews

    res.status(200).json({ tier, expiryDate, isRenewing, subscriptionId: subscription.id });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}