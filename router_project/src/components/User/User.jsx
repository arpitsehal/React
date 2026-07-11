import React from 'react'
import { useParams } from 'react-router-dom'

function User() {
  const { userid } = useParams()
  return (
    <div className="text-center text-2xl py-10 font-medium bg-gray-600 text-white">
      User: {userid || 'Guest'}
    </div>
  )
}

export default User