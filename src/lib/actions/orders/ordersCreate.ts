// @ts-nocheck
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { checkoutSchema } from '@/lib/validations'

import { getLoyaltyConfig, getUserLoyaltySummary } from '@/lib/actions/loyalty'
import { addToCart } from '@/lib/actions/cart'
import { validateCoupon } from '@/lib/actions/coupons'
import { calculateDusunShipping } from '@/lib/utils'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseClient = any

// Fixed store coordinates: PENGENJEK MART (Pengenjek, Jonggat, Lombok Tengah)
const STORE_COORDS = {
  lat: -8.636636,
  lng: 116.244461,
}
const FREE_SHIPPING_MAX_KM = 7.0
const FLAT_SHIPPING_FEE = 15000
// Batas waktu pengambilan COD (default 2x24 jam = 48 jam)
const ORDER_PICKUP_EXPIRATION_HOURS = 48

function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c * 10) / 10
}

export async function createOrder(formData: FormData): Promise<{ error?: string; success?: boolean; orderId?: string }> {
  try {
    const supabase: SupabaseClient = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: 'Silakan login terlebih dahulu' }

    const raw = {
      nama_pemesan: (formData.get('nama_pemesan') as string)?.trim() || '',
      no_hp_pemesan: (formData.get('no_hp_pemesan') as string)?.replace(/[\s\-\.]/g, '')?.trim() || '',
      catatan: (formData.get('catatan') as string)?.trim() || '',
    }

    const parsed = checkoutSchema.safeParse(raw)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message || 'Data pemesan tidak lengkap / nomor HP tidak valid' }
    }

    // Get cart items
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (!cart) return { error: 'Keranjang belanja kosong' }

    const { data: items } = await supabase
      .from('cart_items')
      .select('qty, products(id, nama, harga, stok)')
      .eq('cart_id', cart.id)

    if (!items || items.length === 0) return { error: 'Keranjang belanja kosong' }

    // Validate stock
    for (const item of items) {
      const product = item.products as { id: string; nama: string; harga: number; stok: number } | null
      if (!product) return { error: 'Produk tidak ditemukan' }
      if (product.stok < item.qty) {
        return { error: `Stok ${product.nama} tidak cukup (tersisa ${product.stok})` }
      }
    }

    const subtotal = items.reduce((sum: number, item: { qty: number; products: unknown }) => {
      const product = item.products as { harga: number } | null
      return sum + (product?.harga ?? 0) * item.qty
    }, 0)

    // Rate limit check: Prevent double-click spam / rapid submissions within 15 seconds
    const { data: recentOrder } = await supabase
      .from('orders')
      .select('created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (recentOrder?.created_at) {
      const elapsedMs = Date.now() - new Date(recentOrder.created_at).getTime()
      if (elapsedMs < 15000) {
        const remainingSec = Math.ceil((15000 - elapsedMs) / 1000)
        return {
          error: `Pesanan Anda baru saja dibuat. Harap tunggu ${remainingSec} detik sebelum membuat pesanan baru untuk mencegah duplikasi.`,
        }
      }
    }

    // Loyalty points deduction handling
    const poinToRedeem = Math.max(0, parseInt(formData.get('poin_digunakan') as string) || 0)
    let diskonPoin = 0

    if (poinToRedeem > 0) {
      try {
        const config = await getLoyaltyConfig()
        if (config?.is_active) {
          const summary = await getUserLoyaltySummary(user.id)
          const userMaxPoints = summary?.totalPoints ?? 0
          const validPoints = Math.min(poinToRedeem, userMaxPoints)

          if (validPoints > 0) {
            const maxDiscount = Math.floor(subtotal * (config.max_redeem_percentage / 100))
            diskonPoin = Math.min(validPoints * config.redeem_rate, maxDiscount)
          }
        }
      } catch (e) {
        console.warn('Loyalty points calculation error:', e)
      }
    }

    // Coupon / Voucher validation & discount calculation
    const inputKodeKupon = (formData.get('kode_kupon') as string)?.trim().toUpperCase() || null
    let validKodeKupon: string | null = null
    let diskonKupon = 0

    if (inputKodeKupon) {
      const couponCheck = await validateCoupon(inputKodeKupon, subtotal)
      if (!couponCheck.valid) {
        return { error: couponCheck.error || 'Kode voucher tidak valid atau tidak memenuhi syarat' }
      }
      validKodeKupon = couponCheck.coupon?.kode || inputKodeKupon
      diskonKupon = couponCheck.discountAmount || 0
    }

    // Shipping & Delivery: Recalculate on server (NEVER trust client-submitted ongkir)
    const metodePengiriman = (formData.get('metode_pengiriman') as string) || 'ambil_di_toko'
    const alamatPengiriman = (formData.get('alamat_pengiriman') as string)?.trim() || null
    const dusunId = (formData.get('dusun_id') as string)?.trim() || null
    const dusunNama = (formData.get('dusun_pengiriman') as string)?.trim() || null
    const userLatRaw = formData.get('user_lat') as string
    const userLngRaw = formData.get('user_lng') as string

    let verifiedJarakKm: number | null = null
    let serverOngkir = 0
    let serverEstimasiMenit: number | null = null

    if (metodePengiriman === 'antar_alamat') {
      if (!alamatPengiriman) {
        return { error: 'Alamat pengiriman wajib diisi untuk opsi antar ke alamat' }
      }

      if (dusunId) {
        // Priority: Use local Dusun tariff with free shipping rule
        const dusunTariff = calculateDusunShipping(dusunId, subtotal)
        serverOngkir = dusunTariff.ongkir
        serverEstimasiMenit = dusunTariff.estimasiMenit
      } else {
        if (userLatRaw && userLngRaw) {
          const userLat = parseFloat(userLatRaw)
          const userLng = parseFloat(userLngRaw)
          if (!isNaN(userLat) && !isNaN(userLng)) {
            verifiedJarakKm = calculateHaversineDistance(
              STORE_COORDS.lat,
              STORE_COORDS.lng,
              userLat,
              userLng
            )
          }
        }

        // If coordinates verified distance is within free radius (<= 7 km), ongkir is 0, else flat fee Rp 15.000
        if (verifiedJarakKm !== null && verifiedJarakKm <= FREE_SHIPPING_MAX_KM) {
          serverOngkir = 0
        } else {
          serverOngkir = FLAT_SHIPPING_FEE
        }

        // Query store parameters for delivery estimation
        const { data: storeInfo } = await supabase
          .from('store_info')
          .select('estimasi_menit_per_km, estimasi_menit_tambahan')
          .single()

        const menitPerKm = Number(storeInfo?.estimasi_menit_per_km ?? 5)
        const menitTambahan = Number(storeInfo?.estimasi_menit_tambahan ?? 15)
        const clientJarak = formData.get('jarak_km') ? parseFloat(formData.get('jarak_km') as string) : null
        const effectiveDistance = verifiedJarakKm ?? (clientJarak && !isNaN(clientJarak) ? clientJarak : 3)
        serverEstimasiMenit = Math.round(menitTambahan + (effectiveDistance * menitPerKm))
      }
    } else {
      // 'ambil_di_toko' - per aturan: tidak perlu estimasi waktu antar
      serverOngkir = 0
      verifiedJarakKm = 0
      serverEstimasiMenit = null
    }

    const finalTotal = Math.max(0, subtotal - diskonPoin - diskonKupon + serverOngkir)

    // Decrement stock atomically before creating order to prevent race conditions and overselling
    const decrementedItems: { id: string; qty: number; nama: string }[] = []
    let stockError: string | null = null

    for (const item of items) {
      const product = item.products as { id: string; nama: string; harga: number; stok: number } | null
      if (!product) continue

      // Attempt atomic decrement via RPC
      const { data: success, error: rpcError } = await supabase.rpc('decrement_stock', {
        p_product_id: product.id,
        p_qty: item.qty,
      })

      if (rpcError) {
        // If RPC is not available in database yet, fallback to conditional atomic query
        const { data: curProd } = await supabase
          .from('products')
          .select('stok')
          .eq('id', product.id)
          .single()

        if (!curProd || curProd.stok < item.qty) {
          stockError = `Stok ${product.nama} tidak mencukupi (tersisa ${curProd?.stok ?? 0})`
          break
        }

        const { error: updateErr } = await supabase
          .from('products')
          .update({ stok: curProd.stok - item.qty })
          .eq('id', product.id)
          .gte('stok', item.qty)

        if (updateErr) {
          stockError = `Gagal memperbarui stok ${product.nama}`
          break
        }
        decrementedItems.push({ id: product.id, qty: item.qty, nama: product.nama })
      } else if (!success) {
        // Atomic decrement returned false because stock < requested qty
        stockError = `Stok ${product.nama} baru saja habis atau tidak mencukupi saat checkout diproses`
        break
      } else {
        decrementedItems.push({ id: product.id, qty: item.qty, nama: product.nama })
      }
    }

    const rollbackStock = async () => {
      for (const dec of decrementedItems) {
        try {
          await supabase.rpc('increment_stock', { p_product_id: dec.id, p_qty: dec.qty })
        } catch {
          const { data: cur } = await supabase.from('products').select('stok').eq('id', dec.id).single()
          if (cur) {
            await supabase.from('products').update({ stok: cur.stok + dec.qty }).eq('id', dec.id)
          }
        }
      }
    }

    if (stockError) {
      await rollbackStock()
      return { error: stockError }
    }

    // Insert order with complete schema (No basic fallback to prevent silent data loss)
    const orderPayload = {
      user_id: user.id,
      subtotal,
      total: finalTotal,
      poin_digunakan: diskonPoin > 0 ? poinToRedeem : 0,
      diskon_poin: diskonPoin,
      kode_kupon: validKodeKupon,
      diskon_kupon: diskonKupon,
      dusun_pengiriman: dusunNama,
      jarak_km: verifiedJarakKm,
      ongkir: serverOngkir,
      alamat_pengiriman: alamatPengiriman,
      metode_pengiriman: metodePengiriman,
      estimasi_menit: serverEstimasiMenit,
      nama_pemesan: parsed.data.nama_pemesan,
      no_hp_pemesan: parsed.data.no_hp_pemesan,
      catatan: parsed.data.catatan || null,
    }

    let order = null
    const { data: orderFull, error: orderFullError } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single()

    if (orderFullError) {
      const isEstimasiMissing = orderFullError.message?.includes('estimasi_menit')
      if (isEstimasiMissing) {
        const { estimasi_menit: _unusedEstimasi, ...payloadWithoutEstimasi } = orderPayload
        const { data: retryOrder, error: retryError } = await supabase
          .from('orders')
          .insert(payloadWithoutEstimasi)
          .select('id')
          .single()
        if (!retryError && retryOrder) {
          order = retryOrder
        }
      }

      if (!order) {
        const isColumnMissing =
          orderFullError.message?.includes('column') ||
          orderFullError.message?.includes('schema cache') ||
          orderFullError.message?.includes('alamat_pengiriman') ||
          orderFullError.message?.includes('kode_kupon') ||
          orderFullError.message?.includes('dusun_pengiriman') ||
          orderFullError.code === 'PGRST204'

        if (isColumnMissing) {
          console.warn('Orders table missing columns, saving shipping info in catatan:', orderFullError.message)

          // Construct detailed catatan so no address, dusun, coupon, or shipping data is lost
          const shippingNotes = [
            parsed.data.catatan ? `Catatan: ${parsed.data.catatan}` : '',
            metodePengiriman === 'antar_alamat'
              ? `[Pengantaran ke: ${alamatPengiriman || '-'}${dusunNama ? ` (Dusun: ${dusunNama})` : ''} | Ongkir: Rp ${serverOngkir.toLocaleString('id-ID')} | Jarak: ${verifiedJarakKm ?? '-'} km | Estimasi: ±${serverEstimasiMenit ?? '-'} mnt]`
              : '[Metode: Ambil di Toko]',
            diskonPoin > 0 ? `[Poin Digunakan: ${poinToRedeem} (Diskon Rp ${diskonPoin.toLocaleString('id-ID')})]` : '',
            diskonKupon > 0 ? `[Kupon: ${validKodeKupon} (Diskon Rp ${diskonKupon.toLocaleString('id-ID')})]` : '',
          ]
            .filter(Boolean)
            .join('\n')

          const compatiblePayload = {
            user_id: user.id,
            subtotal,
            total: finalTotal,
            nama_pemesan: parsed.data.nama_pemesan,
            no_hp_pemesan: parsed.data.no_hp_pemesan,
            catatan: shippingNotes || null,
          }

          const { data: compatOrder, error: compatError } = await supabase
            .from('orders')
            .insert(compatiblePayload)
            .select('id')
            .single()

          if (compatError || !compatOrder) {
            console.error('Order creation error on compatible payload:', compatError)
            await rollbackStock()
            return { error: `Gagal membuat pesanan: ${compatError?.message || 'Database error'}` }
          }

          order = compatOrder
        } else {
          console.error('Order creation error:', orderFullError)
          await rollbackStock()
          return { error: `Gagal membuat pesanan: ${orderFullError.message || 'Database error'}` }
        }
      }
    } else {
      order = orderFull
    }

    if (!order) {
      await rollbackStock()
      return { error: 'Gagal membuat pesanan (ID tidak didapatkan)' }
    }

    // Increment coupon usage counter if coupon used
    if (validKodeKupon) {
      try {
        const { error: rpcErr } = await supabase.rpc('use_coupon', { p_code: validKodeKupon })
        if (rpcErr) {
          // Fallback to fetch-and-increment if RPC is not yet in database
          const { data: cData } = await supabase
            .from('coupons')
            .select('id, terpakai')
            .ilike('kode', validKodeKupon)
            .maybeSingle()

          if (cData) {
            await supabase
              .from('coupons')
              .update({ terpakai: (cData.terpakai || 0) + 1, updated_at: new Date().toISOString() })
              .eq('id', cData.id)
          }
        }
      } catch (e) {
        console.warn('Coupon usage update note:', e)
      }
    }

    // Record points debit transaction if redeemed
    if (diskonPoin > 0 && poinToRedeem > 0) {
      try {
        await supabase.from('loyalty_transactions').insert({
          user_id: user.id,
          order_id: order.id,
          points: -poinToRedeem,
          type: 'redeemed',
          description: `Diskon Rp ${diskonPoin.toLocaleString('id-ID')} pada pesanan #${order.id.slice(0, 8)}`,
        })
      } catch (e) {
        console.warn('Failed to insert loyalty redemption record:', e)
      }
    }

    // Create order items
    const orderItems = items.map((item: { qty: number; products: unknown }) => {
      const product = item.products as { id: string; nama: string; harga: number } | null
      return {
        order_id: order.id,
        product_id: product?.id ?? null,
        nama_produk: product?.nama ?? '',
        harga_saat_beli: product?.harga ?? 0,
        qty: item.qty,
        subtotal: (product?.harga ?? 0) * item.qty,
      }
    })

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)
    if (itemsError) {
      console.error('Failed to insert order items:', itemsError)
      await supabase.from('orders').delete().eq('id', order.id)
      await rollbackStock()
      return { error: `Gagal menyimpan rincian pesanan: ${itemsError.message}` }
    }

    // Clear cart
    await supabase.from('cart_items').delete().eq('cart_id', cart.id)

    revalidatePath('/admin')
    revalidatePath('/admin/pesanan')
    revalidatePath('/admin/poin')
    revalidatePath('/pesanan')
    revalidatePath('/poin')
    revalidatePath('/profil')
    revalidatePath('/checkout')
    revalidatePath('/keranjang')

    return { success: true, orderId: order.id }
  } catch (err: any) {
    console.error('createOrder unexpected error:', err)
    return { error: err?.message || 'Terjadi kesalahan sistem saat membuat pesanan' }
  }
}

/**
 * Kembalikan stok item pesanan secara atomik via RPC increment_stock.
 */
