import { useState, useEffect } from 'react'
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react'
import { createViewMonthGrid } from '@schedule-x/calendar'
import { createEventsServicePlugin } from '@schedule-x/events-service'
import '@schedule-x/theme-default/dist/index.css'

interface CalendarProps {
  events?: Array<{
    id: string
    title: string
    start: string
    end: string
  }>
}

function Calendar({ events = [] }: CalendarProps) {
  const [eventsService] = useState(() => createEventsServicePlugin())

  const calendar = useCalendarApp({
    views: [createViewMonthGrid()],
    events: events || [
      {
        id: '1',
        title: 'Event 1',
        start: '2023-12-16',
        end: '2023-12-16',
      }
    ],
    plugins: [eventsService]
  })
 
  useEffect(() => {
    // get all events
    eventsService.getAll()
  }, [eventsService])
 
  return (
    <div>
      <div className="schedule-x-calendar">
        <div className="calendar-container">
          <div className="calendar-content">
            <div className="calendar-view">
              <ScheduleXCalendar calendarApp={calendar} />
            </div>
          </div>
        </div>
      </div>
      </div>
  )
}
 
export default Calendar