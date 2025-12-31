import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import ExerciseForm from './ExerciseForm'
import ExerciseList from './ExerciseList'

function DayModal({ date, log, onSave, onDelete, onClose }) {
  const [workoutCompleted, setWorkoutCompleted] = useState(false)
  const [nutritionCompleted, setNutritionCompleted] = useState(false)
  const [notes, setNotes] = useState('')
  const [exercises, setExercises] = useState([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (log) {
      setWorkoutCompleted(log.workout_completed || false)
      setNutritionCompleted(log.nutrition_completed || false)
      setNotes(log.notes || '')
      setExercises(log.exercises || [])
    } else {
      setWorkoutCompleted(false)
      setNutritionCompleted(false)
      setNotes('')
      setExercises([])
    }
  }, [log])

  const handleSave = async () => {
    setSaving(true)
    try {
      await onSave({
        date: format(date, 'yyyy-MM-dd'),
        workout_completed: workoutCompleted,
        nutrition_completed: nutritionCompleted,
        notes,
        exercises
      })
      onClose()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('¿Eliminar este día?')) return

    try {
      await onDelete(format(date, 'yyyy-MM-dd'))
      onClose()
    } catch (error) {
      console.error('Error deleting:', error)
      alert('Error al eliminar')
    }
  }

  const addExercise = (exercise) => {
    setExercises([...exercises, exercise])
  }

  const removeExercise = (index) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white capitalize">
              {format(date, "EEEE d 'de' MMMM", { locale: es })}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Toggles */}
          <div className="space-y-4 mb-6">
            <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
              <span className="text-white">Completé la rutina de gimnasio</span>
              <input
                type="checkbox"
                checked={workoutCompleted}
                onChange={(e) => setWorkoutCompleted(e.target.checked)}
                className="w-6 h-6 accent-green-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl cursor-pointer">
              <span className="text-white">Completé la alimentación</span>
              <input
                type="checkbox"
                checked={nutritionCompleted}
                onChange={(e) => setNutritionCompleted(e.target.checked)}
                className="w-6 h-6 accent-blue-500"
              />
            </label>
          </div>

          {/* Exercises */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Ejercicios</h3>
            <ExerciseList exercises={exercises} onRemove={removeExercise} />
            <div className="mt-4">
              <ExerciseForm onAdd={addExercise} />
            </div>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <h3 className="text-white font-medium mb-3">Notas</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notas del día..."
              rows={3}
              className="w-full bg-black/20 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-medium transition-colors"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            {log && (
              <button
                onClick={handleDelete}
                className="px-4 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-3 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DayModal
