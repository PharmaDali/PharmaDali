import React, { useState, useEffect } from 'react'
import { Modal, ConfirmModal, Input, Select } from '../../components/common'
import * as userService from '../../services/userService'
import { usePharmacies } from '../../context/PharmacyContext'

export interface User {
  id: number
  fullName: string
  email?: string
  phoneNumber?: string
  role: string
  branchName: string
  status: 'Active' | 'Inactive'
  pharmacyId?: number
  firstName: string
  lastName: string
}

const ROLES = ['All', 'Pharmacist', 'Manager(Admin)', 'System Admin', 'Customer']
const STATUSES = ['All', 'Status', 'Active', 'Inactive']

const mapRoleToDisplay = (role: string) => {
  switch (role) {
    case 'pharmacy_admin': return 'Manager(Admin)'
    case 'pharmacist': return 'Pharmacist'
    case 'system_admin': return 'System Admin'
    case 'super_admin': return 'Super Admin'
    case 'customer': return 'Customer'
    default: return role
  }
}

const mapDisplayToRole = (display: string) => {
  switch (display) {
    case 'Manager(Admin)': return 'pharmacy_admin'
    case 'Pharmacist': return 'pharmacist'
    case 'System Admin': return 'system_admin'
    case 'Super Admin': return 'super_admin'
    case 'Customer': return 'customer'
    default: return display
  }
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const { pharmacies } = usePharmacies()
  const BRANCHES = ['All', ...pharmacies.map(p => p.name)]
  
  const [searchInput, setSearchInput] = useState('')
  const [appliedSearchTerm, setAppliedSearchTerm] = useState('')

  const [selectedRole, setSelectedRole] = useState('All')
  const [appliedRole, setAppliedRole] = useState('All')

  const [selectedBranch, setSelectedBranch] = useState('All')
  const [appliedBranch, setAppliedBranch] = useState('All')

  const [selectedStatus, setSelectedStatus] = useState('All')
  const [appliedStatus, setAppliedStatus] = useState('All')

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: '',
    branchName: '',
    status: 'Active',
  })

  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [togglingStatusUser, setTogglingStatusUser] = useState<User | null>(null)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('token')) {
      fetchUsers()
    }
  }, [])

  const fetchUsers = async () => {
    try {
      const res = await userService.getUsers()
      const data = res.data || res // Handle both wrapped and unwrapped arrays safely
      const mappedUsers = data.map((u: any) => ({
        id: u.id,
        firstName: u.first_name,
        lastName: u.last_name || '',
        fullName: `${u.first_name} ${u.last_name || ''}`.trim(),
        email: u.email,
        phoneNumber: u.mobile_number,
        role: mapRoleToDisplay(u.role),
        branchName: u.pharmacy ? u.pharmacy.pharmacy_name : 'N/A',
        status: u.is_active ? 'Active' : 'Inactive',
        pharmacyId: u.pharmacy_id,
      }))
      setUsers(mappedUsers)
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleConfirmSave = async () => {
    if (!editingUser) return
    try {
      const pharmacyId = pharmacies.find(p => p.name === editingUser.branchName)?.id
      await userService.updateUser(editingUser.id, {
        first_name: editingUser.firstName,
        last_name: editingUser.lastName,
        email: editingUser.email,
        mobile_number: editingUser.phoneNumber,
        role: mapDisplayToRole(editingUser.role),
        pharmacy_id: pharmacyId,
        is_active: editingUser.status === 'Active'
      })
      await fetchUsers()
      setIsConfirmModalOpen(false)
      setEditingUser(null)
      setIsSuccessModalOpen(true)
    } catch (error) {
      console.error('Error updating user:', error)
    }
  }

  const handleConfirmToggleStatus = async () => {
    if (!togglingStatusUser) return
    try {
      await userService.updateUser(togglingStatusUser.id, {
        is_active: togglingStatusUser.status !== 'Active'
      })
      await fetchUsers()
      setTogglingStatusUser(null)
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const handleSearch = () => {
    setAppliedSearchTerm(searchInput)
    setAppliedRole(selectedRole)
    setAppliedBranch(selectedBranch)
    setAppliedStatus(selectedStatus)
    setCurrentPage(1)
  }

  const handleResetFilters = () => {
    setSearchInput('')
    setAppliedSearchTerm('')
    setSelectedRole('All')
    setAppliedRole('All')
    setSelectedBranch('All')
    setAppliedBranch('All')
    setSelectedStatus('All')
    setAppliedStatus('All')
    setCurrentPage(1)
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim()) return

    try {
      const pharmacyId = pharmacies.find(p => p.name === formData.branchName)?.id
      await userService.createUser({
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        mobile_number: formData.phoneNumber,
        role: mapDisplayToRole(formData.role || 'Pharmacist'),
        pharmacy_id: pharmacyId,
        is_active: formData.status === 'Active'
      })
      await fetchUsers()
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        role: '',
        branchName: '',
        status: 'Active',
      })
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Error adding user:', error)
    }
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !editingUser.firstName.trim()) return
    setIsConfirmModalOpen(true)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !appliedSearchTerm ||
      user.fullName.toLowerCase().includes(appliedSearchTerm.toLowerCase().trim()) ||
      user.email?.toLowerCase().includes(appliedSearchTerm.toLowerCase().trim())
    const matchesRole = appliedRole === 'All' || appliedRole === 'Roles' || user.role === appliedRole
    const matchesBranch = appliedBranch === 'All' || appliedBranch === 'Branches' || user.branchName === appliedBranch
    const matchesStatus = appliedStatus === 'All' || appliedStatus === 'Status' || user.status === appliedStatus

    return matchesSearch && matchesRole && matchesBranch && matchesStatus
  })

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = Math.min(filteredUsers.length, startIndex + itemsPerPage)
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

  const getPageNumbers = () => {
    const pages: number[] = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, safeCurrentPage - Math.floor(maxVisiblePages / 2))
    let endPage = startPage + maxVisiblePages - 1

    if (endPage > totalPages) {
      endPage = totalPages
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm font-[var(--font-primary)]">
      {/* Header Title & Add Button */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.6rem)] font-regular text-white tracking-wide">
          Users
        </h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#2aa6e0] hover:bg-[#35b3f0] text-white text-sm font-semibold px-5 py-2.5 rounded-[10px] shadow transition-colors cursor-pointer"
        >
          <span className="text-base font-bold">+</span> Add new user
        </button>
      </div>

      {/* Filter / Search Card Container */}
      <div className="bg-[#424754] rounded-[16px] p-5 mb-6 shadow-lg border border-[rgba(255,255,255,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search by username */}
          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-[#8ccfed] font-semibold text-sm">
              Search by username
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3 flex items-center text-gray-400 pointer-events-none">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSearch()
                }}
                placeholder=""
                className="w-full bg-[#6a6a6a] text-white pl-10 pr-4 py-2 rounded-[8px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] transition-colors text-sm"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[#8ccfed] font-semibold text-sm">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#6a6a6a] text-white px-3 py-2 rounded-[8px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] cursor-pointer text-sm appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_12px_center] bg-no-repeat"
            >
              {ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#424754]">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[#8ccfed] font-semibold text-sm">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-[#6a6a6a] text-white px-3 py-2 rounded-[8px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] cursor-pointer text-sm appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_12px_center] bg-no-repeat"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b} className="bg-[#424754]">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-[#8ccfed] font-semibold text-sm">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#6a6a6a] text-white px-3 py-2 rounded-[8px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] cursor-pointer text-sm appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_12px_center] bg-no-repeat"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="bg-[#424754]">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons: Search & Reset */}
          <div className="md:col-span-2 flex items-center gap-3">
            <button
              onClick={handleSearch}
              className="flex-1 bg-[#48aad9] hover:bg-[#3ca0d0] text-white font-medium py-2 rounded-[8px] transition-colors cursor-pointer text-center text-sm"
            >
              Search
            </button>
            <button
              onClick={handleResetFilters}
              className="flex-1 bg-white hover:bg-gray-100 text-[#22313b] font-medium py-2 rounded-[8px] transition-colors cursor-pointer text-center text-sm"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Users Table Card */}
      <div className="bg-[#424754] rounded-[10px] overflow-hidden shadow-xl border border-[rgba(255,255,255,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#8ccfed] text-[#22313b]">
                <th className="py-3 px-5 font-semibold text-xs rounded-tl-[10px] w-[22%]">Full Name</th>
                <th className="py-3 px-5 font-semibold text-xs w-[22%]">Role</th>
                <th className="py-3 px-5 font-semibold text-xs w-[26%]">Branch Name</th>
                <th className="py-3 px-5 font-semibold text-xs w-[15%]">
                  <div className="flex items-center gap-2">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="4" y1="6" x2="20" y2="6"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                      <line x1="10" y1="18" x2="14" y2="18"></line>
                    </svg>
                    Status
                  </div>
                </th>
                <th className="py-3 px-5 font-semibold text-xs text-center rounded-tr-[10px] w-[15%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.03)]">
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[rgba(255,255,255,0.01)] transition-colors align-middle"
                  >
                    <td className="py-4 px-5 text-gray-100 text-sm font-medium">
                      {user.fullName}
                    </td>
                    <td className="py-4 px-5 text-gray-200 text-sm">
                      {user.role}
                    </td>
                    <td className="py-4 px-5 text-gray-200 text-sm">
                      {user.branchName}
                    </td>
                    <td className="py-4 px-5 text-sm font-medium">
                      <span
                        className={
                          user.status === 'Active'
                            ? 'text-[#4ade80]'
                            : 'text-red-400'
                        }
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="min-w-[54px] h-8 flex items-center justify-center px-2.5 rounded-[6px] border border-[#2aa6e0] text-[#8ccfed] hover:bg-[#2aa6e0]/10 text-xs font-medium transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setTogglingStatusUser(user)}
                          className={`min-w-[70px] h-8 flex items-center justify-center px-2.5 rounded-[6px] border text-xs font-medium transition-colors cursor-pointer ${user.status === 'Active'
                            ? 'border-red-500 text-red-400 hover:bg-red-500/10'
                            : 'border-green-500 text-green-400 hover:bg-green-500/10'
                            }`}
                        >
                          {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                    No users found matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="bg-[#383d4a] border-t border-[rgba(255,255,255,0.06)] px-5 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-gray-300">
            <span>Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value))
                setCurrentPage(1)
              }}
              className="bg-[#2a2d36] text-white px-2 py-1 rounded border border-[rgba(255,255,255,0.1)] outline-none cursor-pointer text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span>entries</span>
            <span className="text-gray-400 border-l border-gray-600 pl-3">
              Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} to {endIndex} of {filteredUsers.length} entries
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1 rounded bg-[#2a2d36] text-gray-300 hover:bg-[#4e5566] hover:text-white border border-[rgba(255,255,255,0.06)] text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="First Page"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={safeCurrentPage === 1}
              className="px-2.5 py-1 rounded bg-[#2a2d36] text-gray-300 hover:bg-[#4e5566] hover:text-white border border-[rgba(255,255,255,0.06)] text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Previous Page"
            >
              ‹
            </button>

            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[30px] h-7 px-2 rounded text-xs font-medium transition-colors cursor-pointer ${
                  pageNum === safeCurrentPage
                    ? 'bg-[#2aa6e0] text-white font-bold'
                    : 'bg-[#2a2d36] text-gray-300 hover:bg-[#4e5566] hover:text-white border border-[rgba(255,255,255,0.06)]'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1 rounded bg-[#2a2d36] text-gray-300 hover:bg-[#4e5566] hover:text-white border border-[rgba(255,255,255,0.06)] text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Next Page"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={safeCurrentPage === totalPages}
              className="px-2.5 py-1 rounded bg-[#2a2d36] text-gray-300 hover:bg-[#4e5566] hover:text-white border border-[rgba(255,255,255,0.06)] text-xs transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              title="Last Page"
            >
              »
            </button>
          </div>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        maxWidth="max-w-[460px]"
        animate={false}
        className="bg-[#2b2f3a] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-7 text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-wide">
          Add New User
        </h2>

        <form onSubmit={handleAddUser} className="space-y-6">
          {/* Section 1: Basic Info */}
          <div>
            <h3 className="text-[#48aad9] font-bold text-base mb-3">
              Basic Info
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                placeholder="First Name"
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              />
              <Input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                placeholder="Last Name"
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              />
            </div>
            <div className="space-y-3 mt-3">
              <Input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Email"
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              />
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                placeholder="Phone Number"
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              />
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] pt-5">
            {/* Section 2: Permissions */}
            <h3 className="text-[#48aad9] font-bold text-base mb-3">
              Permissions
            </h3>
            <div className="space-y-3">
              <Select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                iconSize={12}
                iconColor="text-gray-400"
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
                options={[
                  { value: '', label: 'Role', disabled: true, hidden: true },
                  ...ROLES.filter((r) => r !== 'All').map((role) => ({
                    value: role,
                    label: role,
                    className: 'bg-[#2b2f3a]',
                  })),
                ]}
              />

              <Select
                value={formData.branchName}
                onChange={(e) =>
                  setFormData({ ...formData, branchName: e.target.value })
                }
                iconSize={12}
                iconColor="text-gray-400"
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
                options={[
                  { value: '', label: 'Branch Name', disabled: true, hidden: true },
                  ...BRANCHES.filter((b) => b !== 'All').map((branch) => ({
                    value: branch,
                    label: branch,
                    className: 'bg-[#2b2f3a]',
                  })),
                ]}
              />
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.08)] pt-5">
            {/* Section 3: Account */}
            <h3 className="text-[#48aad9] font-bold text-base mb-3">
              Account
            </h3>
            <div className="mb-6">
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as 'Active' | 'Inactive',
                  })
                }
                iconSize={12}
                iconColor="text-gray-400"
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
                options={[
                  { value: '', label: 'Status', disabled: true, hidden: true },
                  { value: 'Active', label: 'Active', className: 'bg-[#2b2f3a]' },
                  { value: 'Inactive', label: 'Inactive', className: 'bg-[#2b2f3a]' },
                ]}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="flex-1 border border-[#48aad9]/50 hover:border-[#48aad9] hover:bg-[#48aad9]/10 text-white font-medium py-2.5 rounded-[8px] transition-colors cursor-pointer text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#48aad9] hover:bg-[#3ba0d0] text-white font-medium py-2.5 rounded-[8px] transition-colors cursor-pointer text-sm shadow"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        maxWidth="max-w-[440px]"
        animate={false}
        className="bg-[#2b2f3a] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-7 text-white"
      >
        <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-wide">
          Edit User Information
        </h2>
        {editingUser && (
          <form onSubmit={handleUpdateUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="First Name"
                type="text"
                required
                value={editingUser.firstName}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, firstName: e.target.value })
                }
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              />
              <Input
                label="Last Name"
                type="text"
                value={editingUser.lastName}
                onChange={(e) =>
                  setEditingUser({ ...editingUser, lastName: e.target.value })
                }
                className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              />
            </div>

            <Select
              label="Role"
              value={editingUser.role}
              onChange={(e) =>
                setEditingUser({ ...editingUser, role: e.target.value })
              }
              iconSize={14}
              iconColor="text-gray-300"
              className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              options={ROLES.filter((r) => r !== 'All' && r !== 'Roles').map((role) => ({
                value: role,
                label: role,
                className: 'bg-[#2b2f3a]',
              }))}
            />

            <Select
              label="Branch Name"
              value={editingUser.branchName}
              onChange={(e) =>
                setEditingUser({ ...editingUser, branchName: e.target.value })
              }
              iconSize={14}
              iconColor="text-gray-300"
              className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              options={BRANCHES.filter((b) => b !== 'All' && b !== 'Branches').map((branch) => ({
                value: branch,
                label: branch,
                className: 'bg-[#2b2f3a]',
              }))}
            />

            <Select
              label="Status"
              value={editingUser.status}
              onChange={(e) =>
                setEditingUser({
                  ...editingUser,
                  status: e.target.value as 'Active' | 'Inactive',
                })
              }
              iconSize={14}
              iconColor="text-gray-300"
              className="bg-[#404554] rounded-[8px] py-3 focus:ring-1 focus:ring-[#48aad9]"
              options={[
                { value: 'Active', label: 'Active', className: 'bg-[#2b2f3a]' },
                { value: 'Inactive', label: 'Inactive', className: 'bg-[#2b2f3a]' },
              ]}
            />

            <div className="flex items-center gap-4 pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="flex-1 border border-[#48aad9]/50 hover:border-[#48aad9] hover:bg-[#48aad9]/10 text-white font-medium py-2.5 rounded-[8px] transition-colors cursor-pointer text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#48aad9] hover:bg-[#3ba0d0] text-white font-medium py-2.5 rounded-[8px] transition-colors cursor-pointer text-sm shadow"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Confirm Changes Modal */}
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        icon="save-changes"
        title="Confirm Changes"
        description={
          <>
            Are you sure you want to save these changes?<br />
            The user's information will be updated accordingly.
          </>
        }
        cancelLabel="Cancel"
        confirmLabel="Save Changes"
        onConfirm={handleConfirmSave}
        confirmButtonVariant="blue"
        maxWidth="max-w-[440px]"
        zIndex="z-[60]"
      />

      {/* Changes Saved Successfully Modal */}
      <ConfirmModal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        icon="saved-successful"
        title="Changes Saved Successfully"
        description="The information has been recorded successfully"
        confirmLabel="Done"
        onConfirm={() => setIsSuccessModalOpen(false)}
        confirmButtonVariant="green"
        singleButton
        maxWidth="max-w-[440px]"
        zIndex="z-[60]"
      />

      {/* Deactivate / Activate User Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(togglingStatusUser)}
        onClose={() => setTogglingStatusUser(null)}
        icon={togglingStatusUser?.status === 'Active' ? 'delete-icon' : 'success-question'}
        title={togglingStatusUser?.status === 'Active' ? 'Deactivate User' : 'Activate User'}
        titleColor={togglingStatusUser?.status === 'Active' ? 'text-[#ff4d4d]' : 'text-[#4ade80]'}
        description={
          togglingStatusUser?.status === 'Active' ? (
            <>
              Are you sure you want to deactivate this user?<br />
              The user will no longer be able to log in or<br />
              access the system.<br />
              You can reactivate the user anytime.
            </>
          ) : (
            <>
              Are you sure you want to activate this user?<br />
              The user will regain access to log in and<br />
              access the system.
            </>
          )
        }
        extraContent={
          togglingStatusUser ? (
            <div className="bg-[#383d4a] rounded-[14px] p-4 text-left mb-6 flex items-start gap-3.5 border border-white/5">
              <div className="text-[#38bdf8] pt-0.5 flex-shrink-0">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                </svg>
              </div>
              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px]">Full Name</span>
                  <span className="text-white font-semibold text-xs">{togglingStatusUser.fullName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Role</span>
                  <span className="text-gray-200 text-xs">{togglingStatusUser.role}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">Pharmacy</span>
                  <span className="text-gray-200 text-xs">{togglingStatusUser.branchName || '—'}</span>
                </div>
              </div>
            </div>
          ) : null
        }
        cancelLabel="Cancel"
        confirmLabel={togglingStatusUser?.status === 'Active' ? 'Deactivate User' : 'Activate User'}
        onConfirm={handleConfirmToggleStatus}
        confirmButtonVariant={togglingStatusUser?.status === 'Active' ? 'danger' : 'green'}
        containerBgClass="bg-[#262933]"
        paddingClass="p-7"
        buttonTextSize="text-xs"
        maxWidth="max-w-[420px]"
        zIndex="z-[60]"
      />
    </div>
  )
}

export default Users
