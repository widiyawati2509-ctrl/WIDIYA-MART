// @ts-nocheck
export interface ParsedShippingInfo {
  metode: 'antar_alamat' | 'ambil_di_toko'
  isDelivery: boolean
  alamat: string | null
  jarakKm: number | null
  ongkir: number
  estimasiMenit: number | null
  cleanCatatan: string | null
}

export function parseOrderShippingInfo(order?: {
  metode_pengiriman?: string | null
  alamat_pengiriman?: string | null
  jarak_km?: number | null
  ongkir?: number | null
  estimasi_menit?: number | null
  catatan?: string | null
} | null): ParsedShippingInfo {
  if (!order) {
    return {
      metode: 'ambil_di_toko',
      isDelivery: false,
      alamat: null,
      jarakKm: null,
      ongkir: 0,
      estimasiMenit: null,
      cleanCatatan: null,
    }
  }

  let metode: 'antar_alamat' | 'ambil_di_toko' =
    order.metode_pengiriman === 'antar_alamat' ? 'antar_alamat' : 'ambil_di_toko'
  let alamat = order.alamat_pengiriman?.trim() || null
  let jarakKm = typeof order.jarak_km === 'number' && !isNaN(order.jarak_km) ? order.jarak_km : null
  let ongkir = typeof order.ongkir === 'number' && !isNaN(order.ongkir) ? order.ongkir : 0
  let estimasiMenit = typeof order.estimasi_menit === 'number' && !isNaN(order.estimasi_menit) ? order.estimasi_menit : null
  let rawCatatan = order.catatan?.trim() || null

  if (rawCatatan) {
    if (rawCatatan.includes('[Pengantaran ke:') || rawCatatan.includes('[Metode: Diantar')) {
      metode = 'antar_alamat'
      if (!alamat) {
        const addrMatch = rawCatatan.match(/\[Pengantaran ke:\s*([^|\]]+)/i)
        if (addrMatch && addrMatch[1]?.trim() && addrMatch[1].trim() !== '-') {
          alamat = addrMatch[1].trim()
        }
      }
      if (jarakKm === null) {
        const jarakMatch = rawCatatan.match(/Jarak:\s*([0-9.]+)\s*km/i)
        if (jarakMatch) {
          jarakKm = parseFloat(jarakMatch[1])
        }
      }
      if (ongkir === 0) {
        const ongkirMatch = rawCatatan.match(/Ongkir:\s*Rp\s*([0-9.]+)/i)
        if (ongkirMatch) {
          ongkir = parseInt(ongkirMatch[1].replace(/\./g, ''), 10) || 0
        }
      }
      if (!estimasiMenit) {
        const estMatch = rawCatatan.match(/Estimasi:\s*±?([0-9]+)\s*mnt/i)
        if (estMatch) {
          estimasiMenit = parseInt(estMatch[1], 10)
        }
      }
    } else if (rawCatatan.includes('[Metode: Ambil di Toko]')) {
      metode = 'ambil_di_toko'
    }

    const kuponMatch = rawCatatan.match(/\[Kupon:\s*([^\s\(\]]+)(?:\s*\(Diskon\s*Rp\s*([0-9\.\,]+)\))?\]/i)
    if (kuponMatch) {
      if (!order.kode_kupon) order.kode_kupon = kuponMatch[1]
      if (!order.diskon_kupon && kuponMatch[2]) {
        order.diskon_kupon = parseInt(kuponMatch[2].replace(/\D/g, ''), 10) || 0
      }
    }

    const dusunMatch = rawCatatan.match(/\(Dusun:\s*([^\)]+)\)/i)
    if (dusunMatch && !order.dusun_pengiriman) {
      order.dusun_pengiriman = dusunMatch[1].trim()
    }

    const cleaned = rawCatatan
      .replace(/\[Pengantaran ke:[^\]]*\]/gi, '')
      .replace(/\[Metode:[^\]]*\]/gi, '')
      .replace(/\[Poin Digunakan:[^\]]*\]/gi, '')
      .replace(/\[Kupon:[^\]]*\]/gi, '')
      .replace(/^Catatan:\s*/i, '')
      .replace(/\n\s*Catatan:\s*/gi, '\n')
      .trim()

    rawCatatan = cleaned || null
  }

  return {
    metode,
    isDelivery: metode === 'antar_alamat',
    alamat,
    jarakKm,
    ongkir,
    estimasiMenit,
    cleanCatatan: rawCatatan,
  }
}

