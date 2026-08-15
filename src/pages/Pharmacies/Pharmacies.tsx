import React, { useState } from 'react'
import { usePharmacies, type Pharmacy } from '../../context/PharmacyContext'

type Props = {
  compact?: boolean
}

const PharmacyList: React.FC<Props> = ({ compact }) => {
  const { pharmacies, addPharmacy, updatePharmacy, deletePharmacy } = usePharmacies()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPharmacy, setSelectedPharmacy] = useState<Pharmacy | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    owner: '',
    contact: '',
    email: '',
    location: '',
    status: 'Active',
  })

  const [editingPharmacy, setEditingPharmacy] = useState<Pharmacy | null>(null)
  const [deletingPharmacy, setDeletingPharmacy] = useState<Pharmacy | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [editFormData, setEditFormData] = useState({
    name: '',
    owner: '',
    contact: '',
    email: '',
    location: '',
    status: 'Active',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleOpenEdit = (p: Pharmacy) => {
    setEditingPharmacy(p)
    setEditFormData({
      name: p.name || '',
      owner: p.owner || '',
      contact: p.contact || '',
      email: p.email || '',
      location: p.location || '',
      status: p.status || 'Active',
    })
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdatePharmacy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPharmacy || !editFormData.name.trim()) return
    setIsConfirmModalOpen(true)
  }

  const handleConfirmSave = () => {
    if (!editingPharmacy) return

    const updated: Pharmacy = {
      ...editingPharmacy,
      name: editFormData.name,
      owner: editFormData.owner,
      contact: editFormData.contact,
      email: editFormData.email,
      location: editFormData.location,
      status: editFormData.status,
    }

    updatePharmacy(updated)
    if (selectedPharmacy?.id === editingPharmacy.id) {
      setSelectedPharmacy(updated)
    }
    setIsConfirmModalOpen(false)
    setEditingPharmacy(null)
    setIsSuccessModalOpen(true)
  }

  const handleConfirmDelete = () => {
    if (!deletingPharmacy) return
    deletePharmacy(deletingPharmacy.id)
    if (selectedPharmacy?.id === deletingPharmacy.id) {
      setSelectedPharmacy(null)
    }
    setDeletingPharmacy(null)
  }

  const handleSavePharmacy = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    addPharmacy({
      name: formData.name,
      owner: formData.owner,
      contact: formData.contact,
      email: formData.email,
      location: formData.location,
      status: formData.status || 'Active',
    })
    setFormData({ name: '', owner: '', contact: '', email: '', location: '', status: 'Active' })
    setIsAddModalOpen(false)
  }

  const filteredPharmacies = pharmacies.filter((p) => {
    const query = searchTerm.toLowerCase().trim()
    if (!query) return true
    return (
      p.name.toLowerCase().includes(query) ||
      p.owner.toLowerCase().includes(query) ||
      p.location.toLowerCase().includes(query) ||
      p.contact.toLowerCase().includes(query) ||
      p.status.toLowerCase().includes(query)
    )
  })

  // compact mode: used on Dashboard — render a 3-column table without actions (scrollable if > 7 items)
  if (compact) {
    return (
      <div className="w-full">
        <h2 className="text-white text-2xl font-semibold mb-4">Pharmacy List</h2>
        <div className="bg-[#424754] rounded-[10px] overflow-hidden w-full max-w-[720px] shadow-lg">
          <div className="max-h-[440px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-[#8ccfed] text-[#22313b]">
                  <th className="py-3 px-6 text-sm font-semibold rounded-tl-[10px]">Pharmacy Name</th>
                  <th className="py-3 px-6 text-sm font-semibold">Location</th>
                  <th className="py-3 px-6 text-sm font-semibold text-center rounded-tr-[10px]">Status</th>
                </tr>
              </thead>
              <tbody>
                {pharmacies.map((p) => (
                  <tr key={p.id} className="border-b border-[rgba(255,255,255,0.03)] last:border-b-0">
                    <td className="py-4 px-6 text-gray-100 text-base">{p.name}</td>
                    <td className="py-4 px-6 text-gray-200 text-base">{p.location}</td>
                    <td className={`py-4 px-6 text-base text-center ${p.status === 'Active' ? 'text-[#4ade80]' : p.status === 'Pending' ? 'text-amber-400' : 'text-gray-400'}`}>{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="m-0 text-[clamp(1.6rem,2.8vw,2.6rem)] leading-[1.05] text-white">Pharmacies</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 items-start w-full">
        {/* Main Content Area (Table & Search) */}
        <div className="flex flex-col w-full flex-1 min-h-0 min-w-0">
          <div className="w-full mb-4">
            <div className="flex items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <h2 className="text-white text-2xl font-semibold flex-shrink-0">Pharmacy List</h2>

                {/* Search input inline with heading on wide screens */}
                <div className="relative flex-1 max-w-none">
                  <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="7" />
                      <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-[#2f3338] placeholder:text-gray-400 text-gray-100 pl-10 pr-10 py-3 rounded-[8px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                    placeholder="Search by Pharmacy Name, Owner, Location, or Status"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                      title="Clear search"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 bg-[#2aa6e0] hover:bg-[#35b3f0] text-white text-sm font-medium px-4 py-2 rounded-[8px] shadow transition-colors flex-shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block">
                  <path d="M12 5v14"></path>
                  <path d="M5 12h14"></path>
                </svg>
                Add new pharmacy
              </button>
            </div>
          </div>

          <div className="bg-transparent rounded-xl shadow-lg p-0 flex-1 min-h-0 w-full">
            <div className="bg-[#424754] rounded-md overflow-auto max-h-[65vh]">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed min-w-[700px]">
                  <thead>
                    <tr className="bg-[#8ccfed] text-[#22313b]">
                      <th className="py-3 px-5 font-semibold text-xs rounded-tl-md w-1/6">Pharmacy Name</th>
                      <th className="py-3 px-5 font-semibold text-xs w-1/6">Owner Name</th>
                      <th className="py-3 px-5 font-semibold text-xs w-1/6">Location</th>
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
                    {filteredPharmacies.length > 0 ? (
                      filteredPharmacies.map((p, idx) => (
                        <tr key={p.id + '-' + idx} className="border-b border-[rgba(255,255,255,0.03)] last:border-b-0 hover:bg-[rgba(255,255,255,0.01)] align-middle min-h-[64px]">
                          <td className="py-4 px-5 align-middle text-gray-100 truncate whitespace-nowrap">{p.name}</td>
                          <td className="py-4 px-5 align-middle text-gray-200 truncate whitespace-nowrap">{p.owner}</td>
                          <td className="py-4 px-5 align-middle text-gray-200 truncate whitespace-nowrap">{p.location}</td>
                          <td className="py-4 px-5 align-middle text-gray-200 truncate whitespace-nowrap">{p.contact}</td>
                          <td className="py-4 px-5 align-middle">
                            <span className={p.status === 'Active' ? 'text-[#4ade80] font-medium' : p.status === 'Pending' ? 'text-amber-400 font-medium' : 'text-gray-400'}>{p.status}</span>
                          </td>
                          <td className="py-4 pr-6 align-middle">
                            <div className="flex items-center gap-2 justify-end h-full">
                              <button
                                onClick={() => setSelectedPharmacy(p)}
                                className="min-w-[60px] h-8 flex items-center justify-center px-3 rounded-[6px] bg-[#2aa6e0] hover:bg-[#35b3f0] text-white text-xs font-medium transition-colors"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleOpenEdit(p)}
                                className="min-w-[54px] h-8 flex items-center justify-center px-2.5 rounded-[6px] border border-[#2aa6e0] text-[#8ccfed] hover:bg-[#2aa6e0]/10 text-xs font-medium transition-colors"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => setDeletingPharmacy(p)}
                                className="min-w-[60px] h-8 flex items-center justify-center px-2.5 rounded-[6px] border border-red-500 text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400">
                          No pharmacies found matching "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side Details Panel */}
        {selectedPharmacy && (
          <div className="w-full lg:w-[340px] flex-shrink-0 bg-[#292d37] rounded-[16px] p-5 shadow-2xl border border-[rgba(255,255,255,0.05)] transition-all">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-xl font-bold">Pharmacy Details</h2>
              <button
                onClick={() => setSelectedPharmacy(null)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Basic Information Card */}
            <div className="bg-[#424754] rounded-[12px] p-4 mb-4">
              <h3 className="text-[#8ccfed] font-semibold text-sm mb-3">Basic Information</h3>
              <div className="space-y-2 text-xs text-gray-200">
                <p><span className="text-gray-300">Pharmacy:</span> {selectedPharmacy.name}</p>
                <p><span className="text-gray-300">Owner:</span> {selectedPharmacy.owner}</p>
                <p><span className="text-gray-300">Contact Number:</span> {selectedPharmacy.contact}</p>
              </div>
            </div>

            {/* Users Assigned Card */}
            <div className="bg-[#424754] rounded-[12px] p-4">
              <h3 className="text-[#8ccfed] font-semibold text-sm mb-2">Users Assigned</h3>
              <p className="text-xs text-gray-200 mb-3"><span className="text-gray-300">Manager:</span> {selectedPharmacy.owner}</p>

              <div className="rounded-[8px] overflow-hidden bg-[#353a45]">
                <div className="bg-[#8ccfed] text-[#22313b] font-semibold text-xs px-3 py-2">
                  Pharmacists
                </div>
                <div className="divide-y divide-[rgba(255,255,255,0.06)]">
                  <div className="px-3 py-2 text-xs text-gray-200">Denmar Redondo</div>
                  <div className="px-3 py-2 text-xs text-gray-200">Denmar Redondo</div>
                  <div className="px-3 py-2 text-xs text-gray-200">Denmar Redondo</div>
                  <div className="px-3 py-2 text-xs text-gray-200">Denmar Redondo</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Pharmacy Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="bg-[#292d37] w-full max-w-[500px] rounded-[20px] p-8 shadow-2xl border border-[rgba(255,255,255,0.05)]">
            <h2 className="text-white text-2xl font-bold text-center mb-8">Add New Pharmacy</h2>

            <form onSubmit={handleSavePharmacy} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Pharmacy Name"
                  required
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="owner"
                  value={formData.owner}
                  onChange={handleInputChange}
                  placeholder="Owner Name"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="contact"
                  value={formData.contact}
                  onChange={handleInputChange}
                  placeholder="Contact Number"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Location"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] appearance-none transition-colors cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full py-3.5 px-4 rounded-[12px] border border-[#2aa6e0] text-[#38bdf8] hover:bg-[#2aa6e0]/10 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-[12px] bg-[#38bdf8] hover:bg-[#2aa6e0] text-white font-semibold shadow transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Pharmacy Modal */}
      {editingPharmacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 animate-fade-in">
          <div className="bg-[#292d37] w-full max-w-[500px] rounded-[20px] p-8 shadow-2xl border border-[rgba(255,255,255,0.05)]">
            <h2 className="text-white text-2xl font-bold text-center mb-8">Edit Pharmacy Information</h2>

            <form onSubmit={handleUpdatePharmacy} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  placeholder="Pharmacy Name"
                  required
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="owner"
                  value={editFormData.owner}
                  onChange={handleEditInputChange}
                  placeholder="Owner Name"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="contact"
                  value={editFormData.contact}
                  onChange={handleEditInputChange}
                  placeholder="Contact Number"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  placeholder="Email"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  placeholder="Location"
                  className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] transition-colors"
                />
                <div className="relative">
                  <select
                    name="status"
                    value={editFormData.status}
                    onChange={handleEditInputChange}
                    className="w-full bg-[#404552] text-gray-100 placeholder-gray-400 px-4 py-3.5 rounded-[12px] border border-transparent focus:outline-none focus:border-[#2aa6e0] appearance-none transition-colors cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setEditingPharmacy(null)}
                  className="w-full py-3.5 px-4 rounded-[12px] border border-[#2aa6e0] text-[#38bdf8] hover:bg-[#2aa6e0]/10 font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-[12px] bg-[#38bdf8] hover:bg-[#2aa6e0] text-white font-semibold shadow transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Changes Modal */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 animate-fade-in">
          <div className="bg-[#292d37] w-full max-w-[440px] rounded-[20px] p-8 shadow-2xl border border-[rgba(255,255,255,0.05)] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-white flex items-center justify-center mx-auto mb-5 text-white">
              <span className="text-3xl font-light leading-none">?</span>
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Confirm Changes</h2>
            <p className="text-gray-300 text-sm mb-8 leading-relaxed">
              Are you sure you want to save these changes?<br />
              The pharmacy's information will be updated accordingly.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIsConfirmModalOpen(false)}
                className="w-full py-3 px-4 rounded-[10px] border border-gray-500/60 text-gray-200 hover:bg-white/5 font-semibold transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSave}
                className="w-full py-3 px-4 rounded-[10px] bg-[#38bdf8] hover:bg-[#2aa6e0] text-white font-semibold shadow transition-colors text-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Changes Saved Successfully Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 animate-fade-in">
          <div className="bg-[#292d37] w-full max-w-[440px] rounded-[20px] p-8 shadow-2xl border border-[rgba(255,255,255,0.05)] text-center">
            <div className="w-16 h-16 rounded-full bg-[#00c853]/20 border-2 border-[#00c853] flex items-center justify-center mx-auto mb-5 text-[#00c853]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h2 className="text-white text-2xl font-bold mb-3">Changes Saved Successfully</h2>
            <p className="text-gray-300 text-sm mb-8">
              The information has been recorded successfully
            </p>
            <div>
              <button
                type="button"
                onClick={() => setIsSuccessModalOpen(false)}
                className="w-full py-3 px-4 rounded-[10px] bg-[#00c853] hover:bg-[#00b048] text-white font-semibold transition-colors text-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Pharmacy Confirmation Modal */}
      {deletingPharmacy && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/65 p-4 animate-fade-in">
          <div className="bg-[#262933] w-full max-w-[420px] rounded-[20px] p-7 shadow-2xl border border-[rgba(255,255,255,0.05)] text-center">
            <div className="w-16 h-16 rounded-full border-2 border-[#ff4d4d] flex items-center justify-center mx-auto mb-4 text-[#ff4d4d]">
              <span className="text-3xl font-bold leading-none">!</span>
            </div>
            <h2 className="text-[#ff4d4d] text-2xl font-bold mb-2">Delete Pharmacy</h2>
            <p className="text-gray-300 text-xs mb-5 leading-relaxed">
              Are you sure you want to delete this pharmacy?<br />
              This action cannot be undone.
            </p>

            {/* Selected Pharmacy Info Box */}
            <div className="bg-[#383d4a] rounded-[14px] p-4 text-left mb-6 flex items-start gap-3 border border-white/5">
              <div className="text-[#38bdf8] pt-0.5 flex-shrink-0">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7m0 0v1a3 3 0 0 0 6 0V7M4 7l2-4h12l2 4M5 21V10.8M19 21V10.8" />
                </svg>
              </div>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Pharmacy</span>
                  <span className="text-white font-semibold text-xs">{deletingPharmacy.name}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Owner</span>
                  <span className="text-gray-200 text-xs">{deletingPharmacy.owner || '—'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">City</span>
                  <span className="text-gray-200 text-xs">{deletingPharmacy.location || '—'}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeletingPharmacy(null)}
                className="w-full py-3 px-4 rounded-[10px] border border-gray-500/60 text-gray-200 hover:bg-white/5 font-semibold transition-colors text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-full py-3 px-4 rounded-[10px] bg-[#ff4d4d] hover:bg-[#e03e3e] text-white font-semibold shadow transition-colors text-xs"
              >
                Delete Pharmacy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PharmacyList
