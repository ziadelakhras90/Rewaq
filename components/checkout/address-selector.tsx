'use client'

// components/checkout/address-selector.tsx

import { useState } from 'react'

export interface Address {
  id:        string
  label:     string | null
  full_name: string
  phone:     string
  city:      string
  district:  string | null
  street:    string | null
  building:  string | null
  notes:     string | null
  is_default: boolean
}

interface AddressSelectorProps {
  addresses:       Address[]
  selectedId:      string | null
  onSelect:        (id: string) => void
  onAddNew:        () => void
}

export function AddressSelector({
  addresses,
  selectedId,
  onSelect,
  onAddNew,
}: AddressSelectorProps) {

  if (addresses.length === 0) {
    return (
      <div dir="rtl" className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 p-6 text-center">
        <p className="mb-3 text-sm text-stone-500">لا توجد عناوين محفوظة بعد</p>
        <button
          onClick={onAddNew}
          className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition"
        >
          إضافة عنوان جديد
        </button>
      </div>
    )
  }

  return (
    <div dir="rtl" className="space-y-3">
      {addresses.map((addr) => (
        <AddressCard
          key={addr.id}
          address={addr}
          selected={selectedId === addr.id}
          onSelect={() => onSelect(addr.id)}
        />
      ))}

      <button
        onClick={onAddNew}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-stone-300 px-4 py-3 text-sm text-stone-500 hover:border-amber-400 hover:text-amber-600 transition"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        إضافة عنوان آخر
      </button>
    </div>
  )
}

function AddressCard({
  address,
  selected,
  onSelect,
}: {
  address:  Address
  selected: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      className={`
        w-full rounded-2xl border-2 p-4 text-start transition
        ${selected
          ? 'border-amber-500 bg-amber-50'
          : 'border-stone-200 bg-white hover:border-stone-300'
        }
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-800">
              {address.full_name}
            </span>
            {address.label && (
              <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                {address.label}
              </span>
            )}
            {address.is_default && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                الافتراضي
              </span>
            )}
          </div>
          <p className="text-sm text-stone-500">
            {[address.city, address.district, address.street, address.building]
              .filter(Boolean)
              .join(' — ')}
          </p>
          <p className="text-xs text-stone-400">{address.phone}</p>
          {address.notes && (
            <p className="text-xs text-stone-400">ملاحظة: {address.notes}</p>
          )}
        </div>

        {/* Radio indicator */}
        <div className={`
          mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition
          ${selected ? 'border-amber-500 bg-amber-500' : 'border-stone-300'}
        `}>
          {selected && (
            <div className="h-2 w-2 rounded-full bg-white" />
          )}
        </div>
      </div>
    </button>
  )
}
