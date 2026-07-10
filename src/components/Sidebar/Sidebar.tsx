import { NavLink } from 'react-router-dom'
import dashboardIcon from '../../assets/dashboard-icon.svg'
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
  return (
    <aside className="w-full md:w-[240px] md:min-h-screen bg-[#2b2f37] border-r border-[rgba(255,255,255,0.04)] shadow-[8px_0_24px_rgba(0,0,0,0.12)] p-0 shrink-0">
      <div className="flex items-center justify-center min-h-[72px] bg-[#48aad9] px-4 py-3">
        <img className="w-[170px] max-w-[200px] block" src={sidebarLogo} alt="PharmaDali" />
      </div>

      <nav className="flex flex-col gap-2 py-[18px] md:py-[14px]" aria-label="Primary">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full min-h-[50px] px-5 pl-[22px] rounded text-[#c7d2dd] no-underline font-[var(--font-primary)] text-[15px] font-medium tracking-[0.01em] transition-all duration-[160ms] outline-none box-border focus-visible:outline-2 focus-visible:outline-[rgba(150,210,238,0.75)] focus-visible:-outline-offset-2 hover:bg-[rgba(150,210,238,0.14)] hover:text-white ${
                isActive ? 'bg-[#96d2ee] !text-[#22313b] shadow-[inset_0_0_0_1px_rgba(34,49,59,0.08)] [&>img]:brightness-0 [&>img]:saturate-100' : ''
              }`
            }
          >
            <img className="w-[18px] h-[18px] shrink-0" src={item.icon} alt="" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar