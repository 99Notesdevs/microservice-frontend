import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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


export default function EditTest() {
  const router = useNavigate()
  const params = useParams()
  const [testData, setTestData] = useState<TestFormData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const token = Cookies.get("token")
        const response = await fetch(`${env.API}/test/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        if (!response.ok) throw new Error('Failed to fetch test')
        const testData = await response.json()
        const data = testData.data
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
      const token = Cookies.get("token")
      const response = await fetch(`${env.API}/test/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data)
      })

      if (!response.ok) throw new Error('Failed to update test')
      
      
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading test details...</p>
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
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit Test</h1>
      <SimpleTestForm
        onSubmit={handleSubmit}
        initialData={testData}
      />
    </div>
  )
}
