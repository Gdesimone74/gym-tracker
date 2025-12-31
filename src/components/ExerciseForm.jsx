import { useState } from 'react'

function ExerciseForm({ onAdd }) {
  const [name, setName] = useState('')
  const [sets, setSets] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    onAdd({
      name: name.trim(),
      sets: parseInt(sets) || 0,
      reps: parseInt(reps) || 0,
      weight: parseFloat(weight) || 0
    })

    setName('')
    setSets('')
    setReps('')
    setWeight('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="Nombre del ejercicio"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
      />
      <div className="grid grid-cols-3 gap-2">
        <input
          type="number"
          placeholder="Series"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
          className="bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          placeholder="Reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          className="bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          step="0.5"
          placeholder="Peso (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="bg-black/20 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
      >
        + Agregar ejercicio
      </button>
    </form>
  )
}

export default ExerciseForm
