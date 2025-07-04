import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';
import { api } from '@/api/route';

interface Message {
  id?: string;
  type: 'global' | 'range';
  content: string;
  ratingS?: number;
  ratingE?: number;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewType, setViewType] = useState<'global' | 'range'>('global');
  const [selectedRange, setSelectedRange] = useState<{min: number, max: number} | null>(null);

  // Form state
  const [formData, setFormData] = useState<Omit<Message, 'id'>>({
    type: viewType,
    content: '',
    ratingS: viewType === 'range' ? selectedRange?.min : undefined,
    ratingE: viewType === 'range' ? selectedRange?.max : undefined,
  });

  // Define the rating ranges
  const RATING_RANGES = [
    { min: 0, max: 199 },
    { min: 200, max: 399 },
    { min: 400, max: 499 },
    { min: 500, max: 599 },
    { min: 600, max: 699 },
    { min: 700, max: 799 },
    { min: 800, max: 899 },
  ];

  // Add pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0
  });

  // Fetch messages based on view type and selected range
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { page, pageSize } = pagination;
      const skip = (page - 1) * pageSize;
      
      let typedResponse;
      
      if (viewType === 'global') {
        // Fetch global messages
        console.log('Fetching global messages...');
        const response = await api.get(`/admin-messages/global?skip=${skip}&take=${pageSize}`);
        console.log('Global messages response:', response);
        typedResponse = response as { success: boolean; data: any };
      } else if (viewType === 'range' && selectedRange) {
        // Calculate midpoint of the range for the API request
        const rangeMidpoint = Math.floor((selectedRange.min + selectedRange.max) / 2);
        console.log('Fetching range messages for:', selectedRange, 'Midpoint:', rangeMidpoint);
        
        const response = await api.get(`/admin-messages/rating/${rangeMidpoint}?skip=${skip}&take=${pageSize}`);
        console.log('Range messages response:', response);
        // Filter to ensure we only get messages for the exact range or overlapping ranges
        typedResponse = response as { success: boolean; data: any };
        if (typedResponse.data) {
          console.log('Raw messages before filtering:', typedResponse.data);
          typedResponse.data = typedResponse.data.filter((msg: Message) => {
            if (msg.type !== 'range') {
              console.log('Skipping non-range message');
              return false;
            }
            
            console.log('Message range:', { min: msg.ratingS, max: msg.ratingE });
            console.log('Selected range:', selectedRange);
            
            // For the 0-199 range, we need special handling
            if (selectedRange.min === 0 && selectedRange.max === 199) {
              // Include messages that start at 0 and end at or above 0
              // or messages that include any part of the 0-199 range
              if (!msg.ratingS || !msg.ratingE) {
                console.log('Skipping message with missing ratingS or ratingE');
                return false;
              }
              const isInRange = (msg.ratingS === 0 && msg.ratingE >= 0) || 
                             (msg.ratingS <= 199 && msg.ratingE >= 0);
              console.log('Special 0-199 range check:', isInRange);
              return isInRange;
            }
            
            // For other ranges, use the standard overlap check
            if (!msg.ratingS || !msg.ratingE) {
              console.log('Skipping message with missing ratingS or ratingE');
              return false;
            }
            const overlap = msg.ratingS <= selectedRange.max && msg.ratingE >= selectedRange.min;
            console.log('Message range overlaps with selected range:', overlap);
            return overlap;
          });
          console.log('Filtered messages:', typedResponse.data);
        }
      }
      
      if (typedResponse?.success) {
        console.log('Setting messages:', typedResponse.data);
        setMessages(typedResponse.data || []);
        // Update total count if available in the response
        if (typedResponse.data.length !== undefined) {
          setPagination(prev => ({
            ...prev,
            total: typedResponse.data.length
          }));
        } else {
          // Fallback to length of returned data if total not provided
          setPagination(prev => ({
            ...prev,
            total: typedResponse.data.length || 0
          }));
        }
      } else {
        console.log('No success in response or no data');
      }
    } catch (err) {
      console.error('Error in fetchMessages:', err);
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  };

  // Handle view type change
  const handleViewTypeChange = (type: 'global' | 'range') => {
    setViewType(type);
    setPagination(prev => ({ ...prev, page: 1 }));
    if (type === 'range' && !selectedRange) {
      // Default to first range if none selected
      setSelectedRange(RATING_RANGES[0]);
    }
  };

  // Handle range selection
  const handleRangeChange = (range: {min: number, max: number}) => {
    setSelectedRange(range);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Update fetch when pagination, view type, or selected range changes
  useEffect(() => {
    if (viewType === 'global' || (viewType === 'range' && selectedRange)) {
      fetchMessages();
    }
  }, [pagination.page, pagination.pageSize, viewType, selectedRange]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({
      ...prev,
      page: newPage
    }));
  };

  // Handle form submission (create/update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const messageData = {
        type: formData.type,
        content: formData.content,
        ...(formData.type === 'range' && {
          ratingS: formData.ratingS,
          ratingE: formData.ratingE
        })
      };

      if (currentMessage?.id) {
        // Update existing message
        const response = await api.put(`/admin-messages/${currentMessage.id}`, messageData);
        const typedResponse = response as { success: boolean; data: any };
        if (!typedResponse.success) {
          throw new Error('Failed to update message');
        }
      } else {
        // Create new message
        const response = await api.post('/admin-messages', messageData);
        const typedResponse = response as { success: boolean; data: any };
        if (!typedResponse.success) {
          throw new Error('Failed to create message');
        }
      }
      
      setIsModalOpen(false);
      fetchMessages(); // Refresh the messages list
    } catch (err) {
      setError('Failed to save message');
      console.error(err);
    }
  };

  // Handle delete message
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        const response = await api.delete(`/admin-messages/${id}`);
        const typedResponse = response as { success: boolean };
        if (typedResponse.success) {
          fetchMessages(); // Refresh the messages list
        } else {
          throw new Error('Failed to delete message');
        }
      } catch (err) {
        setError('Failed to delete message');
        console.error(err);
      }
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ratingS' || name === 'ratingE' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  // Open modal for editing
  const openEditModal = (message: Message) => {
    setCurrentMessage(message);
    setFormData({
      type: message.type,
      content: message.content,
      ratingS: message.ratingS,
      ratingE: message.ratingE,
    });
    setIsModalOpen(true);
  };

  // Reset form and close modal
  const resetForm = () => {
    setCurrentMessage(null);
    setFormData({
      type: viewType,
      content: '',
      ratingS: viewType === 'range' ? selectedRange?.min : undefined,
      ratingE: viewType === 'range' ? selectedRange?.max : undefined,
    });
    setIsModalOpen(false);
  };

  // Filter messages based on search term
  const filteredMessages = messages.filter(message =>
    message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (message.ratingS?.toString().includes(searchTerm) ?? false) ||
    (message.ratingE?.toString().includes(searchTerm) ?? false)
  );

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, []);

  // Add pagination controls to your JSX
  const PaginationControls = () => (
    <div className="flex justify-between items-center mt-4">
      <button
        onClick={() => handlePageChange(pagination.page - 1)}
        disabled={pagination.page === 1}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Previous
      </button>
      <span>Page {pagination.page}</span>
      <button
        onClick={() => handlePageChange(pagination.page + 1)}
        disabled={pagination.page * pagination.pageSize >= pagination.total}
        className="px-4 py-2 border rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Admin Messages</h2>
        <button
          onClick={() => {
            setCurrentMessage(null);
            setFormData({
              type: viewType,
              content: '',
              ratingS: viewType === 'range' ? selectedRange?.min : undefined,
              ratingE: viewType === 'range' ? selectedRange?.max : undefined,
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-600"
        >
          <FaPlus /> Add {viewType === 'global' ? 'Global' : 'Range'} Message
        </button>
      </div>

      {/* View type toggle */}
      <div className="flex mb-6 border-b">
        <button
          onClick={() => handleViewTypeChange('global')}
          className={`px-4 py-2 font-medium ${viewType === 'global' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Global Messages
        </button>
        <button
          onClick={() => handleViewTypeChange('range')}
          className={`px-4 py-2 font-medium ${viewType === 'range' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
        >
          Rating Range Messages
        </button>
      </div>

      {/* Range selector (only shown for range view) */}
      {viewType === 'range' && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Rating Range:</label>
          <div className="flex flex-wrap gap-2">
            {RATING_RANGES.map((range, index) => {
              // Calculate the display range (add 1 to min for display purposes)
              const displayMin = range.min === 0 ? 0 : range.min;
              const displayMax = range.max;
              
              return (
                <button
                  key={index}
                  onClick={() => handleRangeChange(range)}
                  className={`px-4 py-2 rounded-md ${
                    selectedRange?.min === range.min && selectedRange?.max === range.max
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {displayMin} - {displayMax}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${viewType} messages...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border rounded-md"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Messages table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating Range</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredMessages.map((message) => (
              <tr key={message.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {message.type.charAt(0).toUpperCase() + message.type.slice(1)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {message.content}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {message.type === 'range' 
                    ? `${message.ratingS} - ${message.ratingE}` 
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openEditModal(message)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => message.id && handleDelete(message.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <PaginationControls />

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">
                {currentMessage ? 'Edit Message' : 'Add New Message'}
              </h3>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="global">Global</option>
                    <option value="range">Rating Range</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    rows={4}
                    required
                  />
                </div>

                {formData.type === 'range' && (
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Rating Range</label>
                      <select
                        name="ratingS"
                        value={`${formData.ratingS}`}
                        onChange={(e) => {
                          const selectedRange = RATING_RANGES.find(
                            r => r.min === parseInt(e.target.value)
                          );
                          if (selectedRange) {
                            setFormData(prev => ({
                              ...prev,
                              ratingS: selectedRange.min,
                              ratingE: selectedRange.max
                            }));
                          }
                        }}
                        className="w-full p-2 border rounded-md"
                        required
                      >
                        <option value="">Select a range</option>
                        {RATING_RANGES.map((range, index) => (
                          <option key={index} value={range.min}>
                            {range.min} - {range.max}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {currentMessage ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}