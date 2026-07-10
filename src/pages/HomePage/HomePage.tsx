import { useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import './homepage.css'

const PAGE_TITLES: Record<string, string> = {
  '/homepage': 'Dashboard',
  '/pharmacies': 'Pharmacies',
  '/users': 'Users',
  '/tickets': 'Tickets',
}

function HomePage() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Dashboard'

  return (
    <div className="dashboard-shell">
      <Sidebar />

      <main className="dashboard-main">
        <section className="dashboard-hero">
          <p className="dashboard-eyebrow">PharmaDali</p>
          <h1>{title}</h1>
          <p>
            Use the sidebar to move between the main admin sections. This layout keeps the
            active tab highlighted in the light blue state from your reference.
          </p>
        </section>
      </main>
    </div>
  )
}

export default HomePage
