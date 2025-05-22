import Calendar from '../components/calender/calender'
import React from 'react'


const CalendarPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
            <p className="text-gray-600 mt-1">Manage your schedule and tasks</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm min-h-[calc(100vh-180px)]">
            <Calendar />
          </div>
        </div>
      </main>
    </div>
  )
}

export default CalendarPage
