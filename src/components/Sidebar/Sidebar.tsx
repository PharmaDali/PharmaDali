import { NavLink } from 'react-router-dom'
import dashboardIcon from '../../assets/dashboard-icon.svg'
import pharmaciesIcon from '../../assets/pharmacies-icon.svg'
import sidebarLogo from '../../assets/side-bar-logo.svg'
import ticketsIcon from '../../assets/tickets-icon.svg'
import usersIcon from '../../assets/users-icon.svg'
import './sidebar.css'

const SIDEBAR_ITEMS = [
  { to: '/homepage', label: 'Dashboard', icon: dashboardIcon, end: true },
  { to: '/pharmacies', label: 'Pharmacies', icon: pharmaciesIcon },
  { to: '/users', label: 'Users', icon: usersIcon },
  { to: '/tickets', label: 'Tickets', icon: ticketsIcon },
]

function Sidebar() {
  return (
    <aside className="sidebar-shell">
      <div className="sidebar-logo-panel">
        <img className="sidebar-logo" src={sidebarLogo} alt="PharmaDali" />
      </div>

      <nav className="sidebar-nav" aria-label="Primary">
        {SIDEBAR_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <img className="sidebar-link-icon" src={item.icon} alt="" aria-hidden="true" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar