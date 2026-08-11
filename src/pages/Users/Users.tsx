import React, { useState } from 'react'

export interface User {
  id: number
  fullName: string
  email?: string
  phoneNumber?: string
  role: string
  branchName: string
  status: 'Active' | 'Inactive'
}

const INITIAL_USERS: User[] = [
  { id: 1, fullName: 'Sarah Geronimo', email: 'sarah@gmail.com', phoneNumber: '09123456789', role: 'Pharmacist', branchName: 'Landicho Drugstore', status: 'Active' },
  { id: 2, fullName: 'Lisa Manoban', email: 'lisa@gmail.com', phoneNumber: '09223334444', role: 'Users', branchName: 'Landicho Drugstore', status: 'Active' },
  { id: 3, fullName: 'Sabrina Carpenter', email: 'sabrina@gmail.com', phoneNumber: '09334445555', role: 'Manager(Admin)', branchName: 'Puremed', status: 'Active' },
  { id: 4, fullName: 'Bini Maloi', email: 'maloi@gmail.com', phoneNumber: '09445556666', role: 'Manager(Admin)', branchName: 'Puremed', status: 'Active' },
  { id: 5, fullName: 'Hev abi', email: 'hevabi@gmail.com', phoneNumber: '09556667777', role: 'Assistant Pharmacist', branchName: 'TGP', status: 'Active' },
]

