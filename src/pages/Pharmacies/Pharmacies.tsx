import React from 'react'

const MOCK_PHARMACIES = [
  { id: 1, name: 'Landicho Drugstore', owner: 'Hydee ---', city: 'Lipa City', contact: '09123456789', status: 'Active' },
  { id: 2, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
  { id: 3, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
  { id: 4, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
  { id: 5, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
]

type Props = {
  compact?: boolean
}

const PharmacyList: React.FC<Props> = ({ compact }) => {
  // compact mode: used on Dashboard — render a small 3-column table without actions
  if (compact) {
    return (
      <div className="w-full">
        <h2 className="text-white text-2xl font-semibold mb-4">Pharmacy List</h2>
        <div className="bg-[#424754] rounded-[10px] overflow-hidden w-full max-w-[720px] shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#8ccfed] text-[#22313b]">
                <th className="py-3 px-6 text-sm font-semibold rounded-tl-[10px]">Pharmacy Name</th>
                <th className="py-3 px-6 text-sm font-semibold">Location</th>
                <th className="py-3 px-6 text-sm font-semibold text-center rounded-tr-[10px]">Status</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PHARMACIES.slice(0, 5).map((p) => (
                <tr key={p.id} className="border-b border-[rgba(255,255,255,0.03)] last:border-b-0">
                  <td className="py-4 px-6 text-gray-100 text-base">{p.name}</td>
                  <td className="py-4 px-6 text-gray-200 text-base">{p.city}</td>
                  <td className="py-4 px-6 text-[#4ade80] text-base text-center">{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm">
      <div className="mb-6">
        <h1 className="m-0 text-[clamp(1.6rem,2.8vw,2.6rem)] leading-[1.05] text-white">Pharmacies</h1>
      </div>
      <div className="w-full mb-4">
        <div className="flex items-center justify-between gap-4 w-full">
          <div className="flex items-center gap-4 min-w-0 flex-1">
            <h2 className="text-white text-2xl font-semibold flex-shrink-0">Pharmacy List</h2>

            {/* Search input inline with heading on wide screens, stretches to fill available space */}
            <div className="relative flex-1 max-w-none">
              <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                className="w-full bg-[#2f3338] placeholder:text-gray-400 text-gray-100 pl-10 pr-4 py-3 rounded-[8px] border border-transparent focus:outline-none"
                placeholder="Search by Pharmacy Name or Status"
              />
            </div>
          </div>

          <button className="flex items-center gap-2 bg-[#2aa6e0] hover:bg-[#35b3f0] text-white text-sm font-medium px-4 py-2 rounded-[8px] shadow">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
              <path d="M12 5v14"></path>
              <path d="M5 12h14"></path>
            </svg>
            Add new pharmacy
          </button>
        </div>
      </div>

      <div className="bg-transparent rounded-xl shadow-lg p-4 flex-1 min-h-0">
        <div className="bg-[#424754] rounded-md overflow-auto max-h-[60vh]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse table-fixed min-w-[900px] md:min-w-full">
              <thead>
                <tr className="bg-[#8ccfed] text-[#22313b]">
                  <th className="py-3 px-5 font-semibold text-xs rounded-tl-md w-1/6">Pharmacy Name</th>
                  <th className="py-3 px-5 font-semibold text-xs w-1/6">Owner Name</th>
                  <th className="py-3 px-5 font-semibold text-xs w-1/6">City</th>
                  <th className="py-3 px-5 font-semibold text-xs w-1/6">Contact Number</th>
                  <th className="py-3 px-5 font-semibold text-xs w-1/6">
                    <div className="flex items-center gap-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="4" y1="6" x2="20" y2="6"></line>
                        <line x1="8" y1="12" x2="16" y2="12"></line>
                        <line x1="10" y1="18" x2="14" y2="18"></line>
                      </svg>
                      Status
                    </div>
                  </th>
                  <th className="py-3 px-5 text-center font-semibold text-xs align-middle rounded-tr-md w-1/6">Action</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_PHARMACIES.map((p, idx) => (
                  <tr key={p.id + '-' + idx} className="border-b border-[rgba(255,255,255,0.03)] last:border-b-0 hover:bg-[rgba(255,255,255,0.01)] align-middle min-h-[64px]">
                    <td className="py-4 px-5 align-middle text-gray-100 truncate whitespace-nowrap">{p.name}</td>
                    <td className="py-4 px-5 align-middle text-gray-200 truncate whitespace-nowrap">{p.owner}</td>
                    <td className="py-4 px-5 align-middle text-gray-200 truncate whitespace-nowrap">{p.city}</td>
                    <td className="py-4 px-5 align-middle text-gray-200 truncate whitespace-nowrap">{p.contact}</td>
                    <td className="py-4 px-5 align-middle">
                      <span className={p.status === 'Active' ? 'text-[#4ade80] font-medium' : 'text-gray-400'}>{p.status}</span>
                    </td>
                    <td className="py-4 pr-6 align-middle">
                      <div className="flex items-center gap-3 justify-end h-full">
                        <button className="min-w-[72px] h-9 flex items-center justify-center px-3 rounded-[8px] bg-[#60a5fa] text-white text-sm font-medium">View</button>
                        <button className="min-w-[62px] h-9 flex items-center justify-center px-3 rounded-[8px] border border-[#60a5fa] text-[#bde7ff] text-sm font-medium">Edit</button>
                        <button className="min-w-[62px] h-9 flex items-center justify-center px-3 rounded-[8px] border border-red-500 text-red-400 text-sm font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PharmacyList
