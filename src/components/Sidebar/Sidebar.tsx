import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import dashboardIcon from '../../assets/dashboard-icon.svg'
import collapsedSidebarLogo from '../../assets/icon-collapsed-sidebar.svg'
import pharmaciesIcon from '../../assets/pharmacies-icon.svg'
import sidebarLogo from '../../assets/side-bar-logo.svg'
import ticketsIcon from '../../assets/tickets-icon.svg'
import usersIcon from '../../assets/users-icon.svg'

const SIDEBAR_ITEMS = [
  { to: '/homepage', label: 'Dashboard', icon: dashboardIcon, end: true },
  { to: '/pharmacies', label: 'Pharmacies', icon: pharmaciesIcon },
  { to: '/users', label: 'Users', icon: usersIcon },
  { to: '/tickets', label: 'Tickets', icon: ticketsIcon },
]

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`relative z-20 min-h-screen bg-[#2b2f37] border-r border-[none] shadow-[8px_0_24px_rgba(0,0,0,0.12)] p-0 shrink-0 transition-[width] duration-300 ${isCollapsed ? 'w-[80px]' : 'w-[240px]'}`}>
      <div className="flex items-center justify-center min-h-[72px] bg-[#48aad9] px-4 py-3 overflow-hidden">
        <img
          className={`block object-contain transition-all duration-300 ${isCollapsed ? 'w-[36px] h-[36px] opacity-100' : 'w-[170px] max-w-[200px] opacity-100'}`}
          src={isCollapsed ? collapsedSidebarLogo : sidebarLogo}
          alt="PharmaDali"
        />
      </div>

      <nav className="flex flex-col gap-2 py-[18px] md:py-[14px]" aria-label="Primary">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full min-h-[50px] rounded text-[#c7d2dd] no-underline font-[var(--font-primary)] text-[15px] font-medium tracking-[0.01em] transition-all duration-300 outline-none box-border focus-visible:outline-2 focus-visible:outline-[rgba(150,210,238,0.75)] focus-visible:-outline-offset-2 hover:bg-[rgba(150,210,238,0.14)] hover:text-white ${isActive ? 'bg-[#96d2ee] !text-[#22313b] shadow-[inset_0_0_0_1px_rgba(34,49,59,0.08)] [&>img]:brightness-0 [&>img]:saturate-100' : ''
              } ${isCollapsed ? 'justify-center px-0 mx-auto w-[50px]' : 'px-5 pl-[22px]'}`
            }
          >
            <img className="w-[18px] h-[18px] shrink-0" src={item.icon} alt="" aria-hidden="true" />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0 overflow-hidden hidden' : 'opacity-100'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-1/2 -right-[19px] -translate-y-1/2 w-[18.5px] h-[48px] bg-[#96d2ee] flex items-center justify-center rounded-r-[4px] cursor-pointer border-none shadow-[2px_0_8px_rgba(0,0,0,0.1)] hover:bg-[#b0e0f5] transition-colors"
        aria-label="Toggle Sidebar"
      >
        <svg
          width="50" height="20" viewBox="0 0 24 24" fill="none" stroke="#22313b" strokeWidth="3" strokeLinecap="square" strokeLinejoin="round"
          className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`}
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>
    </aside>
  )
}

export default Sidebar