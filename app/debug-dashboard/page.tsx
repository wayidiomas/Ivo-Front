'use client'

import { useState } from 'react'
import { dashboardService } from '@/lib/api/dashboard'

export default function DebugDashboard() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await dashboardService.getAllDashboardData(30, 3)
      setData(result)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Debug Dashboard API</h1>
      
      <button 
        onClick={fetchData}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6 disabled:opacity-50"
      >
        {loading ? 'Carregando...' : 'Testar API Dashboard'}
      </button>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded mb-6">
          <h3 className="font-bold text-red-800">❌ Erro:</h3>
          <pre className="text-red-600 text-sm mt-2">{error}</pre>
        </div>
      )}

      {data && (
        <div className="bg-gray-50 border p-4 rounded">
          <h3 className="font-bold mb-4">📊 Dados Recebidos:</h3>
          <pre className="text-xs overflow-auto bg-white p-4 border rounded">
            {JSON.stringify(data, null, 2)}
          </pre>
          
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-bold">Stats Success:</h4>
              <p>{data.stats?.success ? '✅ Sim' : '❌ Não'}</p>
            </div>
            
            <div>
              <h4 className="font-bold">Units Success:</h4>
              <p>{data.units?.success ? '✅ Sim' : '❌ Não'}</p>
            </div>
            
            <div>
              <h4 className="font-bold">Stats Count:</h4>
              <p>{data.stats?.data?.stats?.length || 0} itens</p>
            </div>
            
            <div>
              <h4 className="font-bold">Units Count:</h4>
              <p>{data.units?.data?.recent_units?.length || 0} itens</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}