import React, { useState } from 'react';
import { Input } from '../../components/common/Input';
import profileIcon from '../../assets/profile-icon.svg';

const Profile = () => {
  const [formData, setFormData] = useState({
    firstName: 'Denmar',
    lastName: 'Superman',
    email: 'denmar@pharmadali.com',
    phone: '+1 234 567 8900',
    role: 'Super Admin'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    console.log('Profile saved', formData);
  };

  return (
    <div className="flex flex-col w-full h-full flex-1 min-h-0 text-sm font-[var(--font-primary)]">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="m-0 text-[clamp(1.8rem,3vw,2.6rem)] font-regular text-white tracking-wide">
          Profile Settings
        </h1>
      </div>

      <div className="bg-[#424754] border border-[rgba(255,255,255,0.05)] rounded-[24px] p-6 md:p-8 shadow-lg flex flex-col gap-8 w-full max-w-[800px] mx-auto">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-[#404552] border-2 border-[#48aad9] flex items-center justify-center overflow-hidden shadow-inner shrink-0">
            <img src={profileIcon} alt="Profile" className="w-12 h-12 opacity-80" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white m-0 mb-1">{formData.firstName} {formData.lastName}</h2>
            <p className="text-[#8ccfed] text-sm font-semibold tracking-wide m-0">{formData.role}</p>
            <button className="mt-3 px-4 py-1.5 rounded-full bg-[rgba(140,207,237,0.1)] text-[#8ccfed] text-xs font-semibold hover:bg-[rgba(140,207,237,0.2)] border border-[rgba(140,207,237,0.2)] transition-colors">
              Change Picture
            </button>
          </div>
        </div>

        <div className="w-full h-px bg-[rgba(255,255,255,0.05)]" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input 
            label="First Name" 
            name="firstName" 
            value={formData.firstName} 
            onChange={handleChange} 
            placeholder="Enter first name"
          />
          <Input 
            label="Last Name" 
            name="lastName" 
            value={formData.lastName} 
            onChange={handleChange} 
            placeholder="Enter last name"
          />
          <Input 
            label="Email Address" 
            name="email" 
            type="email"
            value={formData.email} 
            onChange={handleChange} 
            placeholder="Enter email address"
          />
          <Input 
            label="Phone Number" 
            name="phone" 
            value={formData.phone} 
            onChange={handleChange} 
            placeholder="Enter phone number"
          />
          <Input 
            label="Role" 
            name="role" 
            value={formData.role} 
            onChange={handleChange} 
            disabled
            containerClassName="opacity-70 cursor-not-allowed"
          />
        </div>

        <div className="flex justify-end pt-4 border-t border-[rgba(255,255,255,0.05)]">
          <button 
            onClick={handleSave}
            className="px-6 py-3 bg-[#48aad9] hover:bg-[#2aa6e0] text-white font-bold rounded-[12px] shadow-md transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#96d2ee]"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
