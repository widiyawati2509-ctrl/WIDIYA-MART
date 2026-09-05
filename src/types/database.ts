export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          nama: string
          no_hp: string | null
          role: 'customer' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          nama?: string
          no_hp?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          no_hp?: string | null
          role?: 'customer' | 'admin'
          created_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          nama: string
          slug: string
          icon_url: string | null
          urutan: number
          created_at: string
        }
        Insert: {
          id?: string
          nama: string
          slug: string
          icon_url?: string | null
          urutan?: number
          created_at?: string
        }
        Update: {
          id?: string
          nama?: string
          slug?: string
          icon_url?: string | null
          urutan?: number
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          nama: string
          slug: string
          deskripsi: string | null
          harga: number
          stok: number
          category_id: string | null
          image_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nama: string
          slug: string
          deskripsi?: string | null
          harga: number
          stok?: number
          category_id?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nama?: string
          slug?: string
          deskripsi?: string | null
          harga?: number
          stok?: number
          category_id?: string | null
          image_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          alamat_lengkap: string
          kota: string
          kode_pos: string | null
          is_default: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label?: string
          alamat_lengkap: string
          kota: string
          kode_pos?: string | null
          is_default?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          alamat_lengkap?: string
          kota?: string
          kode_pos?: string | null
          is_default?: boolean
          created_at?: string
        }
      }
      carts: {
        Row: {
          id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
        }
      }
      cart_items: {
        Row: {
          id: string
          cart_id: string
          product_id: string
          qty: number
          created_at: string
        }
        Insert: {
          id?: string
          cart_id: string
          product_id: string
          qty?: number
          created_at?: string
        }
        Update: {
          id?: string
          cart_id?: string
          product_id?: string
          qty?: number
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          user_id: string
          status: 'menunggu_diproses' | 'diproses' | 'siap_diambil' | 'selesai' | 'dibatalkan'
          subtotal: number
          total: number
          catatan: string | null
          nama_pemesan: string
          no_hp_pemesan: string
          jarak_km?: number | null
          ongkir?: number | null
          alamat_pengiriman?: string | null
          metode_pengiriman?: string | null
          poin_digunakan?: number | null
          diskon_poin?: number | null
          poin_didapat?: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: 'menunggu_diproses' | 'diproses' | 'siap_diambil' | 'selesai' | 'dibatalkan'
          subtotal: number
          total: number
          catatan?: string | null
          nama_pemesan: string
          no_hp_pemesan: string
          jarak_km?: number | null
          ongkir?: number | null
          alamat_pengiriman?: string | null
          metode_pengiriman?: string | null
          poin_digunakan?: number | null
          diskon_poin?: number | null
          poin_didapat?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: 'menunggu_diproses' | 'diproses' | 'siap_diambil' | 'selesai' | 'dibatalkan'
          subtotal?: number
          total?: number
          catatan?: string | null
          nama_pemesan?: string
          no_hp_pemesan?: string
          jarak_km?: number | null
          ongkir?: number | null
          alamat_pengiriman?: string | null
          metode_pengiriman?: string | null
          poin_digunakan?: number | null
          diskon_poin?: number | null
          poin_didapat?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          nama_produk: string
          harga_saat_beli: number
          qty: number
          subtotal: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          nama_produk: string
          harga_saat_beli: number
          qty: number
          subtotal: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          nama_produk?: string
          harga_saat_beli?: number
          qty?: number
          subtotal?: number
        }
      }
      store_info: {
        Row: {
          id: number
          nama_toko: string
          alamat_toko: string
          kota: string
          jam_operasional: string
          no_hp_toko: string | null
          whatsapp: string | null
          maps_url: string | null
          logo_url: string | null
          updated_at: string
        }
        Insert: {
          id?: number
          nama_toko?: string
          alamat_toko?: string
          kota?: string
          jam_operasional?: string
          no_hp_toko?: string | null
          whatsapp?: string | null
          maps_url?: string | null
          logo_url?: string | null
          updated_at?: string
        }
        Update: {
          id?: number
          nama_toko?: string
          alamat_toko?: string
          kota?: string
          jam_operasional?: string
          no_hp_toko?: string | null
          whatsapp?: string | null
          maps_url?: string | null
          logo_url?: string | null
          updated_at?: string
        }
      }
      product_reviews: {
        Row: {
          id: string
          user_id: string
          product_id: string
          order_id: string | null
          rating: number
          ulasan: string | null
          nama_reviewer: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          order_id?: string | null
          rating: number
          ulasan?: string | null
          nama_reviewer: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          order_id?: string | null
          rating?: number
          ulasan?: string | null
          nama_reviewer?: string
          created_at?: string
        }
      }
      user_addresses: {
        Row: {
          id: string
          user_id: string
          label: string
          alamat_lengkap: string
          lat: number | null
          long: number | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          label: string
          alamat_lengkap: string
          lat?: number | null
          long?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          label?: string
          alamat_lengkap?: string
          lat?: number | null
          long?: number | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Enums: {
      order_status: 'menunggu_diproses' | 'diproses' | 'siap_diambil' | 'selesai' | 'dibatalkan'
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Address = Database['public']['Tables']['addresses']['Row']
export type UserAddress = Database['public']['Tables']['user_addresses']['Row']
export type Cart = Database['public']['Tables']['carts']['Row']
export type CartItem = Database['public']['Tables']['cart_items']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type StoreInfo = Database['public']['Tables']['store_info']['Row']
export type OrderStatus = Database['public']['Enums']['order_status']

export type CartItemWithProduct = CartItem & {
  products: Product | null
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { products: Product | null })[]
}

export type ProductWithCategory = Product & {
  categories: Category | null
}

export type ProductReview = Database['public']['Tables']['product_reviews']['Row']
