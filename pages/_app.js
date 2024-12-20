// pages/_app.js
import { SessionProvider, useSession } from "next-auth/react";
import '../styles/globals.css';

export default function App({ Component, pageProps: { session, ...pageProps } }) {
  console.log("SessionProvider initialized with session:", session);

  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
    </SessionProvider>
  );
}

