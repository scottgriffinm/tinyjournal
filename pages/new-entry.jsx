import React, { useState } from 'react';
import { useRouter } from "next/router";
import { Trash2, Save } from 'lucide-react';
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

const NewEntry = () => {
  const router = useRouter();
  const [entry, setEntry] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showAnalyzeDialog, setShowAnalyzeDialog] = useState(false); // New state for second dialog
  const [isSaving, setIsSaving] = useState(false); // New state for loader


  const handleDelete = () => {
    setEntry('');
    setShowDeleteDialog(false);
    router.push("/");
  };

  const handleSave = async () => {
    const shortSummary = entry.slice(0, 10);
    const longSummary = entry.slice(0, 20);

    setIsSaving(true); // Start loader
    try {
      const response = await fetch('/api/create-entry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: entry, shortSummary, longSummary }),
      });

      if (response.ok) {
        console.log('Entry successfully saved!');
        setEntry('');
        setShowSaveDialog(false);
        setShowAnalyzeDialog(true); // Show second dialog
      } else {
        const errorData = await response.json();
        console.error('Error saving entry:', errorData.error);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
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
          onClick={() => entry.trim() && setShowDeleteDialog(true)}
          className="bg-neutral-800/50 p-3 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50 border border-neutral-700"
          disabled={!entry.trim()}
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
        <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">delete entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              this action cannot be undone. this entry will be deleted forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600"
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
        <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">save entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">
              once saved, this entry cannot be modified. are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600"
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

      {/* Analyze Confirmation Dialog */}
      <AlertDialog open={showAnalyzeDialog} onOpenChange={setShowAnalyzeDialog}>
        <AlertDialogContent className="bg-neutral-800 text-neutral-300 border border-neutral-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-neutral-300">want to talk about your entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-400">you can analyze your entry or return to the main page.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-neutral-700 text-neutral-300 hover:bg-neutral-600 border border-neutral-600"
              onClick={() => {
                setShowAnalyzeDialog(false);
                router.push('/');
              }}
            >
              No
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-900 hover:bg-green-800 text-neutral-300 border border-green-800"
              onClick={() => {
                setShowAnalyzeDialog(false);
                router.push('/analyze?prompt=What%20do%20you%20think%20about%20my%20most%20recent%20entry?');
              }}
            >
              Yes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Redirect users to login page if not signed in
export async function getServerSideProps(context) {
  const { getSession } = await import('next-auth/react');
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