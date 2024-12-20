import React, { useState } from 'react';
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
  const [entry, setEntry] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const handleDelete = () => {
    setEntry('');
    setShowDeleteDialog(false);
  };

  const handleSave = () => {
    console.log('Entry saved:', entry);
    // Here you would typically save to your backend
    setShowSaveDialog(false);
  };

  return (
    <div className="bg-gray-900 min-h-screen text-gray-300 font-mono relative">
      {/* Floating buttons container */}
      <div className="absolute top-4 right-4 flex space-x-4 z-10">
        <button
          onClick={() => entry.trim() && setShowDeleteDialog(true)}
          className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          disabled={!entry.trim()}
        >
          <Trash2 className="w-5 h-5 text-gray-400" />
        </button>
        <button
          onClick={() => entry.trim() && setShowSaveDialog(true)}
          className="bg-gray-800 p-3 rounded hover:bg-gray-700 transition-colors disabled:opacity-50"
          disabled={!entry.trim()}
        >
          <Save className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Full-screen textarea */}
      <textarea
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
        placeholder="start typing..."
        className="w-full h-screen bg-gray-900 p-8 resize-none focus:outline-none"
        autoFocus
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 text-gray-300 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-300">delete entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              this action cannot be undone. this entry will be deleted forever.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
              onClick={() => setShowDeleteDialog(false)}
            >
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-900 hover:bg-red-800 text-gray-300 border-red-800"
              onClick={handleDelete}
            >
              delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent className="bg-gray-800 text-gray-300 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-300">save entry?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              once saved, this entry cannot be modified. are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="bg-gray-700 text-gray-300 hover:bg-gray-600 border-gray-600"
              onClick={() => setShowSaveDialog(false)}
            >
              cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-900 hover:bg-green-800 text-gray-300 border-green-800"
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

export default NewEntry;