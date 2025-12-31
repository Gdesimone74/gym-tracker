function ExerciseList({ exercises, onRemove }) {
  if (!exercises || exercises.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        No hay ejercicios registrados
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {exercises.map((exercise, index) => (
        <div
          key={index}
          className="flex items-center justify-between bg-black/20 rounded-lg px-4 py-3"
        >
          <div>
            <span className="text-white font-medium">{exercise.name}</span>
            <span className="text-gray-400 ml-3">
              {exercise.sets}x{exercise.reps} @ {exercise.weight}kg
            </span>
          </div>
          <button
            onClick={() => onRemove(index)}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}

export default ExerciseList
