import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { getCache, setCache } from "../lib/localStorageCache";

const CACHE_KEY_PREFIX = "entry_";

const EntryView = () => {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      const cacheKey = `${CACHE_KEY_PREFIX}${id}`;
      const cachedEntry = getCache(cacheKey);

      if (cachedEntry) {
        // If the entry is found in the cache, use it
        console.log("Cache hit for entry:", cachedEntry);
        setEntry(cachedEntry);
        return;
      }

      try {
        const res = await fetch(`/api/get-entry?id=${id}`);
        const data = await res.json();
        if (res.ok) {
          // Cache the fetched entry
          setCache(cacheKey, data);
          setEntry(data);
        } else {
          console.error("Error fetching entry:", data.error);
        }
      } catch (error) {
        console.error("Failed to fetch entry:", error);
      }
    };

    fetchEntry();
  }, [id]);

  if (!entry) {
    return (
      <div className="bg-neutral-900 min-h-screen text-neutral-300 font-mono p-6">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-neutral-900 min-h-screen text-neutral-300 font-mono p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <ArrowLeft
            className="w-6 h-6 text-neutral-400 hover:text-neutral-300 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <span className="text-neutral-500">{entry.formattedDateTime}</span>
        </div>
        <div className="whitespace-pre-wrap leading-relaxed text-neutral-300">
          {entry.text}
        </div>
      </div>
    </div>
  );
};

export default EntryView;