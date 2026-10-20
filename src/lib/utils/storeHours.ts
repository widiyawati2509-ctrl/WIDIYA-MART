// @ts-nocheck
export const ORDER_PICKUP_EXPIRATION_HOURS = 48

export function formatBatasWaktu(dateStr?: string | null): string {
  if (!dateStr) return '-'
  try {
    const d = new Date(dateStr)
    return d.toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}

export function getPickupCountdown(dateStr?: string | null): {
  isExpired: boolean
  remainingMs: number
  text: string
  formattedDate: string
} {
  if (!dateStr) {
    return { isExpired: false, remainingMs: 0, text: '-', formattedDate: '-' }
  }
  const deadline = new Date(dateStr).getTime()
  const now = Date.now()
  const diff = deadline - now
  const formattedDate = formatBatasWaktu(dateStr)

  if (diff <= 0) {
    return {
      isExpired: true,
      remainingMs: diff,
      text: 'Batas waktu telah lewat',
      formattedDate,
    }
  }

  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

  if (hours >= 24) {
    const days = Math.floor(hours / 24)
    const remHours = hours % 24
    return {
      isExpired: false,
      remainingMs: diff,
      text: `Sisa ${days} hari ${remHours} jam`,
      formattedDate,
    }
  }

  if (hours > 0) {
    return {
      isExpired: false,
      remainingMs: diff,
      text: `Sisa ${hours} jam ${minutes} menit`,
      formattedDate,
    }
  }

  return {
    isExpired: false,
    remainingMs: diff,
    text: `Sisa ${minutes} menit`,
    formattedDate,
  }
}

/**
 * Ambil waktu saat ini dalam zona waktu WITA (Waktu Indonesia Tengah / Asia/Makassar / UTC+8).
 */
export function getWitaTime(date: Date = new Date()): {
  hours: number
  minutes: number
  timeString: string
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    })
    const parts = formatter.formatToParts(date)
    const h = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10)
    const m = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10)
    return {
      hours: h,
      minutes: m,
      timeString: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    }
  } catch {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000
    const witaMs = utcMs + 8 * 60 * 60 * 1000
    const witaDate = new Date(witaMs)
    const h = witaDate.getHours()
    const m = witaDate.getMinutes()
    return {
      hours: h,
      minutes: m,
      timeString: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    }
  }
}

export function getWitaStartOfDay(date: Date = new Date()): Date {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    const ymd = formatter.format(date)
    return new Date(`${ymd}T00:00:00+08:00`)
  } catch {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }
}

export function getWitaDateString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Makassar',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  } catch {
    const utcMs = date.getTime() + date.getTimezoneOffset() * 60 * 1000
    const witaDate = new Date(utcMs + 8 * 60 * 60 * 1000)
    return witaDate.toISOString().split('T')[0]
  }
}

export function parseTimeString(
  val: string | null | undefined,
  fallbackH: number,
  fallbackM: number
): { hours: number; minutes: number; formatted: string } {
  if (!val) {
    return {
      hours: fallbackH,
      minutes: fallbackM,
      formatted: `${String(fallbackH).padStart(2, '0')}:${String(fallbackM).padStart(2, '0')}`,
    }
  }
  const match = val.match(/(\d{1,2})[:.](\d{2})/)
  if (match) {
    const h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    return {
      hours: h,
      minutes: m,
      formatted: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
    }
  }
  return {
    hours: fallbackH,
    minutes: fallbackM,
    formatted: `${String(fallbackH).padStart(2, '0')}:${String(fallbackM).padStart(2, '0')}`,
  }
}

export function isStoreOpen(
  jamBuka?: string | null,
  jamTutup?: string | null,
  jamOperasionalFallback?: string | null
): {
  isOpen: boolean
  statusText: string
  timeRange: string
  currentWitaTime: string
  jamBukaFormatted: string
  jamTutupFormatted: string
} {
  try {
    let bukaStr = jamBuka?.trim() || null
    let tutupStr = jamTutup?.trim() || null

    if ((!bukaStr || !tutupStr) && jamOperasionalFallback) {
      const matches = [...jamOperasionalFallback.matchAll(/(\d{1,2})[:.](\d{2})/g)]
      if (matches.length >= 2) {
        if (!bukaStr) bukaStr = matches[0][0]
        if (!tutupStr) tutupStr = matches[1][0]
      }
    }

    const buka = parseTimeString(bukaStr, 7, 0)
    const tutup = parseTimeString(tutupStr, 21, 0)
    const timeRange = `${buka.formatted} – ${tutup.formatted} WITA`

    const now = getWitaTime()
    const currentMinutes = now.hours * 60 + now.minutes
    const startMinutes = buka.hours * 60 + buka.minutes
    const endMinutes = tutup.hours * 60 + tutup.minutes

    let isOpen = false
    if (endMinutes >= startMinutes) {
      isOpen = currentMinutes >= startMinutes && currentMinutes < endMinutes
    } else {
      isOpen = currentMinutes >= startMinutes || currentMinutes < endMinutes
    }

    return {
      isOpen,
      statusText: isOpen ? 'Toko Buka' : 'Toko Tutup',
      timeRange,
      currentWitaTime: now.timeString,
      jamBukaFormatted: buka.formatted,
      jamTutupFormatted: tutup.formatted,
    }
  } catch {
    return {
      isOpen: true,
      statusText: 'Toko Buka',
      timeRange: '07:00 – 21:00 WITA',
      currentWitaTime: '12:00',
      jamBukaFormatted: '07:00',
      jamTutupFormatted: '21:00',
    }
  }
}
