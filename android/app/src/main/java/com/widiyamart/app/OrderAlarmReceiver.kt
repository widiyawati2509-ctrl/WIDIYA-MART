package com.widiyamart.app

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.webkit.CookieManager
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

class OrderAlarmReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_CHECK_ORDERS = "com.widiyamart.app.ACTION_CHECK_ORDERS"
        private const val CHECK_INTERVAL_MS = 30_000L // 30 seconds

        fun scheduleAlarm(context: Context) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val intent = Intent(context, OrderAlarmReceiver::class.java).apply {
                action = ACTION_CHECK_ORDERS
            }
            val pendingIntent = PendingIntent.getBroadcast(
                context,
                1001,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val triggerAtMillis = System.currentTimeMillis() + CHECK_INTERVAL_MS

            try {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    alarmManager.setAndAllowWhileIdle(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                } else {
                    alarmManager.set(
                        AlarmManager.RTC_WAKEUP,
                        triggerAtMillis,
                        pendingIntent
                    )
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    private val executor = Executors.newSingleThreadExecutor()

    override fun onReceive(context: Context, intent: Intent?) {
        // Reschedule next alarm immediately so it keeps checking 24/7
        scheduleAlarm(context)

        // Check orders in background thread
        executor.execute {
            checkOrders(context)
        }
    }

    private fun checkOrders(context: Context) {
        try {
            val url = URL("https://widiya-mart.vercel.app/api/orders/latest")
            val conn = url.openConnection() as HttpURLConnection
            conn.requestMethod = "GET"
            conn.connectTimeout = 10000
            conn.readTimeout = 10000

            // Forward session cookies from CookieManager so endpoint recognizes admin
            val cookies = CookieManager.getInstance().getCookie("https://widiya-mart.vercel.app")
            if (!cookies.isNullOrEmpty()) {
                conn.setRequestProperty("Cookie", cookies)
            }

            conn.connect()

            if (conn.responseCode == 200) {
                val reader = BufferedReader(InputStreamReader(conn.inputStream))
                val response = reader.readText()
                reader.close()

                val json = JSONObject(response)
                val order = json.optJSONObject("order")
                if (order != null) {
                    val orderId = order.optString("id")
                    val nama = order.optString("nama_pemesan", "Pelanggan")
                    val total = order.optDouble("total", 0.0)

                    val prefs = context.getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                    val lastNotifiedId = prefs.getString("last_notified_order_id", null)

                    if (lastNotifiedId == null) {
                        // First run, record current latest order baseline
                        prefs.edit().putString("last_notified_order_id", orderId).apply()
                    } else if (orderId != lastNotifiedId) {
                        // New order arrived while app was in background or closed!
                        prefs.edit().putString("last_notified_order_id", orderId).apply()
                        showOrderNotification(context, orderId, nama, total)
                    }
                }
            }
            conn.disconnect()
        } catch (e: Exception) {
            // network silent retry
        }
    }

    private fun showOrderNotification(context: Context, orderId: String, nama: String, total: Double) {
        val channelId = MainActivity.CHANNEL_ID
        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        // Ensure notification channel exists
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, MainActivity.CHANNEL_NAME, importance).apply {
                description = "Pemberitahuan untuk pesanan baru di TOKO MIRING"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 500, 200, 500)
                val audioAttributes = AudioAttributes.Builder()
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .build()
                setSound(soundUri, audioAttributes)
            }
            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            nm?.createNotificationChannel(channel)
        }

        val openIntent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            context,
            orderId.hashCode(),
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val formattedTotal = String.format("%,.0f", total).replace(',', '.')
        val title = "Pesanan Baru Masuk! 🎉"
        val message = "Pesanan dari $nama senilai Rp $formattedTotal"

        val builder = NotificationCompat.Builder(context, channelId)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setAutoCancel(true)
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setContentIntent(pendingIntent)

        val nmCompat = NotificationManagerCompat.from(context)
        if (ActivityCompat.checkSelfPermission(
                context,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED || Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
        ) {
            nmCompat.notify(orderId.hashCode(), builder.build())
        }
    }
}
