import { useState } from 'react';
import CastForm from '../CastForm';
import { Button } from '@/components/ui/button';

export default function CastFormExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open Cast Form</Button>
      <CastForm
        open={open}
        onOpenChange={setOpen}
        sceneId="mock-scene-id"
        onSave={(cast) => console.log('Cast saved:', cast)}
      />
    </div>
  );
}
