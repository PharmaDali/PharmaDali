import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../../services/authService'

export interface NavbarProps {
  name?: string
  role?: string
}

const Navbar: React.FC<NavbarProps> = ({ name, role }) => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const storedUser = localStorage.getItem('user')
  const parsedUser = storedUser ? JSON.parse(storedUser) : null

  const displayName = name ?? (parsedUser ? `${parsedUser.first_name || ''} ${parsedUser.last_name || ''}`.trim() : 'Super Admin')
  const displayRole = role ?? (parsedUser?.role ? (parsedUser.role === 'super_admin' ? 'Super Admin' : parsedUser.role) : 'Administrator')

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
    } finally {
      setIsLoggingOut(false)
      navigate('/', { replace: true })
    }
  }

  return (
    <header className="flex justify-end items-center px-6 py-4 bg-[#48AAD9] sticky top-0 z-10 w-full shadow-md box-border">
      <div className="flex items-center gap-3 relative" ref={menuRef}>
        <div className="flex flex-col items-end justify-center">
          <span className="text-[rgba(4,4,4,0.8)] font-bold text-[15px] leading-[1.2]">{displayName}</span>
          <span className="text-[rgba(4,4,4,0.8)] text-[13px] leading-[1.2]">{displayRole}</span>
        </div>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-[36px] h-[36px] flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.2)] transition-colors border-none bg-transparent cursor-pointer"
          aria-label="Menu"
          aria-expanded={isMenuOpen}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-[#282c37] border border-[#3e4454] rounded-xl shadow-2xl py-1.5 z-50">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-400 hover:text-red-300 hover:bg-[#323642] transition-colors border-none bg-transparent cursor-pointer text-left disabled:opacity-50"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
