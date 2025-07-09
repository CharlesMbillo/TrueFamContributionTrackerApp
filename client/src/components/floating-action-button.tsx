import { Plus } from 'lucide-react';
import { useState } from 'react';
import ManualEntryDialog from './manual-entry-dialog';

export default function FloatingActionButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsDialogOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-accent text-white rounded-full fab flex items-center justify-center hover:bg-accent/90 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
      
      <ManualEntryDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
      />
    </>
  );
}
