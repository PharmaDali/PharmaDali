import React from 'react'

export interface StatusCardProps {
  title: string
  value: string | number
  orderLabel?: string
  tone?: 'default' | 'danger' | 'warning'
}

const toneClasses = {
  default: {
    card: 'bg-[#8ccfed]',
    title: 'text-[#323642]',
    value: 'text-[#22313b]',
  },
  danger: {
    card: 'bg-[#F56262]',
    title: 'text-[#2d1a1a]',
    value: 'text-[#2b1f20]',
  },
  warning: {
    card: 'bg-[#F0C131]',
    title: 'text-[#2d2a1a]',
    value: 'text-[#2d2a1a]',
  },
}

const StatusCard: React.FC<StatusCardProps> = ({ title, value, orderLabel, tone = 'default' }) => {
  const colors = toneClasses[tone]

  return (
    <div className="flex flex-col">
      <span className="text-[#a1a1aa] text-xs font-medium mb-2 h-4">
        {orderLabel || ''}
      </span>
      <div className={`${colors.card} rounded-xl p-4 flex flex-col justify-between h-[100px] shadow-sm`}>
        <span className={`${colors.title} text-sm font-medium`}>{title}</span>
        <span className={`${colors.value} text-[32px] font-bold leading-none mt-2`}>{value}</span>
      </div>
    </div>
  )
}

export default StatusCard
