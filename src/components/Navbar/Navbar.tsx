import React from 'react'

export interface NavbarProps {
  name: string
  role: string
}

const Navbar: React.FC<NavbarProps> = ({ name, role }) => {
  return (
    <header className="flex justify-end items-center px-6 py-4 bg-[#48AAD9] sticky top-0 z-10 w-full shadow-md box-border">
      <div className="flex items-center gap-3">
        <div className="flex flex-col items-end justify-center">
          <span className="text-[rgba(4, 4, 4, 0.8)] font-bold text-[15px] leading-[1.2]">{name}</span>
          <span className="text-[rgba(4, 4, 4, 0.8)] text-[13px] leading-[1.2]">{role}</span>
        </div>
        <button
          className="w-[36px] h-[36px] flex items-center justify-center rounded-full hover:bg-[rgba(255,255,255,0.15)] transition-colors border-none bg-transparent cursor-pointer"
          aria-label="Menu"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="5" r="1.5" />
            <circle cx="12" cy="12" r="1.5" />
            <circle cx="12" cy="19" r="1.5" />
          </svg>
        </button>
      </div>
    </header>
  )
}

export default Navbar
