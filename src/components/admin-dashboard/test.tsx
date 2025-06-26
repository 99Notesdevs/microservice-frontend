import { useNavigate } from 'react-router-dom'
import { SimpleTestForm } from '@/components/testUtils/testForm'
import { env } from "@/config/env"
import Cookies from "js-cookie"

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
      const token = Cookies.get("token")
      const response = await fetch(`${env.API}/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to create test')
      
      
      
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Add New Test</h1>
            <p className="text-gray-600">Enter test details below</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-6">
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
