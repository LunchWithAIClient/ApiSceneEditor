import CastItem from '../CastItem';

export default function CastItemExample() {
  const mockCast = {
    cast_id: "1",
    scene_id: "scene-1",
    role: "Detective",
    goal: "Solve the mystery and get paid.",
    start: "The detective sits behind his desk, feet up, reading the sports page."
  };

  return (
    <div className="p-8 max-w-2xl">
      <CastItem
        cast={mockCast}
        onEdit={(cast) => console.log('Edit cast:', cast)}
        onDelete={(id) => console.log('Delete cast:', id)}
      />
    </div>
  );
}
