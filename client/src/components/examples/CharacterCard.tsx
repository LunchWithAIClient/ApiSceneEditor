import CharacterCard from '../CharacterCard';

export default function CharacterCardExample() {
  const mockCharacter = {
    character_id: "1",
    name: "Steve Lugar",
    description: "You are a Private Detective straight out of a classic film noir or detective novel. You have walked these mean streets for a decade and have learned how to ask good questions and observe people's behavior.",
    motivation: "You are down on your luck and willing to take any job that comes your way. No matter how much you need a job you won't tangle with the mob."
  };

  return (
    <div className="p-8 max-w-md">
      <CharacterCard
        character={mockCharacter}
        onEdit={(char) => console.log('Edit character:', char)}
        onDelete={(id) => console.log('Delete character:', id)}
      />
    </div>
  );
}
