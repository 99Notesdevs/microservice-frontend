import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/api/route'
import { FiEdit2, FiTrash2, FiPlus, FiLoader } from 'react-icons/fi'

interface TestFormData {
  id: number
  name: string
  correctAttempted: number
  wrongAttempted: number
  notAttempted: number
  partialAttempted?: number
  partialNotAttempted?: number
  partialWrongAttempted?: number
  timeTaken: number
  questionsSingle: number
  questionsMultiple?: number
  createdAt: string
  updatedAt: string
}

export default function TestForms() {
  const [tests, setTests] = useState<TestFormData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const response = await api.get(`/test`)
        const typedResponse = response as { success: boolean; data: any }
        
        if (!typedResponse.success) throw new Error('Failed to fetch tests')
        
        const { data } = typedResponse
        // Ensure data is an array
        if (Array.isArray(data)) {
          setTests(data)
        } else {
          console.error('Invalid response format:', data)
          throw new Error('Invalid response format from server')
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTests()
  }, [])

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this test? This action cannot be undone.')) return

    try {
      const response = await api.delete(`/test/${id}`)
      const typedResponse = response as { success: boolean; data: any }
      
      if (!typedResponse.success) throw new Error('Failed to delete test')
      
      setTests(tests.filter(test => test.id !== id))
      
      // Show success message
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up'
      toast.textContent = 'Test deleted successfully!'
      document.body.appendChild(toast)
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300')
        setTimeout(() => toast.remove(), 300)
      }, 3000)
      
    } catch (error) {
      console.error('Error:', error)
      // Show error message
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in-up'
      toast.textContent = 'Failed to delete test. Please try again.'
      document.body.appendChild(toast)
      
      // Remove toast after 3 seconds
      setTimeout(() => {
        toast.classList.add('opacity-0', 'transition-opacity', 'duration-300')
        setTimeout(() => toast.remove(), 300)
      }, 3000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
            <div className="flex flex-col items-center justify-center py-12">
              <FiLoader className="animate-spin h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-1">Loading Test Forms</h3>
              <p className="text-gray-500">Please wait while we fetch your data</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Test Management</h1>
              <p className="text-gray-500 mt-1">View and manage all test forms</p>
            </div>
            <Link
              to="/admin/addtest"
              className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              Create New Test
            </Link>
          </div>

          {tests.length === 0 && !loading ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">No tests found</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">Get started by creating a new test form to organize your questions and assessments.</p>
              <Link
                to="/admin/addtest"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Create Test
              </Link>
            </div>
          ) : (
            <div className="overflow-hidden border border-gray-200 rounded-xl shadow-sm">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Test Name
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="tooltip" data-tip="Correct Answers">
                          <span>✓</span>
                          <span className="sr-only">Correct</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="tooltip" data-tip="Wrong Answers">
                          <span>✗</span>
                          <span className="sr-only">Wrong</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="tooltip" data-tip="Not Attempted">
                          <span>—</span>
                          <span className="sr-only">Not Attempted</span>
                        </div>
                      </th>
                      <th scope="col" className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="relative px-6 py-3.5">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tests.map((test) => (
                      <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{test.name}</div>
                              <div className="text-xs text-gray-500">ID: {test.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {test.correctAttempted}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            {test.wrongAttempted}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            {test.notAttempted}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                          {test.timeTaken}s
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-3">
                            <Link
                              to={`/admin/addtest/${test.id}`}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit"
                            >
                              <FiEdit2 className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </Link>
                            <button
                              onClick={() => handleDelete(test.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <FiTrash2 className="h-5 w-5" />
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
