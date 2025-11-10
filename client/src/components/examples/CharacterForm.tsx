import { useState } from 'react';
import CharacterForm from '../CharacterForm';
import { Button } from '@/components/ui/button';

export default function CharacterFormExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Character Form</Button>
      <CharacterForm
        open={open}
        onOpenChange={setOpen}
        onSave={(char) => console.log('Character saved:', char)}
      />
    </div>
  );
}
