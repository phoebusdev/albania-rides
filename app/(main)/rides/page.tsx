import { Suspense } from 'react'
import RidesContent from './rides-content'

export default function RidesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading rides...</p>
      </div>
    }>
      <RidesContent />
    </Suspense>
  )
}