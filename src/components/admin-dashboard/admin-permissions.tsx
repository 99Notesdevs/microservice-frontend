import React, { useState, useEffect } from 'react';
import { api } from '@/api/route'

interface XpStatus {
  rating: number;
  status: string;
  xp: number;
}

// interface ProgressConstraints {
//   id: number;
//   weakLimit: number;
//   strongLimit: number;
//   xp_status: XpStatus[];
// }

const AdminPermissions: React.FC = () => {
//   const [constraints, setConstraints] = useState<ProgressConstraints | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    weakLimit: 0,
    strongLimit: 0,
  });
  const [xpStatuses, setXpStatuses] = useState<XpStatus[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [newStatus, setNewStatus] = useState<Omit<XpStatus, 'xp'>>({ 
    rating: 0, 
    status: 'Weak' 
  });

  useEffect(() => {
    const fetchConstraints = async () => {
      try {
        const response = await api.get(`/progressConstraints`)
        const typedResponse = response as { success: boolean; data: any }
        if (!typedResponse.success) {
          throw new Error('Failed to fetch constraints');
        }

        const { data } = typedResponse;
        if (data) {
          // setConstraints(data.data);
          setFormData({
            weakLimit: data.weakLimit,
            strongLimit: data.strongLimit,
          });
          setXpStatuses(JSON.parse(data.xp_status) || []);
        }
      } catch (error) {
        console.error('Error fetching constraints:', error);
        alert('Failed to load progress constraints');
      } finally {
        setLoading(false);
      }
    };

    fetchConstraints();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numValue = Number(value);
    
    setFormData(prev => ({
      ...prev,
      [name]: numValue
    }));
  };

  // Add a new status
  const addStatus = () => {
    if (newStatus.rating <= 0) {
      alert('Rating must be greater than 0');
      return;
    }
    
    const xpValue = (xpStatuses.length + 1) * 100; // Auto-calculate XP
    const updatedStatuses = [
      ...xpStatuses,
      { ...newStatus, xp: xpValue }
    ].sort((a, b) => a.rating - b.rating); // Sort by rating
    
    setXpStatuses(updatedStatuses);
    setNewStatus({ rating: 0, status: 'Weak' });
  };

  // Update an existing status
  const updateStatus = () => {
    if (editingIndex === null) return;
    
    const updatedStatuses = [...xpStatuses];
    updatedStatuses[editingIndex] = { 
      ...newStatus, 
      xp: xpStatuses[editingIndex].xp 
    };
    
    setXpStatuses(updatedStatuses.sort((a, b) => a.rating - b.rating));
    setEditingIndex(null);
    setNewStatus({ rating: 0, status: 'Weak' });
  };

  // Delete a status
  const deleteStatus = (index: number) => {
    if (window.confirm('Are you sure you want to delete this status?')) {
      const updatedStatuses = xpStatuses.filter((_, i) => i !== index);
      setXpStatuses(updatedStatuses);
    }
  };

  // Edit a status
  const editStatus = (index: number) => {
    setEditingIndex(index);
    const { xp, ...status } = xpStatuses[index];
    setNewStatus(status);
  };

  // Handle input changes for new status
  const handleNewStatusChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStatus(prev => ({
      ...prev,
      [name]: name === 'rating' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.weakLimit >= formData.strongLimit) {
      alert('Weak limit must be less than strong limit');
      return;
    }

    setSaving(true);
    
    try {
      const response = await api.post(`/progressConstraints`, {
        ...formData,
        xp_status: JSON.stringify(xpStatuses)
      })
      const typedResponse = response as { success: boolean; data: any }
      if (!typedResponse.success) throw new Error("Failed to update constraints");

      alert('Progress constraints updated successfully');
    } catch (error) {
      console.error('Error updating constraints:', error);
      alert(error instanceof Error ? error.message : 'Failed to update constraints');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Progress Constraints Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
        {/* Limits Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Progress Limits</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="weakLimit">
                Weak Limit
              </label>
              <input
                type="number"
                id="weakLimit"
                name="weakLimit"
                value={formData.weakLimit}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min="0"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="strongLimit">
                Strong Limit
              </label>
              <input
                type="number"
                id="strongLimit"
                name="strongLimit"
                value={formData.strongLimit}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                min={formData.weakLimit + 1}
                required
              />
            </div>
          </div>
        </div>

        {/* XP Status Management */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">XP Status Levels</h2>
          
          {/* Add/Edit Form */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-medium mb-3">
              {editingIndex !== null ? 'Edit Status' : 'Add New Status'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Rating</label>
                <input
                  type="number"
                  name="rating"
                  value={newStatus.rating}
                  onChange={handleNewStatusChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0"
                  placeholder="Enter rating"
                />
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-1">Status</label>
                <select
                  name="status"
                  value={newStatus.status}
                  onChange={handleNewStatusChange}
                  className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="Weak">Weak</option>
                  <option value="Strong">Strong</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={editingIndex !== null ? updateStatus : addStatus}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                >
                  {editingIndex !== null ? 'Update Status' : 'Add Status'}
                </button>
                {editingIndex !== null && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingIndex(null);
                      setNewStatus({ rating: 0, status: 'Weak' });
                    }}
                    className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* XP Status Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-3 px-4 text-left">Rating</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">XP</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {xpStatuses.length > 0 ? (
                  xpStatuses.map((status, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="py-3 px-4">{status.rating}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          status.status === 'Weak' 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {status.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">{status.xp}</td>
                      <td className="py-3 px-4 text-right space-x-2">
                        <button
                          onClick={() => editStatus(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => deleteStatus(index)}
                          className="text-red-600 hover:text-red-800 ml-2"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-4 text-center text-gray-500">
                      No status levels added yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || xpStatuses.length === 0}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline ${
              saving || xpStatuses.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPermissions;