import Calendar from '../components/calender/calender'
import React from 'react'


const CalendarPage: React.FC = () => {
  return (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4">
          <div className="bg-white rounded-xl shadow-sm min-h-[calc(100vh-180px)]">
            <Calendar />
          </div>
        </div>
      </main>
    </div>
  )
}

export default CalendarPage
