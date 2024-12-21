import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";

const EntryView = () => {
  const router = useRouter();
  const { id } = router.query;
  const [entry, setEntry] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchEntry = async () => {
      const res = await fetch(`/api/get-entry?id=${id}`);
      const data = await res.json();
      if (res.ok) {
        setEntry(data);
      } else {
        console.error("Error fetching entry:", data.error);
      }
    };

    fetchEntry();
  }, [id]);

  if (!entry) {
    return <div className="bg-gray-900 min-h-screen text-gray-300 font-mono p-6">Loading...</div>;
  }

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300 font-mono p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <ArrowLeft
            className="w-6 h-6 text-gray-400 hover:text-gray-300 cursor-pointer"
            onClick={() => router.push("/")}
          />
          <span className="text-gray-500">{entry.formattedDateTime}</span>
        </div>
        <div className="whitespace-pre-wrap leading-relaxed">{entry.text}</div>
      </div>
    </div>
  );
};

export default EntryView;