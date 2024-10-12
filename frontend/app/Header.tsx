"use client"
import { ModeToggle } from '@/components/ui/mode-toggle'
import React from 'react'
import { Activity } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const Header: React.FC = () => {
  const pathname = usePathname();
  return (
    <div className="fixed top-0 left-0 w-screen h-14 border-b flex justify-between px-5 items-center z-10 backdrop-blur-sm">
      <Link href={'/'} className='font-bold flex gap-2 items-center'>
        <Activity size={16} color='#6366f1' />
        Musicplayer
      </Link>
      <div className='flex gap-5 items-center'>
        <div className='flex gap-4'>
          <Link href={'/'} className={`${pathname == '/' && 'text-primary'} hover:text-primary transition-all duration-300`}>
            Home
          </Link>
          <Link href={'/for-You'} className={`${pathname == '/for-You' && 'text-primary'} hover:text-primary transition-all duration-300`}>
            For You
          </Link>
          <Link href={'/discover'} className={`${pathname == '/discover' && 'text-primary'} hover:text-primary transition-all duration-300`}>
            Discover
          </Link>
          <Link href={'/playlists'} className={`${pathname == '/playlists' && 'text-primary'} hover:text-primary transition-all duration-300`}>
            Playlists
          </Link>
          <Link href={'/libary'} className={`${pathname == '/libary' && 'text-primary'} hover:text-primary transition-all duration-300`}>
            Libary
          </Link>
        </div>
        <ModeToggle />
      </div>
    </div>
  )
}

export default Header