export interface DusunShippingOption {
  id: string
  nama: string
  kategori: 'desa_pengenjek' | 'sekitar_pengenjek' | 'luar_area'
  ongkir: number
  gratisOngkirMin: number
  estimasiMenit: number
  keterangan: string
}

export const DUSUN_PENGENJEK_LIST: DusunShippingOption[] = [
  {
    id: 'baremayung',
    nama: 'Dusun Baremayung (Pengenjek)',
    kategori: 'desa_pengenjek',
    ongkir: 3000,
    gratisOngkirMin: 25000,
    estimasiMenit: 15,
    keterangan: 'Gratis ongkir min. belanja Rp 25.000',
  },
  {
    id: 'pengenjek_daye',
    nama: 'Dusun Pengenjek Daye',
    kategori: 'desa_pengenjek',
    ongkir: 3000,
    gratisOngkirMin: 25000,
    estimasiMenit: 15,
    keterangan: 'Gratis ongkir min. belanja Rp 25.000',
  },
  {
    id: 'pengenjek_lauk',
    nama: 'Dusun Pengenjek Lauk',
    kategori: 'desa_pengenjek',
    ongkir: 3000,
    gratisOngkirMin: 25000,
    estimasiMenit: 15,
    keterangan: 'Gratis ongkir min. belanja Rp 25.000',
  },
  {
    id: 'karang_anyar',
    nama: 'Dusun Karang Anyar (Pengenjek)',
    kategori: 'desa_pengenjek',
    ongkir: 3000,
    gratisOngkirMin: 25000,
    estimasiMenit: 20,
    keterangan: 'Gratis ongkir min. belanja Rp 25.000',
  },
  {
    id: 'dasan_kebon',
    nama: 'Dusun Dasan Kebon (Pengenjek)',
    kategori: 'desa_pengenjek',
    ongkir: 3000,
    gratisOngkirMin: 25000,
    estimasiMenit: 20,
    keterangan: 'Gratis ongkir min. belanja Rp 25.000',
  },
  {
    id: 'sukarara',
    nama: 'Sekitar: Sukarara / Ubung (≤ 7 km)',
    kategori: 'sekitar_pengenjek',
    ongkir: 7000,
    gratisOngkirMin: 50000,
    estimasiMenit: 30,
    keterangan: 'Gratis ongkir min. belanja Rp 50.000',
  },
  {
    id: 'puyung_bonjeruk',
    nama: 'Sekitar: Puyung / Bonjeruk (≤ 7 km)',
    kategori: 'sekitar_pengenjek',
    ongkir: 7000,
    gratisOngkirMin: 50000,
    estimasiMenit: 35,
    keterangan: 'Gratis ongkir min. belanja Rp 50.000',
  },
  {
    id: 'luar_pengenjek',
    nama: 'Luar Wilayah (> 7 km)',
    kategori: 'luar_area',
    ongkir: 15000,
    gratisOngkirMin: 100000,
    estimasiMenit: 45,
    keterangan: 'Gratis ongkir min. belanja Rp 100.000',
  },
]

export function calculateDusunShipping(
  dusunId: string,
  subtotal: number
): {
  dusun: DusunShippingOption | null
  ongkir: number
  isFree: boolean
  minBelanja: number
  sisaUntukGratis: number
  estimasiMenit: number
} {
  const dusun = DUSUN_PENGENJEK_LIST.find((d) => d.id === dusunId) || null

  if (!dusun) {
    const isFree = subtotal >= 50000
    const sisa = Math.max(0, 50000 - subtotal)
    return {
      dusun: null,
      ongkir: isFree ? 0 : 7000,
      isFree,
      minBelanja: 50000,
      sisaUntukGratis: sisa,
      estimasiMenit: 30,
    }
  }

  const isFree = subtotal >= dusun.gratisOngkirMin
  const sisa = Math.max(0, dusun.gratisOngkirMin - subtotal)

  return {
    dusun,
    ongkir: isFree ? 0 : dusun.ongkir,
    isFree,
    minBelanja: dusun.gratisOngkirMin,
    sisaUntukGratis: sisa,
    estimasiMenit: dusun.estimasiMenit,
  }
}
