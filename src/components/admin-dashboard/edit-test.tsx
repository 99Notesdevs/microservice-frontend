import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { SimpleTestForm } from '@/components/testUtils/testForm'
import { api } from '@/api/route'

interface TestFormData {
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
  id?: number
}


export default function EditTest() {
  const router = useNavigate()
  const params = useParams()
  const [testData, setTestData] = useState<TestFormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await api.get(`/test/${params.id}`)
        const typedResponse = response as { success: boolean; data: any }
        
        if (!typedResponse.success) throw new Error('Failed to fetch test')
        const data = typedResponse.data
        setTestData(data)
      } catch (error) {
        console.error('Error fetching test:', error)
        router('/admin/testForms')
      } finally {
        setLoading(false)
      }
    }

    fetchTest()
  }, [params.id, router])

  const handleSubmit = async (data: TestFormData) => {
    try {
      const response = await api.put(`/test/${params.id}`, data)
      const typedResponse = response as { success: boolean; data: any }
      
      if (!typedResponse.success) throw new Error('Failed to update test')
      
      setTimeout(() => {
        router('/admin/testForms')
      }, 2000)
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error:', error)
      return Promise.reject(error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
            <div className="text-center mb-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Loading Test</h2>
              <p className="text-gray-600">Fetching test details...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!testData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Edit Test</h1>
            <p className="text-gray-600 text-lg">Update test details below</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <SimpleTestForm
              onSubmit={handleSubmit}
              initialData={testData}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
