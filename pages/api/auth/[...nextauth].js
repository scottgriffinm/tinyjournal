// pages/api/auth/[...nextauth].js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import pool from "../../../lib/db"; // Import the MySQL connection pool

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      try {
        // Check if the user exists in the database
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [user.email]);

        if (rows.length === 0) {
          // If the user does not exist, create a new user
          await pool.query(
            "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
            [user.email, null, user.name || "Unknown"]
          );
          console.log(`New user ${user.email} added to the database`);
        } else {
          console.log(`User ${user.email} already exists in the database`);
        }

        return true; // Allow sign-in
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false; // Deny sign-in on error
      }
    },
    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = Date.now() + 1800 * 1000; // 30-minute expiration
      }

      // Include the user's email and first name in the token during initial sign-in
      if (user) {
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.name.split(" ")[0]; // Extract the first name
      }

      if (Date.now() > token.accessTokenExpires) {
        return null; // Expired token
      }

      return token;
    },
    async session({ session, token }) {
      if (!token) {
        session.error = "SessionExpired";
        return null;
      }
      session.accessToken = token.accessToken;
      session.user.email = token.email; // Include the email in the session
      session.user.name = token.name;
      session.user.firstName = token.firstName; // Include the first name in the session
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to the home page after login
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/`;
      } else if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      return baseUrl;
    },
  },
  events: {
    async signIn(message) {
      console.log("Sign in event:", message);
    },
    async signOut(message) {
      console.log("Sign out event:", message);
    },
  },
});