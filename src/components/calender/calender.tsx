import { useState, useEffect, useRef } from 'react';
import { useCalendarApp, ScheduleXCalendar } from '@schedule-x/react';
import { createViewMonthGrid } from '@schedule-x/calendar';
import { createEventsServicePlugin } from '@schedule-x/events-service';
import '@schedule-x/theme-default/dist/index.css';
import { format, isSameDay } from 'date-fns';

interface Todo {
  id: string;
  title: string;
  date: string;
  completed: boolean;
}

interface CalendarProps {
  events?: Array<{
    id: string;
    title: string;
    start: string;
    end: string;
  }>;
  userId?: string;
}

function Calendar({ events = [], userId }: CalendarProps) {
  const [eventsService] = useState(() => createEventsServicePlugin());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [newTodo, setNewTodo] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

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

  const handleAddTodo = () => {
    if (!newTodo.trim() || !selectedDate) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const newTodoItem: Todo = {
      id: Date.now().toString(),
      title: newTodo,
      date: formattedDate,
      completed: false,
    };

    setTodos([...todos, newTodoItem]);
    setNewTodo('');
  };

  const toggleTodo = (id: string) => {
    setTodos(todos.map(todo => 
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  // Initialize calendar
  const calendar = useCalendarApp({
    views: [createViewMonthGrid()],
    events: events || [],
    plugins: [eventsService],
    defaultView: 'monthGrid',
    callbacks: {
      onClickDate: (date: string) => {
        setSelectedDate(new Date(date));
        setIsModalOpen(true);
      },
    },
  });

  // Add todos as events to the calendar
  useEffect(() => {
    if (!calendar) return;

    // Convert todos to calendar events
    const todoEvents = todos.map(todo => ({
      id: `todo-${todo.id}`,
      title: todo.completed ? `✓ ${todo.title}` : todo.title,
      start: todo.date,
      end: todo.date,
      // Use class names for styling which we'll define in our CSS
      className: todo.completed ? 'todo-event todo-completed' : 'todo-event todo-pending'
    }));

    // Add all todo events to the calendar
    todoEvents.forEach(event => {
      calendar.events.add(event);
    });

    // Cleanup function to remove events when component unmounts or todos change
    return () => {
      todoEvents.forEach(event => {
        calendar.events.remove(event.id);
      });
    };
  }, [todos, calendar]);

  useEffect(() => {
    // Load todos from API when component mounts
    // This is where you would fetch todos for the user
    // fetch(`/api/calendar/user/${userId}`)
    //   .then(res => res.json())
    //   .then(data => setTodos(data));
  }, [userId]);

  return (
    <div className="w-full p-4">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
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

      {/* Add Todo Modal */}
      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-xl font-semibold mb-4">
              Add Todo for {selectedDate.toDateString()}
            </h3>
            <div className="flex mb-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Enter your todo..."
                className="flex-1 border rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTodo()}
              />
              <button
                onClick={handleAddTodo}
                className="bg-blue-500 text-white px-4 rounded-r-lg hover:bg-blue-600 transition-colors"
              >
                Add
              </button>
            </div>
            
            <div className="mt-4 max-h-60 overflow-y-auto">
              <h4 className="font-medium mb-2">Todos for this day:</h4>
              {selectedDate 
                ? todos.filter(todo => isSameDay(new Date(todo.date), selectedDate)).length === 0 
                  ? <p className="text-gray-500">No todos for this day</p> 
                  : <ul className="space-y-2">
                      {todos.filter(todo => isSameDay(new Date(todo.date), selectedDate)).map((todo) => (
                        <li key={todo.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={todo.completed}
                            onChange={() => toggleTodo(todo.id)}
                            className="mr-2 h-5 w-5 text-blue-500 rounded"
                          />
                          <span className={todo.completed ? 'line-through text-gray-400' : ''}>
                            {todo.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                : <p className="text-gray-500">No todos for this day</p>
              }
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
  
  /* Style for todo events */
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
  
  .todo-pending {
    background-color: #dbeafe;
    color: #1e40af;
  }
  
  .todo-completed {
    background-color: #e5e7eb;
    color: #6b7280;
    text-decoration: line-through;
  }
`;

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