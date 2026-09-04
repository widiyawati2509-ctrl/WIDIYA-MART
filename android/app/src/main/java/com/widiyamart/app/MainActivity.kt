package com.widiyamart.app

import android.annotation.SuppressLint
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.view.View
import android.webkit.CookieManager
import android.webkit.JavascriptInterface
import android.webkit.PermissionRequest
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.widiyamart.app.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var backPressedTime: Long = 0

    companion object {
        const val CHANNEL_ID = "order_notifications_channel"
        const val CHANNEL_NAME = "Notifikasi Pesanan"
    }

    // Permission launcher for Android 13+ POST_NOTIFICATIONS
    private val notificationPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (!isGranted) {
            Toast.makeText(
                this,
                "Izin notifikasi ditolak. Anda tidak akan menerima pemberitahuan pesanan baru.",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    // File chooser launcher for image/file uploads
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (result.resultCode == RESULT_OK) {
            val data = result.data
            val results: Array<Uri>? = when {
                data?.data != null -> arrayOf(data.data!!)
                data?.clipData != null -> {
                    val count = data.clipData!!.itemCount
                    Array(count) { i -> data.clipData!!.getItemAt(i).uri }
                }
                else -> null
            }
            fileUploadCallback?.onReceiveValue(results)
        } else {
            fileUploadCallback?.onReceiveValue(null)
        }
        fileUploadCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupNotificationChannel()
        checkNotificationPermission()

        setupSwipeRefresh()
        setupWebView()
        setupBackPress()
        setupRetryButton()

        // Start background order monitoring (works 24/7 even when app is closed)
        OrderAlarmReceiver.scheduleAlarm(this)

        loadHomePage()
    }

    private fun setupNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val descriptionText = "Pemberitahuan untuk pesanan baru di Widiya Mart"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, CHANNEL_NAME, importance).apply {
                description = descriptionText
                enableVibration(true)
                enableLights(true)
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                notificationPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefreshLayout.setColorSchemeColors(
            ContextCompat.getColor(this, R.color.coral_primary),
            ContextCompat.getColor(this, R.color.coral_accent)
        )
        binding.swipeRefreshLayout.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        val settings = binding.webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT
        settings.allowFileAccess = true
        settings.useWideViewPort = true
        settings.loadWithOverviewMode = true
        settings.mediaPlaybackRequiresUserGesture = false

        // Enable Cookies and Third-Party Cookies (essential for Supabase Auth & Session persistence)
        val cookieManager = CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)
        cookieManager.setAcceptThirdPartyCookies(binding.webView, true)

        // Custom User Agent identifier
        settings.userAgentString = "${settings.userAgentString} WidiyaMartApp/1.0"

        // Register Javascript Interface for Web App Notifications
        binding.webView.addJavascriptInterface(WebAppInterface(), "AndroidHost")
        binding.webView.addJavascriptInterface(WebAppInterface(), "Android")

        binding.webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                val url = request?.url?.toString() ?: return false
                return handleExternalUrls(url)
            }

            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.progressBar.visibility = View.VISIBLE
                binding.layoutOffline.visibility = View.GONE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                binding.swipeRefreshLayout.isRefreshing = false

                // Persist session cookies to disk
                CookieManager.getInstance().flush()

                // Remember last URL (so admin stays on /admin after closing/reopening)
                if (url != null && url.startsWith(getString(R.string.web_url))) {
                    getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
                        .edit()
                        .putString("last_url", url)
                        .apply()
                }

                // Inject Notification Polyfill to automatically map Web HTML5 Notifications to Android Native Notifications
                val jsPolyfill = """
                    (function() {
                        if (typeof window.Notification === 'undefined' || !window.AndroidNativeNotificationInstalled) {
                            window.AndroidNativeNotificationInstalled = true;
                            window.Notification = function(title, options) {
                                options = options || {};
                                var body = options.body || '';
                                if (window.AndroidHost && window.AndroidHost.showNotification) {
                                    window.AndroidHost.showNotification(title, body);
                                } else if (window.Android && window.Android.showNotification) {
                                    window.Android.showNotification(title, body);
                                }
                            };
                            window.Notification.permission = 'granted';
                            window.Notification.requestPermission = function(callback) {
                                if (callback) callback('granted');
                                return Promise.resolve('granted');
                            };
                        }
                    })();
                """.trimIndent()
                binding.webView.evaluateJavascript(jsPolyfill, null)
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefreshLayout.isRefreshing = false
                    binding.layoutOffline.visibility = View.VISIBLE
                }
            }
        }

        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                binding.progressBar.progress = newProgress
                if (newProgress >= 100) {
                    binding.progressBar.visibility = View.GONE
                }
            }

            override fun onPermissionRequest(request: PermissionRequest?) {
                runOnUiThread {
                    request?.grant(request.resources)
                }
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                val intent = fileChooserParams?.createIntent() ?: Intent(Intent.ACTION_GET_CONTENT).apply {
                    type = "*/*"
                    addCategory(Intent.CATEGORY_OPENABLE)
                }

                try {
                    fileChooserLauncher.launch(intent)
                } catch (e: ActivityNotFoundException) {
                    fileUploadCallback = null
                    Toast.makeText(this@MainActivity, "Aplikasi file picker tidak ditemukan", Toast.LENGTH_SHORT).show()
                    return false
                }
                return true
            }
        }
    }

    inner class WebAppInterface {
        @JavascriptInterface
        fun showNotification(title: String?, message: String?) {
            runOnUiThread {
                val notifTitle = if (title.isNullOrEmpty()) "Pesanan Baru Widiya Mart" else title
                val notifMessage = if (message.isNullOrEmpty()) "Ada pesanan baru masuk! Silakan periksa aplikasi." else message
                triggerNativeNotification(notifTitle, notifMessage)
            }
        }
    }

    fun triggerNativeNotification(title: String, message: String) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setAutoCancel(true)
            .setSound(soundUri)
            .setVibrate(longArrayOf(0, 500, 200, 500))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)

        val notificationManager = NotificationManagerCompat.from(this)
        if (ActivityCompat.checkSelfPermission(
                this,
                android.Manifest.permission.POST_NOTIFICATIONS
            ) == PackageManager.PERMISSION_GRANTED || Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
        ) {
            notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
        }
    }



    private fun handleExternalUrls(url: String): Boolean {
        if (url.startsWith("https://wa.me/") || url.startsWith("whatsapp://")) {
            return try {
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(intent)
                true
            } catch (e: Exception) {
                Toast.makeText(this, "Aplikasi WhatsApp tidak terpasang di ponsel", Toast.LENGTH_SHORT).show()
                false
            }
        }

        if (url.startsWith("tel:")) {
            return try {
                val intent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                startActivity(intent)
                true
            } catch (e: Exception) {
                false
            }
        }

        if (url.startsWith("mailto:")) {
            return try {
                val intent = Intent(Intent.ACTION_SENDTO, Uri.parse(url))
                startActivity(intent)
                true
            } catch (e: Exception) {
                false
            }
        }

        if (url.startsWith("market://")) {
            return try {
                startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                true
            } catch (e: Exception) {
                false
            }
        }

        return false
    }

    private fun setupBackPress() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    if (backPressedTime + 2000 > System.currentTimeMillis()) {
                        finish()
                    } else {
                        Toast.makeText(
                            this@MainActivity,
                            "Tekan sekali lagi untuk keluar dari Widiya Mart",
                            Toast.LENGTH_SHORT
                        ).show()
                        backPressedTime = System.currentTimeMillis()
                    }
                }
            }
        })
    }

    private fun setupRetryButton() {
        binding.btnRetry.setOnClickListener {
            binding.layoutOffline.visibility = View.GONE
            binding.progressBar.visibility = View.VISIBLE
            binding.webView.reload()
        }
    }

    private fun loadHomePage() {
        val prefs = getSharedPreferences("app_prefs", Context.MODE_PRIVATE)
        val defaultUrl = getString(R.string.web_url)
        val lastUrl = prefs.getString("last_url", defaultUrl) ?: defaultUrl
        binding.webView.loadUrl(lastUrl)
    }

    override fun onPause() {
        super.onPause()
        CookieManager.getInstance().flush()
    }

    override fun onDestroy() {
        binding.webView.destroy()
        super.onDestroy()
    }
}
