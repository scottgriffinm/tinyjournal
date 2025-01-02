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

  const handleDelete = () => {
    setEntry('');
    setShowDeleteDialog(false);
    router.push("/");
  };

  const handleSave = async () => {
    const shortSummary = entry.slice(0, 10);
    const longSummary = entry.slice(0, 20);

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
        router.push("/");
      } else {
        const errorData = await response.json();
        console.error('Error saving entry:', errorData.error);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  return (
    <div className="bg-neutral-900 min-h-screen text-neutral-300 font-mono relative">
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