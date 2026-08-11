import React, { useState } from 'react'

export interface User {
  id: number
  fullName: string
  role: string
  branchName: string
  status: 'Active' | 'Inactive'
}

const INITIAL_USERS: User[] = [
  { id: 1, fullName: 'Sarah Geronimo', role: 'Pharmacist', branchName: 'Landicho Drugstore', status: 'Active' },
  { id: 2, fullName: 'Lisa Manoban', role: 'Users', branchName: 'Landicho Drugstore', status: 'Active' },
  { id: 3, fullName: 'Sabrina Carpenter', role: 'Manager(Admin)', branchName: 'Puremed', status: 'Active' },
  { id: 4, fullName: 'Bini Maloi', role: 'Manager(Admin)', branchName: 'Puremed', status: 'Active' },
  { id: 5, fullName: 'Hev abi', role: 'Assistant Pharmacist', branchName: 'TGP', status: 'Active' },
]

const ROLES = ['All', 'Pharmacist', 'Users', 'Manager(Admin)', 'Assistant Pharmacist']
const BRANCHES = ['All', 'Landicho Drugstore', 'Puremed', 'TGP']
const STATUSES = ['All', 'Active', 'Inactive']

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedBranch, setSelectedBranch] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    role: 'Pharmacist',
    branchName: 'Landicho Drugstore',
    status: 'Active' as 'Active' | 'Inactive',
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
      role: formData.role,
      branchName: formData.branchName,
      status: formData.status,
    }

    setUsers((prev) => [newUser, ...prev])
    setFormData({
      fullName: '',
      role: 'Pharmacist',
      branchName: 'Landicho Drugstore',
      status: 'Active',
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
      <div className="bg-[#424754] rounded-[16px] p-6 mb-8 shadow-lg border border-[rgba(255,255,255,0.04)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          {/* Search by username */}
          <div className="md:col-span-4 flex flex-col gap-2">
            <label className="text-[#8ccfed] font-semibold text-base">
              Search by username
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-3.5 flex items-center text-gray-400 pointer-events-none">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
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
                className="w-full bg-[#6a6a6a] text-white pl-11 pr-4 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] transition-colors text-base"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[#8ccfed] font-semibold text-base">Role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full bg-[#6a6a6a] text-white px-3 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] cursor-pointer text-base appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_12px_center] bg-no-repeat"
            >
              {ROLES.map((role) => (
                <option key={role} value={role} className="bg-[#424754]">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Branch Filter */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[#8ccfed] font-semibold text-base">Branch</label>
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full bg-[#6a6a6a] text-white px-3 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] cursor-pointer text-base appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_12px_center] bg-no-repeat"
            >
              {BRANCHES.map((b) => (
                <option key={b} value={b} className="bg-[#424754]">
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2 flex flex-col gap-2">
            <label className="text-[#8ccfed] font-semibold text-base">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full bg-[#6a6a6a] text-white px-3 py-2.5 rounded-[10px] border border-transparent focus:outline-none focus:bg-[#7a7a7a] cursor-pointer text-base appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[right_12px_center] bg-no-repeat"
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
              className="flex-1 bg-[#48aad9] hover:bg-[#3ca0d0] text-white font-semibold py-2.5 rounded-[10px] transition-colors cursor-pointer text-center text-base"
            >
              Search
            </button>
            <button
              onClick={handleResetFilters}
              className="flex-1 bg-white hover:bg-gray-100 text-[#22313b] font-semibold py-2.5 rounded-[10px] transition-colors cursor-pointer text-center text-base"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Main Users Table Card */}
      <div className="bg-[#424754] rounded-[16px] overflow-hidden shadow-xl border border-[rgba(255,255,255,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-[#8ccfed] text-[#22313b]">
                <th className="py-3.5 px-6 font-bold text-base w-[22%]">Full Name</th>
                <th className="py-3.5 px-6 font-bold text-base w-[22%]">Role</th>
                <th className="py-3.5 px-6 font-bold text-base w-[26%]">Branch Name</th>
                <th className="py-3.5 px-6 font-bold text-base w-[15%]">
                  <div className="flex items-center gap-2">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
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
                <th className="py-3.5 px-6 font-bold text-base text-center w-[15%]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.08)]">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                  >
                    <td className="py-4 px-6 text-white text-base font-semibold">
                      {user.fullName}
                    </td>
                    <td className="py-4 px-6 text-gray-200 text-base">
                      {user.role}
                    </td>
                    <td className="py-4 px-6 text-gray-200 text-base">
                      {user.branchName}
                    </td>
                    <td className="py-4 px-6 text-base font-semibold">
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
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-4 py-1.5 rounded-[6px] border border-[#2aa6e0] text-[#8ccfed] hover:bg-[#2aa6e0]/15 text-sm font-semibold transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user.id)}
                          className={`px-3 py-1.5 rounded-[6px] border text-sm font-semibold transition-colors cursor-pointer ${user.status === 'Active'
                            ? 'border-red-500 text-red-400 hover:bg-red-500/15'
                            : 'border-green-500 text-green-400 hover:bg-green-500/15'
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
                  <td colSpan={5} className="py-10 text-center text-gray-300 text-base">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#292d37] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 md:p-8 w-full max-w-[500px] shadow-2xl text-white">
            <h2 className="text-2xl font-bold mb-6 text-white">Add New User</h2>
            <form onSubmit={handleAddUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#8ccfed] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="w-full bg-[#3a3f4d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-4 py-2.5 text-white focus:outline-none focus:border-[#48aad9]"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8ccfed] mb-2">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full bg-[#3a3f4d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-4 py-2.5 text-white focus:outline-none focus:border-[#48aad9]"
                >
                  {ROLES.filter((r) => r !== 'All').map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8ccfed] mb-2">
                  Branch Name
                </label>
                <select
                  value={formData.branchName}
                  onChange={(e) =>
                    setFormData({ ...formData, branchName: e.target.value })
                  }
                  className="w-full bg-[#3a3f4d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-4 py-2.5 text-white focus:outline-none focus:border-[#48aad9]"
                >
                  {BRANCHES.filter((b) => b !== 'All').map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8ccfed] mb-2">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as 'Active' | 'Inactive',
                    })
                  }
                  className="w-full bg-[#3a3f4d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-4 py-2.5 text-white focus:outline-none focus:border-[#48aad9]"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2 rounded-[8px] bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[8px] bg-[#48aad9] hover:bg-[#3ba0d0] text-white font-semibold transition-colors cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-[#292d37] border border-[rgba(255,255,255,0.08)] rounded-[20px] p-6 md:p-8 w-full max-w-[500px] shadow-2xl text-white">
            <h2 className="text-2xl font-bold mb-6 text-white">Edit User</h2>
            <form onSubmit={handleUpdateUser} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#8ccfed] mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={editingUser.fullName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, fullName: e.target.value })
                  }
                  className="w-full bg-[#3a3f4d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-4 py-2.5 text-white focus:outline-none focus:border-[#48aad9]"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8ccfed] mb-2">
                  Role
                </label>
                <select
                  value={editingUser.role}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, role: e.target.value })
                  }
                  className="w-full bg-[#3a3f4d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-4 py-2.5 text-white focus:outline-none focus:border-[#48aad9]"
                >
                  {ROLES.filter((r) => r !== 'All').map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#8ccfed] mb-2">
                  Branch Name
                </label>
                <select
                  value={editingUser.branchName}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, branchName: e.target.value })
                  }
                  className="w-full bg-[#3a3f4d] border border-[rgba(255,255,255,0.1)] rounded-[8px] px-4 py-2.5 text-white focus:outline-none focus:border-[#48aad9]"
                >
                  {BRANCHES.filter((b) => b !== 'All').map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-2 rounded-[8px] bg-gray-600 hover:bg-gray-500 text-white font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-[8px] bg-[#48aad9] hover:bg-[#3ba0d0] text-white font-semibold transition-colors cursor-pointer"
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
