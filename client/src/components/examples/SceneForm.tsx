import { useState } from 'react';
import SceneForm from '../SceneForm';
import { Button } from '@/components/ui/button';

export default function SceneFormExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Scene Form</Button>
      <SceneForm
        open={open}
        onOpenChange={setOpen}
        onSave={(scene) => console.log('Scene saved:', scene)}
      />
    </div>
  );
}
