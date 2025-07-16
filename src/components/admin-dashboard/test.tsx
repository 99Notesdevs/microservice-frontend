import { useNavigate } from 'react-router-dom'
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


export default function AddTest() {
  const navigate = useNavigate()

  const handleSubmit = async (data: TestFormData) => {
    try {
      const response = await api.post(`/test`, data)
      const typedResponse = response as { success: boolean; data: any }

      if (!typedResponse.success) throw new Error('Failed to create test')
      
      
      
      // Navigate after modal is closed
      setTimeout(() => {
        navigate('/dashboard/testForms')
      }, 2000)
      
      return Promise.resolve()
    } catch (error) {
      console.error('Error:', error)
      return Promise.reject(error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 p-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Add New Test</h1>
            <p className="text-gray-600 text-lg">Enter test details below</p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <SimpleTestForm
              onSubmit={handleSubmit}
              initialData={{
                name: '',
                correctAttempted: 0,
                wrongAttempted: 0,
                notAttempted: 0,
                partialAttempted: 0,
                partialNotAttempted: 0,
                partialWrongAttempted: 0,
                timeTaken: 0,
                questionsSingle: 0,
                questionsMultiple: 0
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
