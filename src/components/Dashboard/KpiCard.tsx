import React from 'react'

export interface KpiCardProps {
  title: string
  value: string | number
  orderLabel?: string
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, orderLabel }) => {
  return (
    <div className="flex flex-col">
      <span className="text-[#a1a1aa] text-xs font-medium mb-2 h-4">
        {orderLabel || ''}
      </span>
      <div className="bg-[#8ccfed] rounded-xl p-4 flex flex-col justify-between h-[100px] shadow-sm">
        <span className="text-[#323642] text-sm font-medium">{title}</span>
        <span className="text-[#22313b] text-[32px] font-bold leading-none mt-2">{value}</span>
      </div>
    </div>
  )
}

export default KpiCard
