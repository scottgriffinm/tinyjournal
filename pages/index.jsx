import React, { useEffect, useState } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";

const Home = () => {
  const router = useRouter();
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const fetchEntries = async () => {
      const res = await fetch('/api/get-entries');
      const data = await res.json();
      if (res.ok) {
        setEntries(data.entries);
      } else {
        console.error('Error fetching entries:', data.error);
      }
    };

    fetchEntries();
  }, []);

  return (
    <div className="bg-gray-900 p-6 min-h-screen text-gray-300 font-mono">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <h1 className="text-2xl mb-10">tiny journal</h1>

        {/* Menu Items */}
        <div className="space-y-4">
          <div
            onClick={() => router.push("/new-entry")}
            className="bg-gray-800 p-4 rounded flex items-center space-x-2 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg">new entry</span>
          </div>

          <div
            onClick={() => router.push("/analyze")}
            className="bg-gray-800 p-4 rounded flex items-center space-x-2 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg">analyze</span>
          </div>

          <div
            onClick={() => router.push("/account")}
            className="bg-gray-800 p-4 rounded flex items-center space-x-2 cursor-pointer hover:bg-gray-700 transition-colors"
          >
            <span className="text-lg">account</span>
          </div>
        </div>

        {/* Feed Items */}
        <div className="space-y-2 mt-8">
        {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-gray-800 p-3 rounded flex justify-between items-center cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => router.push(`/entry?id=${entry.id}`)}
            >
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">{entry.formattedDate}</span>
                <span>{entry.shortSummary}</span>
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
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {}, // Add any props you need for the page
  };
}

export default Home;