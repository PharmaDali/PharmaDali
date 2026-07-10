import { useLocation } from 'react-router-dom'
import Sidebar from '../../components/Sidebar/Sidebar'

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
    <div className="min-h-screen flex flex-col md:flex-row bg-[radial-gradient(circle_at_top_left,rgba(72,170,217,0.18),transparent_28%),linear-gradient(135deg,#eef7fb_0%,#f6fbfd_42%,#eef2f5_100%)] text-[#1f2933] font-[var(--font-primary)]">
      <Sidebar />

      <main className="flex-1 p-5 md:p-[40px]">
        <section className="max-w-[720px] bg-[rgba(255,255,255,0.84)] border border-[rgba(34,49,59,0.08)] rounded-[24px] p-6 md:p-[36px] shadow-[0_24px_80px_rgba(20,33,44,0.08)] backdrop-blur-[12px]">
          <p className="m-0 mb-2.5 text-[#48aad9] text-[13px] font-bold tracking-[0.18em] uppercase">PharmaDali</p>
          <h1 className="m-0 text-[clamp(2rem,3vw,3.5rem)] leading-[1.05]">{title}</h1>
          <p className="mt-[14px] mb-0 max-w-[58ch] text-[16px] leading-[1.7] text-[#55616d]">
            Use the sidebar to move between the main admin sections. This layout keeps the
            active tab highlighted in the light blue state from your reference.
          </p>
        </section>
      </main>
    </div>
  )
}

export default HomePage
