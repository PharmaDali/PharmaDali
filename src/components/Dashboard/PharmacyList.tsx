import React from 'react'

const MOCK_PHARMACIES = [
  { id: 1, name: 'Landicho Drugstore', location: 'Lipa City', status: 'Active' },
  { id: 2, name: 'Puremed Pharmacy', location: 'Tanauan City', status: 'Active' },
  { id: 3, name: 'Puremed Pharmacy', location: 'Tanauan City', status: 'Active' },
]

const PharmacyList: React.FC = () => {
  return (
    <div className="flex flex-col w-full h-full">
      <h2 className="text-white text-lg font-bold mb-4 mt-0">Pharmacy List</h2>
      
      <div className="bg-[#424754] rounded-xl overflow-hidden shadow-sm flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#8ccfed]">
              <th className="py-3 px-5 text-[#22313b] font-semibold text-sm">Pharmacy Name</th>
              <th className="py-3 px-5 text-[#22313b] font-semibold text-sm">Location</th>
              <th className="py-3 px-5 text-[#22313b] font-semibold text-sm">
                <div className="flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                    <line x1="10" y1="18" x2="14" y2="18"></line>
                  </svg>
                  Status
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PHARMACIES.map((pharmacy, index) => (
              <tr 
                key={pharmacy.id + '-' + index} 
                className="border-b border-[rgba(255,255,255,0.1)] last:border-b-0 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                <td className="py-4 px-5 text-[#e2e8f0] text-sm">{pharmacy.name}</td>
                <td className="py-4 px-5 text-[#e2e8f0] text-sm">{pharmacy.location}</td>
                <td className="py-4 px-5 text-sm">
                  <span className={pharmacy.status === 'Active' ? 'text-[#4ade80]' : 'text-gray-400'}>
                    {pharmacy.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PharmacyList
