import SceneCard from '../SceneCard';

export default function SceneCardExample() {
  const mockScene = {
    scene_id: "1",
    name: "The Detective's Office",
    description: "You are in an office with a desk covered with the sports page of the newspaper. There are two chairs on the other side of the desk and a filing cabinet in the corner. On top of the filing cabinet is an old coffee machine. If it wasn't raining so hard you would open a window. The rain should have cooled things down but it's still hot."
  };

  return (
    <div className="p-8 max-w-md">
      <SceneCard
        scene={mockScene}
        onView={(id) => console.log('View scene:', id)}
        onEdit={(scene) => console.log('Edit scene:', scene)}
        onDelete={(id) => console.log('Delete scene:', id)}
      />
    </div>
  );
}
