import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom';
import { api } from '@/api/route'

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
    if (!confirm('Are you sure you want to delete this test?')) return

    try {
      const response = await api.delete(`/test/${id}`)
      const typedResponse = response as { success: boolean; data: any }
      
      if (!typedResponse.success) throw new Error('Failed to delete test')
      
      setTests(tests.filter(test => test.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading test forms...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">Test Forms</h1>
            <Link
              to="/admin/addtest"
              className="bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
              Add New Test
            </Link>
          </div>

          {tests.length === 0 && !loading ? (
            <div className="text-center py-8 text-gray-500">
              No tests found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white rounded-lg shadow">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Correct
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wrong
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Not Attempted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tests.map((test) => (
                    <tr key={test.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {test.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {test.correctAttempted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {test.wrongAttempted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {test.notAttempted}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {test.timeTaken} seconds
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          to={`/admin/addtest/${test.id}`}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(test.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
