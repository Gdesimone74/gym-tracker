function Stats({ stats }) {
  const items = [
    { label: 'Racha Rutina', value: stats?.workout_streak || 0, color: 'text-green-400' },
    { label: 'Racha Dieta', value: stats?.nutrition_streak || 0, color: 'text-blue-400' },
    { label: 'Total Rutinas', value: stats?.total_workouts || 0, color: 'text-green-400' },
    { label: 'Total Dietas', value: stats?.total_nutrition || 0, color: 'text-blue-400' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {items.map((item, idx) => (
        <div key={idx} className="bg-white/5 rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-gray-400 text-sm mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  )
}

export default Stats
