import { useState, useEffect, useRef, useCallback } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { format } from 'date-fns';
import Cookies from 'js-cookie';
import { env } from '@/config/env';

const API_BASE_URL = env.API;

// Helper function to make API requests
const api = async (endpoint: string, options: RequestInit = {}) => {
  const token = Cookies.get('token');
  console.log('Making API call to:', `${API_BASE_URL}${endpoint}`);
  console.log('Auth token:', token ? 'Present' : 'Missing');
  
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });
    console.log('API Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};

// Calendar API functions
const calendarApi = {
  // Create a new calendar event
  createEvent: async (data: {
    userId: number;
    date: number;
    month: number;
    year: number;
    status?: string;
    event: string;
  }) => {
    console.log('Creating event:', data);
    const response = await api('/calendar', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    console.log('Event created:', response);
    return response;
  },

  // Get events for a specific user
  getEventsByUser: async (userId: number) => {
    console.log('Fetching events for user:', userId);
    const data = await api(`/calendar/user/${userId}`);
    console.log('Fetched events:', data);
    return data;
  },

  // Get events for a specific date
  getEventsByDate: async (userId: number, date: Date) => {
    console.log('Fetching events for user and date:', userId, date);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-indexed in JS
    const year = date.getFullYear();
    
    const data = await api(
      `/calendar/user/${userId}/date?date=${day}&month=${month}&year=${year}`
    );
    console.log('Fetched events:', data);
    return data;
  },

  // Update an existing event
  updateEvent: async (eventId: string, data: {
    userId?: number;
    date?: number;
    month?: number;
    year?: number;
    status?: string;
    event?: string;
  }) => {
    console.log('Updating event:', eventId, data);
    const response = await api(`/calendar/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    console.log('Event updated:', response);
    return response;
  },

  // Delete an event
  deleteEvent: async (eventId: string) => {
    console.log('Deleting event:', eventId);
    const response = await api(`/calendar/${eventId}`, {
      method: 'DELETE'
    });
    console.log('Event deleted:', response);
    return response;
  }
};

interface CalendarEvent {
  id: string;
  userId: number;
  date: number;
  month: number;
  year: number;
  status: string;
  event: string;
  type: 'event';
  createdAt?: string;
  updatedAt?: string;
  description?: string;
}



function Calendar() {
  const [eventsService] = useState(() => createEventsServicePlugin());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newEvent, setNewEvent] = useState({ title: '', description: '' });
  const modalRef = useRef<HTMLDivElement>(null);
  const userId = localStorage.getItem('userId');
  // Close modal when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date to match backend format (day, month, year as numbers)
  const formatDateToBackend = (date: Date) => ({
    date: date.getDate(),
    month: date.getMonth() + 1, // Months are 0-indexed in JS
    year: date.getFullYear()
  });

  // Fetch calendar events
  const fetchData = useCallback(async () => {
    console.log('fetchData called with userId:', userId);
    if (!userId) {
      console.log('No userId, skipping fetch');
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching events...');
      const calendarEvents = await calendarApi.getEventsByUser(Number(userId));
      console.log('Raw events from API:', JSON.stringify(calendarEvents, null, 2));
      
      const processedEvents = Array.isArray(calendarEvents) ? calendarEvents : [];
      console.log('Processed events:', processedEvents);
      
      // Log each event's date information
      processedEvents.forEach(event => {
        const eventDate = new Date(event.year, event.month - 1, event.date);
        console.log(`Event: ${event.event} - Date: ${eventDate.toISOString()}`);
      });
      
      setEvents(processedEvents);
    } catch (error) {
      console.error('Error in fetchData:', error);
      setEvents([]);
    } finally {
      console.log('Fetch complete, setting loading to false');
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    console.log('Current events state:', events);
    
    // Log the mapped calendar events
    if (calendar) {
      console.log('Calendar events:', calendar.events.get(Number(userId)));
    }
  }, [events]);

  // Initial data fetch with error boundary
  useEffect(() => {
    console.log('Component mounted or userId changed:', userId);
    fetchData();
  }, [fetchData, userId]);

  // Handle adding a new event
  const handleAddEvent = async () => {
    if (!newEvent.title.trim() || !selectedDate) return;

    try {
      const { date, month, year } = formatDateToBackend(selectedDate);
      
      const eventData = {
        userId: Number(userId),
        date,
        month,
        year,
        event: newEvent.title,
        status: 'pending',
      };

      await calendarApi.createEvent(eventData);
      await fetchData(); // Refresh events
      setNewEvent({ title: '', description: '' });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating event:', error);
    }
  };

  // Convert backend date format to JavaScript Date object
  const getDateFromBackendFormat = (event: CalendarEvent) => {
    // Note: month is 1-12 in backend, but 0-11 in JavaScript Date
    return new Date(event.year, event.month - 1, event.date);
  };

  // Format date for display
  const formatDateForDisplay = (date: Date) => {
    return format(date, 'MMMM d, yyyy');
  };

  // Initialize calendar
  const calendar = useCalendarApp({
    views: [createViewMonthGrid()],
    events: events.map(event => {
      // Create date in local timezone to avoid timezone issues
      const eventDate = new Date(event.year, event.month - 1, event.date);
      const formattedDate = format(eventDate, 'yyyy-MM-dd');
      
      console.log(`Mapping event: ${event.event} to date: ${formattedDate}`);
      
      return {
        id: event.id.toString(),
        title: event.event,
        start: formattedDate,
        end: formattedDate,
        className: 'calendar-event',
        'data-status': event.status,
        'data-description': event.description || ''
      };
    }),
    plugins: [eventsService],
    defaultView: 'monthGrid',
    callbacks: {
      onClickDate: (date: string) => {
        console.log('Date clicked:', date);
        setSelectedDate(new Date(date));
        setIsModalOpen(true);
      },
      onEventClick: (event: any) => {
        console.log('Event clicked:', event);
        const eventData = events.find(e => e.id.toString() === event.id);
        if (eventData) {
          const eventDate = new Date(eventData.year, eventData.month - 1, eventData.date);
          alert(
            `Event: ${eventData.event}\n` +
            `Date: ${formatDateForDisplay(eventDate)}\n` +
            `Status: ${eventData.status}`
          );
        }
      }
    },
  });

  return (
    <div className="w-full p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden relative" style={{ minHeight: '600px' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-80 flex items-center justify-center z-10">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-2"></div>
              <span className="text-gray-600">Loading calendar...</span>
            </div>
          </div>
        )}
        <div className="schedule-x-calendar h-full">
          <div className="calendar-container h-full">
            <div className="calendar-content h-full">
              <div className="calendar-view h-full">
                <ScheduleXCalendar calendarApp={calendar} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold mb-4">
              Add Event for {formatDateForDisplay(selectedDate)}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  placeholder="Enter event title"
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddEvent()}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  placeholder="Enter event description"
                  rows={3}
                  className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddEvent}
                  disabled={!newEvent.title.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Add custom styles for different event types
const calendarStyles = `
  .sx__month-grid {
    min-height: 600px;
    width: 100%;
  }
  
  .sx__month-grid-day {
    min-height: 120px;
    border: 1px solid #e5e7eb;
    padding: 4px;
    overflow: hidden;
  }
  
  .sx__month-grid-day--current-month {
    background-color: white;
  }
  
  .sx__month-grid-day--today {
    background-color: #f0f9ff;
  }
  
  .sx__month-grid-day-number {
    font-weight: 500;
    text-align: center;
    margin-bottom: 4px;
  }
  
  .sx__month-grid-day--not-in-month {
    opacity: 0.5;
  }
  
  /* Style for calendar events */
  .sx__event {
    cursor: pointer;
    padding: 2px 4px;
    border-radius: 4px;
    font-size: 0.75rem;
    margin-bottom: 2px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .event-event {
    background-color: #dbeafe;
    color: #1e40af;
  }
`;

// Add styles to the document head
if (typeof document !== 'undefined') {
  const existingStyle = document.getElementById('calendar-custom-styles');
  if (!existingStyle) {
    const styleElement = document.createElement('style');
    styleElement.id = 'calendar-custom-styles';
    styleElement.textContent = calendarStyles;
    document.head.appendChild(styleElement);
  }
}

export default Calendar;