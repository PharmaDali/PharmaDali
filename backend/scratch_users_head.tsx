import React, { useState, useEffect } from 'react'
import { Modal, ConfirmModal, Input, Select } from '../../components/common'
import api from '../../shared/api'
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
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users')
      const mappedUsers = response.data.map((u: any) => ({
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
      await api.put(`/users/${editingUser.id}`, {
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
      await api.put(`/users/${togglingStatusUser.id}`, {
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
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.firstName.trim()) return

    try {
      const pharmacyId = pharmacies.find(p => p.name === formData.branchName)?.id
      await api.post('/users', {
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
