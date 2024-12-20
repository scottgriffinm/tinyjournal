import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import pool from "../../../lib/db";

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
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
    updateAge: 10 * 60, // Update session token every 10 minutes
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "none", // Cross-origin cookies
        secure: process.env.NODE_ENV === "production", // Only secure cookies in production
        path: "/", // Accessible throughout the app
      },
    },
  },
  callbacks: {
    async signIn({ user }) {
      console.log("SignIn Callback Triggered for User:", user);

      try {
        // Check if user exists in the database
        const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [user.email]);

        if (rows.length === 0) {
          console.log(`New user detected: ${user.email}`);

          // Add user to the `users` table
          await pool.query(
            `
            INSERT INTO users (email, password, confirmed, listenCount, samplesHeard, sampleQueue, vibe)
            VALUES (?, "googleSignIn", true, 0, '[]', '[]', '')
            `,
            [user.email]
          );

          console.log(`User ${user.email} added to the database`);

        } else {
          console.log(`User ${user.email} already exists in the database`);
        }

        return true; // Allow sign-in
      } catch (error) {
        console.error("Error during sign-in callback:", error);
        return false; // Deny sign-in
      }
    },

    async jwt({ token, account, user }) {
      console.log("JWT Callback Triggered");
      console.log("Before JWT Update:", { token, account, user });

      if (account) {
        // Store account details during initial sign-in
        token.accessToken = account.access_token;
        token.accessTokenExpires = Date.now() + 30 * 60 * 1000; // 30-minute expiration
        if (user) {
          token.email = user.email;
        }
      }

      // Check if the token has expired
      if (Date.now() > token.accessTokenExpires) {
        console.log("JWT Callback: Access token expired");
        return null; // Return null if expired
      }

      console.log("After JWT Update:", token);
      return token;
    },

    async session({ session, token }) {
      console.log("Session Callback Triggered");
      console.log("Before Session Update:", { session, token });

      if (!token) {
        console.log("Session Callback: Token invalid or expired");
        session.error = "SessionExpired";
        return null; // No session if token is invalid
      }

      session.user = {
        email: token.email,
      };
      session.accessToken = token.accessToken;

      console.log("After Session Update:", session);
      return session;
    },
  },
  debug: true, // Enable detailed logs for troubleshooting
});