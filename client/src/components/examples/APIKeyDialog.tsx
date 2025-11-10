import { useState } from 'react';
import APIKeyDialog from '../APIKeyDialog';
import { Button } from '@/components/ui/button';

export default function APIKeyDialogExample() {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="p-8">
      <Button onClick={() => setOpen(true)}>Open API Key Dialog</Button>
      <APIKeyDialog 
        open={open}
        onOpenChange={setOpen}
        currentApiKey=""
        onSave={(key) => console.log('API Key saved:', key)}
      />
    </div>
  );
}
