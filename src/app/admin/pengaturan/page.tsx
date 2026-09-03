// @ts-nocheck
import { createClient } from '@/lib/supabase/server'
import { updateStoreInfo } from '@/lib/actions/admin'

export default async function AdminPengaturanPage() {
  const supabase = await createClient()
  const { data: store } = await supabase.from('store_info').select('*').single()

  return (
    <div>
      <h1 className="text-xl font-bold mb-4">Pengaturan Toko</h1>

      <div className="bg-white border rounded-2xl p-4">
        <form action={updateStoreInfo} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Nama Toko *</label>
            <input
              type="text"
              name="nama_toko"
              defaultValue={store?.nama_toko}
              required
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Alamat Toko *</label>
            <textarea
              name="alamat_toko"
              defaultValue={store?.alamat_toko}
              required
              rows={2}
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Kota *</label>
              <input
                type="text"
                name="kota"
                defaultValue={store?.kota}
                required
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Jam Operasional *</label>
              <input
                type="text"
                name="jam_operasional"
                defaultValue={store?.jam_operasional}
                required
                placeholder="mis. Senin–Minggu, 07.00–21.00"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                No. HP Toko <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="tel"
                name="no_hp_toko"
                defaultValue={store?.no_hp_toko ?? ''}
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                WhatsApp <span className="text-gray-400 font-normal">(opsional)</span>
              </label>
              <input
                type="text"
                name="whatsapp"
                defaultValue={store?.whatsapp ?? ''}
                placeholder="6281234567890"
                className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Link Google Maps <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              type="url"
              name="maps_url"
              defaultValue={store?.maps_url ?? ''}
              placeholder="https://maps.app.goo.gl/..."
              className="w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            Simpan Pengaturan
          </button>
        </form>
      </div>
    </div>
  )
}
