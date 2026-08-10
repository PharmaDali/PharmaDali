import React from 'react'

const MOCK_PHARMACIES = [
  { id: 1, name: 'Landicho Drugstore', owner: 'Hydee ---', city: 'Lipa City', contact: '09123456789', status: 'Active' },
  { id: 2, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
  { id: 3, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
  { id: 4, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
  { id: 5, name: 'Puremed Pharmacy', owner: 'Edcel ---', city: 'Tanauan City', contact: '09541790778', status: 'Active' },
]

const PharmacyList: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full text-sm">
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-white text-xl font-semibold">Pharmacy List</h2>

        <button className="flex items-center gap-2 bg-[#2aa6e0] hover:bg-[#35b3f0] text-white text-xs font-medium px-3 py-2 rounded-md shadow">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
            <path d="M12 5v14"></path>
            <path d="M5 12h14"></path>
          </svg>
          Add new pharmacy
        </button>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <input
            className="w-full bg-[#2f3338] placeholder:text-gray-400 text-gray-100 pl-10 pr-4 py-3 rounded-lg border border-transparent focus:outline-none"
            placeholder="Search by Pharmacy Name or Status"
          />
        </div>
        <div className="text-gray-300 text-xs">&nbsp;</div>
      </div>

      <div className="bg-[#2f3438] rounded-xl shadow-lg p-4">
        <div className="bg-[#424754] rounded-md overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#8ccfed] text-[#22313b]">
                <th className="py-3 px-5 font-semibold text-xs rounded-tl-md">Pharmacy Name</th>
                <th className="py-3 px-5 font-semibold text-xs">Owner Name</th>
                <th className="py-3 px-5 font-semibold text-xs">City</th>
                <th className="py-3 px-5 font-semibold text-xs">Contact Number</th>
                <th className="py-3 px-5 font-semibold text-xs">
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="4" y1="6" x2="20" y2="6"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                      <line x1="10" y1="18" x2="14" y2="18"></line>
                    </svg>
                    Status
                  </div>
                </th>
                <th className="py-3 px-5 font-semibold text-xs rounded-tr-md">Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PHARMACIES.map((p, idx) => (
                <tr key={p.id + '-' + idx} className="border-b border-[rgba(255,255,255,0.03)] last:border-b-0 hover:bg-[rgba(255,255,255,0.01)]">
                  <td className="py-4 px-5 text-gray-100">{p.name}</td>
                  <td className="py-4 px-5 text-gray-200">{p.owner}</td>
                  <td className="py-4 px-5 text-gray-200">{p.city}</td>
                  <td className="py-4 px-5 text-gray-200">{p.contact}</td>
                  <td className="py-4 px-5">
                    <span className={p.status === 'Active' ? 'text-[#4ade80] font-medium' : 'text-gray-400'}>{p.status}</span>
                  </td>
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-2 justify-end">
                      <button className="px-3 py-1 rounded-md bg-[#60a5fa] text-white text-xs font-medium">View</button>
                      <button className="px-3 py-1 rounded-md border border-[#60a5fa] text-[#bde7ff] text-xs font-medium">Edit</button>
                      <button className="px-3 py-1 rounded-md border border-red-500 text-red-400 text-xs font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PharmacyList
