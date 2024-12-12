import { Laptop, Router } from 'lucide-react'
import React from 'react'

export const ServerLoader: React.FC<{ size?: number }> = ({ size = 12 }) => {
  return (
    <div className='flex gap-2 items-center text-sm'>
      <Laptop size={size} className='animate-loading-icon' />
      <div className='flex gap-1'> 
        <div className={`rounded-full animate-loading-dot delay-150`} style={{ width: `${size / 2}px`, height: `${size / 2}px` }} />
        <div className={`rounded-full animate-loading-dot delay-300`} style={{ width: `${size / 2}px`, height: `${size / 2}px` }} />
        <div className={`rounded-full animate-loading-dot delay-450`} style={{ width: `${size / 2}px`, height: `${size / 2}px` }} />
      </div>
      <Router size={size} className='animate-loading-icon delay-600' />
    </div>
  )
}
