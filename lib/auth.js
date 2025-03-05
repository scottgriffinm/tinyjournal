import { getSession } from "next-auth/react";

/**
 * getServerSideProps wrapper for authentication
 * - Allows test mode bypass with process.env.TEST_MODE
 * - Redirects users to login if no session is found
 */
export async function requireAuth(context) {
  if (process.env.TEST_MODE === "true") {
    console.log(`Test mode enabled (${process.env.TEST_MODE}): skipping auth check`);
    return { props: {} }; // Skip authentication in test mode
  }

  const session = await getSession(context);
  
  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return { props: {} }; // User is authenticated
}