import React, { useState } from 'react';
import { getSession } from "next-auth/react";
import { useRouter } from "next/router";
import { Trash2, Save, ArrowUp } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import JournalEntryAnalysis from '../components/dashboards/JournalEntryAnalysis';
import { updateCache } from '../lib/localStorageCache'; // Import caching functions
const CACHE_KEY = "journalEntries";

const NewEntry = () => {
  const router = useRouter();
  const [entry, setEntry] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // New state for loader
  const [analysisData, setAnalysisData] = useState(null);
  const [input, setInput] = useState('');
  const [analysisOpen, setAnalysisOpen] = useState(false);

  const handleDelete = () => {
    setEntry('');
    setShowDeleteDialog(false);
    router.push("/");
  };

  const handleSave = async () => {

    setIsSaving(true); // Start loader
    try {
      const response = await fetch('/api/create-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: entry }),
      });

      if (response.ok) {
        console.log('Entry successfully saved!');
        const data = await response.json();

        // Update cache with the new entry
        const newEntry = {
          id: data.id,
          formattedDate: new Date(data.dateTime).toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: '2-digit',
          }),
          shortSummary: data.shortSummary,
        };
        updateCache(CACHE_KEY, newEntry);

        // Remove entry text
        setEntry('');
        setShowSaveDialog(false);

        console.log('data.happiness:', data.happiness);
        console.log('data.connection:', data.connection);
        console.log('data.productivity:', data.productivity);
        // Fill analysis data
        setAnalysisData({
          entryNumber: data.entryNumber,
          entryDatetime: new Date().toLocaleString(),
          observation: data.observation,
          longSummary: data.longSummary,
          recommendations: data.recommendations,
          metrics: {
            happiness: data.happiness * 100,
            connection: data.connection * 100,
            productivity: data.productivity * 100,
          },
        });

        // Open journal analysis component
        setAnalysisOpen(true);

      } else {
        const errorData = await response.json();
        console.error('Error saving entry:', errorData.error);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      setShowErrorDialog(true);
    } finally {
      setIsSaving(false); // Stop loader
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-neutral-300 font-mono relative">

      {/* Saving loader */}
      {isSaving && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="h-10 w-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Floating buttons container */}
      <div className="absolute top-4 right-4 flex space-x-4 z-10">
        <button
          onClick={() => setShowDeleteDialog(true)} // No condition for enabling/disabling
          className="bg-neutral-800/50 p-3 rounded-lg hover:bg-neutral-800 transition-colors border border-neutral-700"
        >
          <Trash2 className="w-5 h-5 text-neutral-400" />
        </button>
        <button
          onClick={() => entry.trim() && setShowSaveDialog(true)}
          className="bg-neutral-800/50 p-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 border border-neutral-700"
          disabled={!entry.trim()}
        >
          <Save className="w-5 h-5 text-neutral-400" />
        </button>

      </div>

      {/* Full-screen textarea */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="start typing..."
        className="w-full h-screen bg-neutral-900 p-8 resize-none focus:outline-none text-neutral-300"
        autoFocus
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">delete entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              this action cannot be undone. this entry will be deleted forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
              onClick={() => setShowDeleteDialog(false)}
            >
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-900 hover:bg-red-800 text-neutral-300 border border-red-800"
              onClick={handleDelete}
            >
              delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">save entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              once saved, this entry cannot be modified. are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
              onClick={() => setShowSaveDialog(false)}
            >
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-900 hover:bg-green-800 text-neutral-300 border border-green-800"
              onClick={handleSave}
            >
              save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700 w-[90%] max-w-sm sm:max-w-md rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">Error</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              there was an error saving your entry, please try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600 mt-2"
              onClick={() => setShowErrorDialog(false)}
            >
              close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>


      {/* Analysis panel */}
      {analysisData && (
        <div
          className={`
      fixed bottom-0 left-0 w-full h-[100vh]
      bg-neutral-900
      z-40
      border-t border-neutral-700
      overflow-hidden
    `}
        >
          {/* Scrollable Content */}
          <div className="h-full w-full overflow-y-auto scroll-smooth p-4 relative">

            {/* Close Button */}
            <span
              onClick={() => router.push("/")}
              className="absolute top-5 right-10 text-neutral-400 text-3xl cursor-pointer hover:text-neutral-200"
              title="Close"
            >
              ✕
            </span>

            <JournalEntryAnalysis data={analysisData} />

            {/* Analyze Input Area */}
            <div className="pt-2 bg-neutral-900">
              <div className="flex items-end space-x-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      input.trim() && router.push({
                        pathname: '/analyze',
                        query: { prompt: encodeURIComponent(input) }
                      });
                    }
                  }}
                  placeholder="Ask about your journal entry..."
                  className="flex-1 bg-neutral-800/50 p-3 rounded resize-none focus:outline-none
                 min-h-[44px] max-h-32 overflow-y-auto border border-neutral-700"
                  style={{ lineHeight: '20px', height: '44px', minHeight: '44px' }}
                  onInput={(e) => {
                    const textarea = e.target;
                    textarea.style.height = '44px';
                    textarea.style.height = `${Math.max(
                      textarea.scrollHeight,
                      44
                    )}px`;
                  }}
                />
                <button
                  onClick={() => input.trim() && router.push({
                    pathname: '/analyze',
                    query: { prompt: encodeURIComponent(input) }
                  })}
                  disabled={!input.trim()}
                  className="bg-neutral-800/50 p-3 rounded hover:bg-neutral-800 transition-colors
                 disabled:opacity-50 disabled:hover:bg-neutral-800"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
            </div>


          </div>
        </div>
      )}

    </div>
  );
};

// Redirect users to login page if not signed in
export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default NewEntry;