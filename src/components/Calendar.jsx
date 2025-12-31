import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'

function Calendar({ logs, onSelectDay, view, onViewChange }) {
  const [currentDate, setCurrentDate] = useState(new Date())

  const logsByDate = logs.reduce((acc, log) => {
    acc[log.date] = log
    return acc
  }, {})

  const getLogStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = logsByDate[dateStr]
    if (!log) return 'none'
    if (log.workout_completed && log.nutrition_completed) return 'complete'
    if (log.workout_completed || log.nutrition_completed) return 'partial'
    return 'none'
  }

  const statusColors = {
    complete: 'bg-green-500',
    partial: 'bg-yellow-500',
    none: 'bg-gray-700'
  }

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

    const days = []
    let day = startDate

    while (day <= endDate) {
      days.push(day)
      day = addDays(day, 1)
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'].map(d => (
          <div key={d} className="text-center text-gray-400 text-sm py-2">{d}</div>
        ))}
        {days.map((day, idx) => {
          const status = getLogStatus(day)
          const isCurrentMonth = isSameMonth(day, currentDate)

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(day)}
              className={`
                aspect-square flex flex-col items-center justify-center rounded-lg text-sm
                ${isCurrentMonth ? 'text-white' : 'text-gray-600'}
                ${isToday(day) ? 'ring-2 ring-blue-500' : ''}
                hover:bg-white/10 transition-colors
              `}
            >
              <span>{format(day, 'd')}</span>
              {isCurrentMonth && (
                <div className={`w-2 h-2 rounded-full mt-1 ${statusColors[status]}`} />
              )}
            </button>
          )
        })}
      </div>
    )
  }

  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
    const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

    return (
      <div className="space-y-2">
        {days.map((day, idx) => {
          const status = getLogStatus(day)
          const log = logsByDate[format(day, 'yyyy-MM-dd')]

          return (
            <button
              key={idx}
              onClick={() => onSelectDay(day)}
              className={`
                w-full p-4 rounded-lg flex items-center justify-between
                ${isToday(day) ? 'bg-blue-900/50 ring-2 ring-blue-500' : 'bg-white/5'}
                hover:bg-white/10 transition-colors
              `}
            >
              <div className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${statusColors[status]}`} />
                <div className="text-left">
                  <div className="text-white font-medium">
                    {format(day, 'EEEE', { locale: es })}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {format(day, 'd MMM', { locale: es })}
                  </div>
                </div>
              </div>
              {log && (
                <div className="flex gap-2">
                  {log.workout_completed && (
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Rutina</span>
                  )}
                  {log.nutrition_completed && (
                    <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">Dieta</span>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    )
  }

  const navigateMonth = (direction) => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1))
  }

  const navigateWeek = (direction) => {
    setCurrentDate(addDays(currentDate, direction === 'prev' ? -7 : 7))
  }

  const navigate = view === 'month' ? navigateMonth : navigateWeek

  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate('prev')} className="text-gray-400 hover:text-white p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-white text-xl font-semibold capitalize">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : "'Semana del' d MMM", { locale: es })}
          </h2>
          <div className="flex gap-2 justify-center mt-2">
            <button
              onClick={() => onViewChange('month')}
              className={`text-xs px-3 py-1 rounded ${view === 'month' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Mes
            </button>
            <button
              onClick={() => onViewChange('week')}
              className={`text-xs px-3 py-1 rounded ${view === 'week' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              Semana
            </button>
          </div>
        </div>

        <button onClick={() => navigate('next')} className="text-gray-400 hover:text-white p-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {view === 'month' ? renderMonthView() : renderWeekView()}

      <div className="flex justify-center gap-6 mt-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-400">Completo</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span className="text-gray-400">Parcial</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-700" />
          <span className="text-gray-400">Sin datos</span>
        </div>
      </div>
    </div>
  )
}

export default Calendar
