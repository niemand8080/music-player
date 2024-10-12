"use client"
import { ModeToggle } from '@/components/ui/mode-toggle'
import React from 'react'
import { Activity } from 'lucide-react'
import Link from 'next/link'
import { ResponsiveHeaderLinks } from '@/components/my-ui/responsive-header-link'

const Header: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-14 border-b flex justify-between px-5 items-center z-10 backdrop-blur-sm">
      <Link href={'/'} className='font-bold flex gap-2 items-center'>
        <Activity size={16} className='text-primary' />
        <span className='sm:block hidden'>Musicplayer</span>
      </Link>
      <div className='flex sm:gap-5 gap-3 items-center'>
        <ResponsiveHeaderLinks />
        <ModeToggle />
      </div>
    </div>
  )
}

export default Header