const ROLES = ['All', 'Roles', 'Pharmacist', 'Users', 'Manager(Admin)', 'Assistant Pharmacist']
const BRANCHES = ['All', 'Branches', 'Landicho Drugstore', 'Puremed', 'TGP']
const STATUSES = ['All', 'Status', 'Active', 'Inactive']

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedBranch, setSelectedBranch] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    role: '',
    branchName: '',
    status: '',
  })


  const [editingUser, setEditingUser] = useState<User | null>(null)

  const handleResetFilters = () => {
    setSearchTerm('')
    setSelectedRole('All')
    setSelectedBranch('All')
    setSelectedStatus('All')
  }

  const handleToggleStatus = (id: number) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === 'Active' ? 'Inactive' : 'Active' }
          : user
      )
    )
  }

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.fullName.trim()) return

    const newUser: User = {
      id: Date.now(),
      fullName: formData.fullName,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      role: formData.role || 'Pharmacist',
      branchName: formData.branchName || 'Landicho Drugstore',
      status: (formData.status as 'Active' | 'Inactive') || 'Active',
    }

    setUsers((prev) => [newUser, ...prev])
    setFormData({
      fullName: '',
      email: '',
      phoneNumber: '',
      role: '',
      branchName: '',
      status: '',
    })
    setIsAddModalOpen(false)
  }

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !editingUser.fullName.trim()) return

    setUsers((prev) =>
      prev.map((user) => (user.id === editingUser.id ? editingUser : user))
    )
    setEditingUser(null)
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !searchTerm ||
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase().trim())
    const matchesRole = selectedRole === 'All' || user.role === selectedRole
    const matchesBranch = selectedBranch === 'All' || user.branchName === selectedBranch
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus

    return matchesSearch && matchesRole && matchesBranch && matchesStatus
  })

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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              onClick={() => { }}
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
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
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
                            : 'text-gray-400'
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
                          onClick={() => handleToggleStatus(user.id)}
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
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="bg-[#2b2f3a] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-7 w-full max-w-[460px] shadow-2xl text-white">
            <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-wide">
              Add New User
            </h2>

            <form onSubmit={handleAddUser} className="space-y-6">
              {/* Section 1: Basic Info */}
              <div>
                <h3 className="text-[#48aad9] font-bold text-base mb-3">
                  Basic Info
                </h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    placeholder="Full Name"
                    className="w-full bg-[#404554] text-gray-100 placeholder:text-gray-400 px-4 py-3 rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#48aad9] transition-colors"
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Email"
                    className="w-full bg-[#404554] text-gray-100 placeholder:text-gray-400 px-4 py-3 rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#48aad9] transition-colors"
                  />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, phoneNumber: e.target.value })
                    }
                    placeholder="Phone Number"
                    className="w-full bg-[#404554] text-gray-100 placeholder:text-gray-400 px-4 py-3 rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#48aad9] transition-colors"
                  />
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.08)] pt-5">
                {/* Section 2: Permissions */}
                <h3 className="text-[#48aad9] font-bold text-base mb-3">
                  Permissions
                </h3>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }
                      className="w-full bg-[#404554] text-gray-100 px-4 py-3 rounded-[8px] text-sm appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-[#48aad9] cursor-pointer"
                    >
                      <option value="" disabled hidden>
                        Role
                      </option>
                      {ROLES.filter((r) => r !== 'All').map((role) => (
                        <option key={role} value={role} className="bg-[#2b2f3a]">
                          {role}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>

                  <div className="relative">
                    <select
                      value={formData.branchName}
                      onChange={(e) =>
                        setFormData({ ...formData, branchName: e.target.value })
                      }
                      className="w-full bg-[#404554] text-gray-100 px-4 py-3 rounded-[8px] text-sm appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-[#48aad9] cursor-pointer"
                    >
                      <option value="" disabled hidden>
                        Branch Name
                      </option>
                      {BRANCHES.filter((b) => b !== 'All').map((branch) => (
                        <option key={branch} value={branch} className="bg-[#2b2f3a]">
                          {branch}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-[rgba(255,255,255,0.08)] pt-5">
                {/* Section 3: Account */}
                <h3 className="text-[#48aad9] font-bold text-base mb-3">
                  Account
                </h3>
                <div className="relative mb-6">
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'Active' | 'Inactive',
                      })
                    }
                    className="w-full bg-[#404554] text-gray-100 px-4 py-3 rounded-[8px] text-sm appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-[#48aad9] cursor-pointer"
                  >
                    <option value="" disabled hidden>
                      Status
                    </option>
                    <option value="Active" className="bg-[#2b2f3a]">Active</option>
                    <option value="Inactive" className="bg-[#2b2f3a]">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
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
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4">
          <div className="bg-[#2b2f3a] border border-[rgba(255,255,255,0.06)] rounded-[16px] p-7 w-full max-w-[440px] shadow-2xl text-white">
            <h2 className="text-2xl font-bold text-center mb-6 text-white tracking-wide">
              Edit User Information
            </h2>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#48aad9] mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, fullName: e.target.value })
                  }
                  className="w-full bg-[#404554] text-gray-100 placeholder:text-gray-400 px-4 py-3 rounded-[8px] text-sm focus:outline-none focus:ring-1 focus:ring-[#48aad9] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48aad9] mb-1.5">
                  Role
                </label>
                <div className="relative">
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value })
                    }
                    className="w-full bg-[#404554] text-gray-100 px-4 py-3 rounded-[8px] text-sm appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-[#48aad9] cursor-pointer"
                  >
                    {ROLES.filter((r) => r !== 'All' && r !== 'Roles').map((role) => (
                      <option key={role} value={role} className="bg-[#2b2f3a]">
                        {role}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48aad9] mb-1.5">
                  Branch Name
                </label>
                <div className="relative">
                  <select
                    value={editingUser.branchName}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, branchName: e.target.value })
                    }
                    className="w-full bg-[#404554] text-gray-100 px-4 py-3 rounded-[8px] text-sm appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-[#48aad9] cursor-pointer"
                  >
                    {BRANCHES.filter((b) => b !== 'All' && b !== 'Branches').map((branch) => (
                      <option key={branch} value={branch} className="bg-[#2b2f3a]">
                        {branch}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#48aad9] mb-1.5">
                  Status
                </label>
                <div className="relative">
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        status: e.target.value as 'Active' | 'Inactive',
                      })
                    }
                    className="w-full bg-[#404554] text-gray-100 px-4 py-3 rounded-[8px] text-sm appearance-none pr-10 focus:outline-none focus:ring-1 focus:ring-[#48aad9] cursor-pointer"
                  >
                    <option value="Active" className="bg-[#2b2f3a]">Active</option>
                    <option value="Inactive" className="bg-[#2b2f3a]">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 right-3.5 flex items-center pointer-events-none text-gray-300">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>

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
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
