import Header from '../Header';

export default function HeaderExample() {
  return (
    <Header 
      apiKey="mock-api-key-123" 
      onManageApiKey={() => console.log('Manage API key clicked')}
    />
  );
}
