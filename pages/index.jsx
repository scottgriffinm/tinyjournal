import React, { useEffect, useState } from "react";
import { requireAuth } from "../lib/auth";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { getCache, setCache } from "../lib/localStorageCache";
const CACHE_KEY = "journalEntries";

const Home = () => {
  const router = useRouter();
  const [entries, setEntries] = useState([]);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        // Try loading cached entries first
        const cached = getCache(CACHE_KEY);
        console.log(`cached: ${cached}`);
        if (cached) {
          console.log(cached);
          setEntries(cached);
          return; // We have valid, unexpired data—stop here!
        }
        const res = await fetch("/api/get-entries");
        const data = await res.json();
        console.log(data.entries);
        if (res.ok) {
          setEntries(data.entries);
          // Store data in localStorage with a TTL (in minutes)
          setCache(CACHE_KEY, data.entries);
        } else {
          console.error("Error fetching entries:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch entries:", error);
      }
    };

    const fetchSession = async () => {
      const session = await getSession();
      if (session && session.user.firstName) {
        setFirstName(session.user.firstName);
      }
    };

    fetchEntries();
    fetchSession();
  }, []);

  const MenuItem = ({ label, path, ...props }) => (
    <div
      {...props}
      onClick={() => router.push(path)}
      className="bg-neutral-800/50 p-4 rounded-lg flex items-center space-x-2 cursor-pointer hover:bg-neutral-800 transition-colors border border-neutral-700"
    >
      <span className="text-lg text-neutral-300">{label}</span>
    </div>
  );

  return (
    <div className="bg-neutral-900 p-6 min-h-screen text-neutral-300 font-mono">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-2xl mb-10 mt-8">
         tiny journal
        </h1>

        {/* Menu Items */}
        <div className="space-y-4">
          <MenuItem data-testid="new-entry" label="new entry" path="/new-entry" />
          <MenuItem data-testid="analyze" label="analyze" path="/analyze" />
          <MenuItem data-testid="settings" label="settings" path="/account" />
        </div>

        {/* Feed Items */}
        <div className="space-y-2 mt-8">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="feed-item bg-neutral-800/30 p-3 rounded-lg flex justify-between items-center cursor-pointer hover:bg-neutral-800/50 transition-colors border border-neutral-700"
              onClick={() => router.push(`/entry?id=${entry.id}`)}
            >
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-500">{entry.formattedDate}</span>
                <span className="text-neutral-300">{entry.shortSummary.slice(0, 42).replace(/[\s.]$/, '')}...</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Redirect users to login page if not signed in
export async function getServerSideProps(context) {
  return requireAuth(context);
}


export default Home;