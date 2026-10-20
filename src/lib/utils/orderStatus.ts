// @ts-nocheck
export function getOrderStatusLabel(status: string, metodePengiriman?: string | null): string {
  if (status === 'siap_diambil') {
    return metodePengiriman === 'antar_alamat' ? 'Pesanan Proses Pengantaran' : 'Siap Diambil'
  }
  const labels: Record<string, string> = {
    menunggu_diproses: 'Menunggu Diproses',
    diproses: 'Sedang Diproses',
    siap_diambil: 'Siap Diambil',
    selesai: 'Selesai',
    dibatalkan: 'Dibatalkan',
    tidak_diambil: 'Tidak Diambil',
  }
  return labels[status] ?? status
}

export function getOrderStatusColor(status: string, metodePengiriman?: string | null): string {
  if (status === 'siap_diambil' && metodePengiriman === 'antar_alamat') {
    return 'bg-blue-100 text-blue-800'
  }
  const colors: Record<string, string> = {
    menunggu_diproses: 'bg-yellow-100 text-yellow-800',
    diproses: 'bg-blue-100 text-blue-800',
    siap_diambil: 'bg-green-100 text-green-800',
    selesai: 'bg-gray-100 text-gray-800',
    dibatalkan: 'bg-red-100 text-red-800',
    tidak_diambil: 'bg-rose-100 text-rose-800 border-rose-200',
  }
  return colors[status] ?? 'bg-gray-100 text-gray-800'
}
