// @ts-nocheck
import { createPublicClient } from '@/lib/supabase/server'
import PageHeader from '@/components/PageHeader'
import StoreStatusBadge from '@/components/StoreStatusBadge'
import { formatWhatsAppUrl } from '@/lib/utils'
import { 
  Store, 
  MapPin, 
  Clock, 
  Phone, 
  MessageCircle, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle,
  PackageCheck,
  Truck
} from 'lucide-react'
import Image from 'next/image'

export const revalidate = 60

export default async function TentangTokoPage() {
  const supabase = createPublicClient()
  const { data: store } = await supabase
    .from('store_info')
    .select('*')
    .single()

  const namaToko = store?.nama_toko || 'PENGENJEK MART'
  const alamat = store?.alamat_toko || 'Desa Pengenjek, Kec. Jonggat'
  const kota = store?.kota || 'Lombok Tengah, NTB'
  const jamOperasional = store?.jam_operasional || 'Setiap Hari, 07:00 – 21:00'
  const jamBuka = store?.jam_buka || '07:00'
  const jamTutup = store?.jam_tutup || '21:00'
  const whatsapp = store?.whatsapp || store?.no_hp_toko || '6281234567890'
  const noHp = store?.no_hp_toko || store?.whatsapp || ''
  const mapsUrl = store?.maps_url || 'https://maps.google.com/?q=Pengenjek+Lombok+Tengah'

  return (
    <div className="w-full pb-28">
      {/* Header */}
      <PageHeader
        title="Tentang Toko"
        subtitle="Informasi resmi, jam operasional & kontak"
        showBack={true}
        backHref="/"
        className="mb-4"
      />

      <div className="px-4 space-y-4">
        {/* Toko Identity Card */}
        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-[var(--radius-xl)] p-5 shadow-3d text-center space-y-3">
          <div className="w-20 h-20 mx-auto rounded-2xl p-2 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-200/80 shadow-md flex items-center justify-center overflow-hidden">
            <Image
              src="/logo.png"
              alt={`${namaToko} Logo`}
              width={64}
              height={64}
              className="rounded-xl object-cover"
              priority
            />
          </div>

          <div>
            <h1 className="font-sora font-extrabold text-xl text-[var(--ink)] leading-tight">
              {namaToko}
            </h1>
            <p className="text-xs text-[var(--ink-soft)] font-medium mt-1">
              Pusat belanja kebutuhan pokok, sembako & jajan segar dengan sistem COD terpercaya.
            </p>
          </div>

          {/* Live Status Badge */}
          <div className="pt-1 flex justify-center">
            <StoreStatusBadge
              jamBuka={jamBuka}
              jamTutup={jamTutup}
              jamOperasional={jamOperasional}
              variant="full"
            />
          </div>
        </div>

        {/* Action Buttons: WhatsApp & Maps */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={formatWhatsAppUrl(whatsapp, `Halo Admin ${namaToko}, saya ingin bertanya seputar toko & produk...`)}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex items-center justify-center gap-2 p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-sora font-bold text-xs shadow-md transition-all active:scale-95 text-center"
          >
            <MessageCircle size={16} />
            <span>Chat WhatsApp</span>
          </a>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="press flex items-center justify-center gap-2 p-3 rounded-2xl bg-white border border-[rgba(232,214,205,0.9)] hover:bg-[var(--paper)] text-[var(--ink)] font-sora font-bold text-xs shadow-xs transition-all active:scale-95 text-center"
          >
            <MapPin size={16} className="text-rose-500" />
            <span>Petunjuk Lokasi</span>
          </a>
        </div>

        {/* Informasi Kontak & Lokasi */}
        <div className="card-3d bg-white border border-[rgba(232,214,205,0.9)] rounded-2xl p-4 shadow-3d space-y-3.5">
          <h2 className="font-sora font-bold text-sm text-[var(--ink)] flex items-center gap-2">
            <Store size={16} className="text-[var(--accent)]" />
            Detail Kontak & Lokasi
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--ink)]">Alamat Toko</p>
                <p className="text-[var(--ink-soft)] font-medium leading-relaxed">
                  {alamat}{kota ? `, ${kota}` : ''}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock size={16} className="shrink-0 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-bold text-[var(--ink)]">Jam Operasional</p>
                <p className="text-[var(--ink-soft)] font-medium leading-relaxed">
                  {jamOperasional}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Waktu Buka: {jamBuka} – {jamTutup} WITA
                </p>
              </div>
            </div>

            {noHp && (
              <div className="flex items-start gap-3">
                <Phone size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-[var(--ink)]">Nomor Telepon / HP</p>
                  <a href={`tel:${noHp}`} className="text-emerald-700 font-semibold hover:underline">
                    {noHp}
                  </a>
                </div>
              </div>
            )}

            {whatsapp && (
              <div className="flex items-start gap-3">
                <MessageCircle size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <p className="font-bold text-[var(--ink)]">WhatsApp Admin</p>
                  <a 
                    href={formatWhatsAppUrl(whatsapp, `Halo Admin ${namaToko}...`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>+{whatsapp.startsWith('62') ? whatsapp : '62' + whatsapp.replace(/^0/, '')}</span>
                    <ExternalLink size={11} />
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Kebijakan Pengambilan Pesanan COD (Feature Unclaimed Order) */}
        <div className="card-3d bg-amber-50/80 border border-amber-200/90 rounded-2xl p-4 shadow-3d space-y-2.5">
          <div className="flex items-center gap-2 text-amber-900">
            <PackageCheck size={18} className="text-amber-700 shrink-0" />
            <h2 className="font-sora font-bold text-xs">
              Aturan Pengambilan Pesanan (COD)
            </h2>
          </div>

          <div className="space-y-2 text-xs text-amber-900/90 leading-relaxed font-medium">
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">1.</span>
              <p>
                Setelah pesanan diproses dan berstatus <strong>&ldquo;Siap Diambil&rdquo;</strong>, pembeli memiliki batas waktu pengambilan maksimal <strong>2x24 jam (48 jam)</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">2.</span>
              <p>
                Jika pesanan tidak diambil hingga batas waktu berakhir, sistem secara otomatis menandai status pesanan menjadi <strong>&ldquo;Tidak Diambil&rdquo;</strong>.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">3.</span>
              <p>
                Stok barang dari pesanan yang tidak diambil akan <strong>segera dikembalikan ke etalase</strong> agar dapat dibeli oleh pelanggan lain.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-amber-700 shrink-0">4.</span>
              <p>
                Jika ada kendala pengambilan, mohon segera hubungi WhatsApp toko sebelum batas waktu terlampaui agar pesanan tetap dapat disimpan.
              </p>
            </div>
          </div>
        </div>

        {/* Info Pengantaran Alamat */}
        <div className="card-3d bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-4 shadow-3d space-y-2">
          <div className="flex items-center gap-2 text-emerald-950">
            <Truck size={17} className="text-emerald-700 shrink-0" />
            <h2 className="font-sora font-bold text-xs">
              Layanan Antar ke Alamat (COD)
            </h2>
          </div>
          <p className="text-xs text-emerald-900/90 leading-relaxed font-medium">
            Kami melayani pengantaran belanjaan langsung ke rumah untuk wilayah sekitar Pengenjek. 
            <strong> Gratis ongkir</strong> untuk radius hingga 7 km, atau ongkir flat Rp 15.000 untuk jarak lebih jauh. Pembayaran dilakukan secara tunai (COD) saat barang tiba.
          </p>
        </div>
      </div>
    </div>
  )
}
