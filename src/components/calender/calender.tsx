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
  type?: 'event' | 'todo';
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
  const [newTodo, setNewTodo] = useState('');
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

  // Handle adding a new todo
  const handleAddTodo = async () => {
    if (!newTodo.trim() || !selectedDate) return;
    
    const { date, month, year } = formatDateToBackend(selectedDate);
    const todoData = {
      userId: Number(userId),
      date,
      month,
      year,
      event: newTodo.trim(),
      status: 'pending',
      type: 'todo'
    };

    try {
      await calendarApi.createEvent(todoData);
      await fetchData();
      setNewTodo('');
    } catch (error) {
      console.error('Error adding todo:', error);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      // Optimistically update the UI
      setEvents(prevEvents => prevEvents.filter(event => event.id !== todoId));
      
      // Then make the API call
      await calendarApi.deleteEvent(todoId);
      
      // Refresh data to ensure consistency
      await fetchData();
    } catch (error) {
      console.error('Error deleting todo:', error);
      // Revert the UI if there's an error
      fetchData().catch(console.error);
    }
  };

  const toggleTodoStatus = async (todo: CalendarEvent) => {
    const newStatus = todo.status === 'completed' ? 'pending' : 'completed';
    
    try {
      await calendarApi.updateEvent(todo.id, {
        ...todo,
        status: newStatus
      });
      await fetchData();
    } catch (error) {
      console.error('Error updating todo status:', error);
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

  // Filter events to only show todos for the selected date
  const getEventsForSelectedDate = useCallback(() => {
    if (!selectedDate) return [];
    return events.filter(event => {
      const eventDate = new Date(event.year, event.month - 1, event.date);
      return (
        eventDate.getDate() === selectedDate.getDate() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getFullYear() === selectedDate.getFullYear()
      );
    });
  }, [selectedDate, events]);

  // Filter out events with invalid dates first
  const validEvents = events.filter(event => {
    if (!event || !event.id) {
      console.error('Skipping invalid event (missing id):', event);
      return false;
    }
    const eventDate = new Date(event.year, event.month - 1, event.date);
    const isValid = !isNaN(eventDate.getTime());
    if (!isValid) {
      console.error('Skipping invalid event date:', event);
    }
    return isValid;
  });

  console.log('Valid events to display:', validEvents);

  // Filter out invalid events first
  const validCalendarEvents = validEvents.filter(event => {
    if (isNaN(event.year) || isNaN(event.month) || isNaN(event.date)) {
      console.error('Skipping event with invalid date components:', event);
      return false;
    }
    
    const eventDate = new Date(event.year, event.month - 1, event.date);
    if (isNaN(eventDate.getTime())) {
      console.error('Skipping event with invalid date:', event);
      return false;
    }
    
    return true;
  });

  // Format valid events for the calendar
  const calendarEvents = validCalendarEvents.map(event => {
    console.log('Processing valid event:', event);
    
    const eventDate = new Date(event.year, event.month - 1, event.date);
    const formattedDate = format(eventDate, 'yyyy-MM-dd');
    const isCompleted = event.status === 'completed';
    
    // Add checkmark directly to the title for better compatibility
    const displayTitle = event.type === 'todo' && isCompleted 
      ? `✓ ${event.event || 'Untitled'}`
      : event.event || 'Untitled';
    
    return {
      id: event.id.toString(),
      title: displayTitle,
      start: formattedDate,
      end: formattedDate,
      withTime: false,
      classes: [
        'sx__event',
        event.type === 'todo' ? 'todo-item' : 'regular-event',
        `event-${event.status || 'pending'}`,
        isCompleted ? 'completed-todo' : ''
      ].filter(Boolean).join(' '),
      'data-status': event.status,
      'data-type': event.type || 'event',
      'data-description': event.description || '',
      'data-completed': isCompleted ? 'true' : 'false',
      'data-event-id': event.id
    };
  });

  console.log('All valid calendar events:', calendarEvents);
  
  // Log the calendar configuration
  console.log('Calendar config:', {
    hasEvents: calendarEvents.length > 0,
    eventCount: calendarEvents.length,
    firstEvent: calendarEvents[0]
  });

  // Log calendar configuration
  console.log('Initializing calendar with config:', {
    eventCount: calendarEvents.length,
    hasEventsService: !!eventsService,
    defaultView: 'monthGrid'
  });

  // Custom event component with checkbox
  const CustomEvent = ({ event }: { event: any }) => {
    const eventData = events.find(e => e.id.toString() === event.id);
    
    if (!eventData) return null;
    
    return (
      <div className="flex items-start w-full">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            if (eventData) {
              toggleTodoStatus(eventData);
            }
          }}
          className="mt-0.5 mr-1 flex-shrink-0"
          aria-label={eventData.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
        >
          <div className={`w-4 h-4 rounded border ${eventData.status === 'completed' 
            ? 'bg-green-500 border-green-500 flex items-center justify-center' 
            : 'border-gray-300'}`}>
            {eventData.status === 'completed' && (
              <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </button>
        <span className={`truncate text-sm ${eventData.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {event.title}
        </span>
      </div>
    );
  };

  // Initialize calendar with valid events
  const calendar = useCalendarApp({
    views: [createViewMonthGrid()],
    events: calendarEvents,
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
          // Toggle todo status when clicking on the event
          toggleTodoStatus(eventData);
        }
      },
      onEventUpdate: () => {
        console.log('Calendar events updated');
        if (calendar) {
          console.log('Current calendar events:', calendar.events);
        }
      }
    },
  });

  // Add click handler to date cells
  useEffect(() => {
    // This runs after the calendar is rendered
    const handleDateCellClick = (e: Event) => {
      const target = e.target as HTMLElement;
      const dateCell = target.closest('.sx__month-grid-day, .sx__month-grid-day--current-month');
      
      if (dateCell && !target.closest('.sx__event')) {
        const dateStr = dateCell.getAttribute('data-date');
        if (dateStr) {
          console.log('Date cell clicked:', dateStr);
          setSelectedDate(new Date(dateStr));
          setIsModalOpen(true);
        }
      }
    };

    // Add click listener to the calendar container
    const calendarContainer = document.querySelector('.schedule-x-calendar');
    if (calendarContainer) {
      calendarContainer.addEventListener('click', handleDateCellClick as EventListener);
    }

    return () => {
      if (calendarContainer) {
        calendarContainer.removeEventListener('click', handleDateCellClick as EventListener);
      }
    };
  }, []);

  // Update event styles based on status
  useEffect(() => {
    const updateEventStyles = () => {
      document.querySelectorAll('.sx__event').forEach(eventEl => {
        const eventId = eventEl.getAttribute('data-event-id');
        if (!eventId) return;
        
        const eventData = events.find(e => e.id === eventId);
        if (!eventData) return;
        
        // Update the event content with a checkbox and text
        const contentEl = eventEl.querySelector('.sx__event-content') as HTMLElement;
        if (contentEl) {
          contentEl.innerHTML = `
            <div class="flex items-center">
              <div class="w-4 h-4 rounded border mr-2 flex-shrink-0 ${
                eventData.status === 'completed' 
                  ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                  : 'border-gray-300'
              }">
                ${eventData.status === 'completed' ? '✓' : ''}
              </div>
              <span class="truncate ${eventData.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}">
                ${eventData.event || 'Untitled'}
              </span>
            </div>
          `;
          
          // Add click handler to the checkbox
          const checkbox = contentEl.querySelector('div');
          if (checkbox) {
            checkbox.addEventListener('click', (e: Event) => {
              e.stopPropagation();
              toggleTodoStatus(eventData);
            });
          }
        }
      });
    };

    // Run initially and after events update
    updateEventStyles();
    
    // Also run after a short delay to ensure the calendar is fully rendered
    const timer = setTimeout(updateEventStyles, 500);
    
    return () => clearTimeout(timer);
  }, [events]);

  // Update events when they change
  useEffect(() => {
    if (calendar) {
      // Create a deep copy of events to force re-render
      const currentEvents = JSON.parse(JSON.stringify(calendarEvents));
      calendar.events.set(currentEvents);
      
      // Update the DOM directly for completed todos
      setTimeout(() => {
        document.querySelectorAll('.sx__event').forEach(eventEl => {
          const eventId = eventEl.getAttribute('data-event-id');
          if (!eventId) return;
          
          const event = events.find(e => e.id === eventId);
          if (!event) return;
          
          const isCompleted = event.status === 'completed';
          const contentEl = eventEl.querySelector('.sx__event-content');
          
          if (contentEl) {
            // Only update if the content doesn't match the expected state
            const hasCheckmark = contentEl.textContent?.includes('✓');
            if (isCompleted && !hasCheckmark) {
              contentEl.textContent = `✓ ${event.event || 'Untitled'}`.trim();
            } else if (!isCompleted && hasCheckmark) {
              contentEl.textContent = event.event || 'Untitled';
            }
          }
        });
      }, 100);
    }
  }, [calendarEvents, calendar, events]);

  return (
    <div className="calendar-wrapper">
      <style dangerouslySetInnerHTML={{ __html: calendarStyles }} />
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

      {/* Add Todo Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {formatDateForDisplay(selectedDate)}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-500 mb-4">
              {getEventsForSelectedDate().length} todos for this day
            </div>
            
            {/* Todo List */}
            <div className="space-y-2 max-h-48 overflow-y-auto mb-4 pr-2">
              {getEventsForSelectedDate().map(todo => (
                <div 
                  key={todo.id} 
                  className={`flex items-start p-3 rounded-lg transition-colors ${todo.status === 'completed' ? 'bg-green-50' : 'bg-gray-50 hover:bg-gray-100'}`}
                >
                  <button 
                    onClick={() => toggleTodoStatus(todo)}
                    className="mt-0.5 mr-3 flex-shrink-0"
                    aria-label={todo.status === 'completed' ? 'Mark as pending' : 'Mark as completed'}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 ${todo.status === 'completed' 
                      ? 'bg-green-500 border-green-500 flex items-center justify-center' 
                      : 'border-gray-300'}`}>
                      {todo.status === 'completed' && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium ${todo.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {todo.event}
                    </div>
                    {todo.description && (
                      <div className="text-sm text-gray-500 mt-1">{todo.description}</div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-2">
                    <button 
                      onClick={() => handleDeleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                      aria-label="Delete todo"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              {getEventsForSelectedDate().length === 0 && (
                <div className="text-center text-gray-400 py-4">
                  No todos for this day
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Todo
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="What needs to be done?"
                    className="flex-1 border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
                    autoFocus
                  />
                  <button
                    onClick={handleAddTodo}
                    disabled={!newTodo.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
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
    min-height: 500px;
    width: 100%;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  /* Make header row more compact */
  .sx__month-grid-header {
    height: 32px !important;
  }
  
  /* Make header cells more compact */
  .sx__month-grid-header-cell {
    padding: 4px 8px !important;
    font-size: 12px !important;
  }
  
  /* Make day cells more compact */
  .sx__month-grid-day {
    min-height: 80px !important;
  }
  
  .sx__event {
    margin: 2px 0;
    padding: 4px 6px 4px 22px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    cursor: pointer;
    position: relative;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  
  .sx__event.todo-item {
    background-color: #f0f9ff;
    border-left: 3px solid #0ea5e9;
    padding-left: 25px;
  }
  
  .sx__event.completed-todo {
    text-decoration: line-through;
    color: #6b7280;
    background-color: #f3f4f6;
    position: relative;
  }
  
  .sx__event.completed-todo::before {
    content: '✓';
    position: absolute;
    left: 6px;
    top: 50%;
    transform: translateY(-50%);
    color: #10b981;
    font-weight: bold;
    font-size: 14px;
    z-index: 1;
  }
  
  /* Ensure the checkmark is visible in the calendar grid */
  .sx__month-grid-event {
    min-height: 24px;
    display: flex;
    align-items: center;
  }
  
  .sx__event {
    transition: all 0.2s ease;
    background-color: #f8fafc;
    border: 1px solid #e2e8f0;
  }
  
  .sx__event:hover {
    background-color: #f1f5f9;
    transform: translateX(2px);
  }
  
  .todo-item {
    background-color: #f0fdf4;
    border-left: 3px solid #10b981;
    margin: 2px 0;
    padding: 4px 8px;
    border-radius: 4px;
  }
  
  .regular-event {
    background-color: #eff6ff;
    border-left: 3px solid #3b82f6;
  }
  
  .sx__month-grid-day {
    min-height: 120px;
    border: 1px solid #e5e7eb;
    padding: 4px;
    overflow: hidden;
    background-color: #fff;
  }
  
  .sx__month-grid-day--current-month {
    background-color: #fff;
  }
  
  .sx__month-grid-day--today {
    background-color: #f0f9ff;
    font-weight: bold;
  }
  
  .sx__month-grid-day-number {
    font-weight: 500;
    text-align: center;
    margin-bottom: 4px;
    padding: 4px;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
  
  .sx__month-grid-day--today .sx__month-grid-day-number {
    background-color: #3b82f6;
    color: white;
  }
  
  .sx__month-grid-day-events {
    max-height: 90px;
    overflow-y: auto;
    padding-right: 2px;
  }
  
  .sx__month-grid-day-events::-webkit-scrollbar {
    width: 4px;
  }
  
  .sx__month-grid-day-events::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 4px;
  }
  
  .sx__month-grid-day--not-in-month {
    opacity: 0.5;
  }
  
  /* Style for calendar events */
  .sx__event {
    cursor: pointer;
    padding: 4px 6px;
    border-radius: 6px;
    font-size: 0.8rem;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    transition: all 0.2s ease;
    position: relative;
    padding-left: 8px;
  }
  
  .sx__event:before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    flex-shrink: 0;
  }
  
  .event-pending {
    background-color: #fef3c7;
    color: #92400e;
  }
  
  .event-pending:before {
    background-color: #f59e0b;
  }
  
  .event-completed {
    background-color: #dcfce7;
    color: #166534;
    text-decoration: line-through;
    opacity: 0.9;
  }
  
  .event-completed:before {
    background-color: #10b981;
  }
  
  .event-in-progress {
    background-color: #dbeafe;
    color: #1e40af;
  }
  
  .event-in-progress:before {
    background-color: #3b82f6;
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