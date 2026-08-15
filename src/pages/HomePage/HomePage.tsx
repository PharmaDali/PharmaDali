import { useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'
import Navbar from '../../components/Navbar/Navbar'
import KpiCard from '../../components/Dashboard/KpiCard'
import PharmacyMap from '../../components/Dashboard/PharmacyMap'
import Pharmacies from '../Pharmacies/Pharmacies'
import Users from '../Users/Users'
import Notifications from '../Notifications/Notifications'
import { usePharmacies } from '../../context/PharmacyContext'

const PAGE_TITLES: Record<string, string> = {
  '/homepage': 'Dashboard',
  '/pharmacies': 'Pharmacies',
  '/users': 'Users',
  '/tickets': 'Tickets',
  '/notifications': 'Notifications',
}

function HomePage() {
  const { pathname } = useLocation()
  const title = PAGE_TITLES[pathname] ?? 'Dashboard'
  const { totalPharmacies, totalActivePharmacies } = usePharmacies()

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#323642] text-[#e2e8f0] font-[var(--font-primary)]">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar name="Denmar" role="Superman" />

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {pathname === '/homepage' ? (
            <div className="flex flex-col gap-8 max-w-[1400px]">
              <div className="mb-4">
                <h1 className="m-0 text-[clamp(1.6rem,2.8vw,2.6rem)] leading-[1.05] text-white">Dashboard</h1>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <KpiCard title="Total Pharmacies" value={String(totalPharmacies)} />
                <KpiCard title="Total Active Pharmacies" value={String(totalActivePharmacies)} />
                <KpiCard title="Total Users" value="24" />
                <KpiCard title="KPI 1" value="--" />
                <KpiCard title="KPI 2" value="--" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.5fr_1fr] gap-8 mt-4">
                <PharmacyMap />
                <Pharmacies compact />
              </div>
            </div>
          ) : pathname === '/pharmacies' ? (
            <section className="w-full">
              <div className="max-w-[1400px]">
                <Pharmacies />
              </div>
            </section>
          ) : pathname === '/users' ? (
            <section className="w-full">
              <div className="max-w-[1400px]">
                <Users />
              </div>
            </section>
          ) : pathname === '/notifications' ? (
            <section className="w-full">
              <div className="max-w-[1400px]">
                <Notifications />
              </div>
            </section>
          ) : (
            <section className="max-w-[720px] bg-[#424754] border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 md:p-[36px] shadow-lg">
              <p className="m-0 mb-2.5 text-[#8ccfed] text-[13px] font-bold tracking-[0.18em] uppercase">PharmaDali</p>
              <h2 className="m-0 text-[clamp(2rem,3vw,3.5rem)] leading-[1.05] text-white">{title}</h2>
              <p className="mt-[14px] mb-0 max-w-[58ch] text-[16px] leading-[1.7] text-gray-300">
                Content for {title} will go here.
              </p>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default HomePage
