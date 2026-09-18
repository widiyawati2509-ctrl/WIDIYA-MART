'use client'

import { useState, useRef } from 'react'
import { AlertCircle, Image as ImageIcon } from 'lucide-react'

interface FileInputWithValidationProps {
  name: string
  accept?: string
  className?: string
  maxSizeMB?: number
  required?: boolean
  onChange?: (file: File | null) => void
}

export default function FileInputWithValidation({
  name,
  accept = 'image/*',
  className,
  maxSizeMB = 5,
  required = false,
  onChange,
}: FileInputWithValidationProps) {
  const [error, setError] = useState<string | null>(null)
  const [fileInfo, setFileInfo] = useState<{ name: string; sizeKb: number } | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setFileInfo(null)
      setError(null)
      onChange?.(null)
      return
    }

    const maxBytes = maxSizeMB * 1024 * 1024
    if (file.size > maxBytes) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1)
      setError(`Ukuran file (${sizeMb} MB) melebihi batas maksimal ${maxSizeMB}MB. Silakan pilih foto lain.`)
      if (inputRef.current) inputRef.current.value = ''
      setFileInfo(null)
      onChange?.(null)
      return
    }

    setError(null)
    setFileInfo({
      name: file.name,
      sizeKb: Math.round(file.size / 1024),
    })
    onChange?.(file)
  }

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        required={required}
        onChange={handleChange}
        className={className || "w-full text-sm text-[var(--ink-soft)] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[var(--accent-bg)] file:text-[var(--accent-2)] hover:file:bg-[var(--accent-bg)]/80"}
      />
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {fileInfo && !error && (
        <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
          <ImageIcon className="w-3 h-3 shrink-0" />
          <span>File siap ({fileInfo.sizeKb} KB — otomatis di-resize maks 1200px &amp; dikompres &lt; 500KB)</span>
        </div>
      )}
    </div>
  )
}
