import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { getCache, setCache } from "../lib/localStorageCache";
import JournalEntryAnalysis from "../components/dashboards/JournalEntryAnalysis"; // Import the analysis component

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
        {/* Header with back button and date */}
        <div className="flex justify-between items-center mb-8">
          <ArrowLeft
            className="w-6 h-6 text-neutral-400 hover:text-neutral-300 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <span className="text-neutral-500">{entry.formattedDateTime}</span>
        </div>

        {/* Journal entry text */}
        <div className="whitespace-pre-wrap leading-relaxed text-neutral-300 mb-8">
          {entry.text}
        </div>


        {/* Spacer to push analysis section down by one full page */}
        <div className="h-screen"></div> {/* Full-page height spacer */}


        {/* Journal analysis section */}
        <JournalEntryAnalysis
          data={{
            entryNumber: null, // Use ID as the entry number for simplicity
            entryDatetime: null,
            observation: entry.observation,
            longSummary: entry.longSummary,
            recommendations: entry.recommendations,
            metrics: {
              happiness: entry.emotions.happiness * 100,
              connection: entry.emotions.connection * 100,
              productivity: entry.emotions.productivity * 100,
            },
          }}
        />
      </div>
    </div>
  );
};

export default EntryView;