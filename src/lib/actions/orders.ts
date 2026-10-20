// @ts-nocheck
'use server'

/**
 * WIDIYA MART - Orders Action Modular Barrel
 * Next.js Server Actions mewajibkan setiap export berupa `async function`.
 * Fungsi di bawah mendelegasikan langsung ke modul domain masing-masing:
 * - ordersCreate.ts     : createOrder
 * - ordersStatus.ts     : restoreOrderStock, updateOrderStatus
 * - ordersExpiration.ts : checkAndExpirePickupOrders
 * - ordersManage.ts     : reorderItems, deleteOrders, deleteAllOrders, deleteSingleOrder
 */

import { createOrder as _createOrder } from './orders/ordersCreate'
import {
  restoreOrderStock as _restoreOrderStock,
  updateOrderStatus as _updateOrderStatus,
} from './orders/ordersStatus'
import { checkAndExpirePickupOrders as _checkAndExpirePickupOrders } from './orders/ordersExpiration'
import {
  reorderItems as _reorderItems,
  deleteOrders as _deleteOrders,
  deleteAllOrders as _deleteAllOrders,
  deleteSingleOrder as _deleteSingleOrder,
} from './orders/ordersManage'

export async function createOrder(...args: Parameters<typeof _createOrder>) {
  return _createOrder(...args)
}

export async function restoreOrderStock(...args: Parameters<typeof _restoreOrderStock>) {
  return _restoreOrderStock(...args)
}

export async function updateOrderStatus(...args: Parameters<typeof _updateOrderStatus>) {
  return _updateOrderStatus(...args)
}

export async function checkAndExpirePickupOrders(...args: Parameters<typeof _checkAndExpirePickupOrders>) {
  return _checkAndExpirePickupOrders(...args)
}

export async function reorderItems(...args: Parameters<typeof _reorderItems>) {
  return _reorderItems(...args)
}

export async function deleteOrders(...args: Parameters<typeof _deleteOrders>) {
  return _deleteOrders(...args)
}

export async function deleteAllOrders(...args: Parameters<typeof _deleteAllOrders>) {
  return _deleteAllOrders(...args)
}

export async function deleteSingleOrder(...args: Parameters<typeof _deleteSingleOrder>) {
  return _deleteSingleOrder(...args)
}
