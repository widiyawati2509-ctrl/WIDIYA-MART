// @ts-nocheck
/**
 * WIDIYA MART - Core Utilities (Modular Barrel)
 * Setiap domain telah dipisahkan ke modul spesifik di bawah `src/lib/utils/`.
 * File ini mengekspor kembali seluruh utilitas agar kompatibilitas kode terjamin 100%.
 */

// 1. Formatting & Assets
export {
  formatRupiah,
  slugify,
  getSupabaseImageUrl,
} from './utils/formatting'

// 2. Status & Badge Warna
export {
  getOrderStatusLabel,
  getOrderStatusColor,
} from './utils/orderStatus'

// 3. Jam Operasional Toko & WITA Time
export {
  ORDER_PICKUP_EXPIRATION_HOURS,
  formatBatasWaktu,
  getPickupCountdown,
  getWitaTime,
  getWitaStartOfDay,
  getWitaDateString,
  parseTimeString,
  isStoreOpen,
} from './utils/storeHours'

// 4. Logika Pengiriman Dusun & Ongkir
export {
  parseOrderShippingInfo,
  DUSUN_PENGENJEK_LIST,
  calculateDusunShipping,
  type ParsedShippingInfo,
  type DusunShippingOption,
} from './utils/shipping'

// 5. Integrasi WhatsApp
export {
  formatWhatsAppUrl,
  buildOrderWhatsAppMessage,
} from './utils/whatsapp'

// 6. Varian Produk
export {
  parseProductVariants,
  serializeProductVariants,
  type ProductVariant,
} from './utils/variants'
