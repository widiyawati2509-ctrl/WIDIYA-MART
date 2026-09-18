import sharp from 'sharp'

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 // 5MB
export const TARGET_MAX_SIZE_BYTES = 500 * 1024 // 500KB
export const MAX_IMAGE_WIDTH = 1200

export interface ProcessedImage {
  buffer: Buffer
  ext: string
  contentType: string
}

/**
 * Validates original image size (<= 5MB) and type.
 * Resizes to max width 1200px maintaining aspect ratio.
 * Compresses to WebP with target size < 500KB.
 */
export async function processProductImage(file: File): Promise<ProcessedImage> {
  if (!file || file.size === 0) {
    throw new Error('File gambar tidak ditemukan atau kosong.')
  }

  // Tolak jika file asli > 5MB
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('Ukuran file asli terlalu besar (maksimal 5MB). Silakan pilih foto lain.')
  }

  // Validasi tipe file
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
  if (file.type && !allowedTypes.includes(file.type)) {
    throw new Error('Format file tidak didukung. Harap gunakan format JPG, PNG, atau WebP.')
  }

  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  // Inisialisasi pipeline sharp
  const pipeline = sharp(inputBuffer)
    .rotate() // Otomatis atur orientasi berdasarkan metadata EXIF
    .resize({
      width: MAX_IMAGE_WIDTH,
      withoutEnlargement: true,
      fit: 'inside',
    })

  // Coba kompresi WebP dengan quality 80 terlebih dahulu
  let outputBuffer = await pipeline.webp({ quality: 80 }).toBuffer()

  // Jika hasil masih > 500KB, tingkatkan kompresi (quality 65)
  if (outputBuffer.length > TARGET_MAX_SIZE_BYTES) {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: MAX_IMAGE_WIDTH,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 65 })
      .toBuffer()
  }

  // Jika masih di atas 500KB, turunkan ke quality 50 dan max width 1000
  if (outputBuffer.length > TARGET_MAX_SIZE_BYTES) {
    outputBuffer = await sharp(inputBuffer)
      .rotate()
      .resize({
        width: 1000,
        withoutEnlargement: true,
        fit: 'inside',
      })
      .webp({ quality: 50 })
      .toBuffer()
  }

  return {
    buffer: outputBuffer,
    ext: 'webp',
    contentType: 'image/webp',
  }
}
