import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { supabase } from '../lib/supabase'
import { getLogs, saveLog, deleteLog, getStats } from '../lib/api'
import Calendar from '../components/Calendar'
import DayModal from '../components/DayModal'
import Stats from '../components/Stats'

function Dashboard({ session }) {
  const [logs, setLogs] = useState([])
  const [stats, setStats] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [calendarView, setCalendarView] = useState('month')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [logsData, statsData] = await Promise.all([
        getLogs(),
        getStats()
      ])
      setLogs(logsData.logs || [])
      setStats(statsData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectDay = (date) => {
    setSelectedDate(date)
  }

  const handleSaveLog = async (logData) => {
    await saveLog(logData)
    await loadData()
  }

  const handleDeleteLog = async (date) => {
    await deleteLog(date)
    await loadData()
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const selectedLog = selectedDate
    ? logs.find(log => log.date === format(selectedDate, 'yyyy-MM-dd'))
    : null

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <header className="flex items-center justify-between py-4 mb-6">
          <h1 className="text-2xl font-bold">Gym Tracker</h1>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white border border-gray-600 hover:border-red-500 px-4 py-2 rounded-lg transition-colors"
          >
            Salir
          </button>
        </header>

        {/* Stats */}
        <div className="mb-6">
          <Stats stats={stats} />
        </div>

        {/* Calendar */}
        <Calendar
          logs={logs}
          onSelectDay={handleSelectDay}
          view={calendarView}
          onViewChange={setCalendarView}
        />

        {/* Day Modal */}
        {selectedDate && (
          <DayModal
            date={selectedDate}
            log={selectedLog}
            onSave={handleSaveLog}
            onDelete={handleDeleteLog}
            onClose={() => setSelectedDate(null)}
          />
        )}
      </div>
    </div>
  )
}

export default Dashboard
