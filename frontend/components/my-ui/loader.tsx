import React from 'react'
import { LoaderCircle } from 'lucide-react'

export const Loader: React.FC<{ loading: boolean, children: React.ReactNode }> = ({ loading, children }) => {
  return (
    <div className='w-full h-full'>
      <div className={`${!loading && "opacity-0"} backdrop-blur-sm items-center justify-center flex`}>
        <LoaderCircle className="animate-spin" />
      </div>
      {children}
    </div>
  )
}

export const ButtonLoader: React.FC<{ loading: boolean, children: React.ReactNode }> = ({ loading, children }) => {
  return (
    <>
      {loading ? (
        <LoaderCircle className="animate-spin" />
      ) : children}
    </>
  )
}