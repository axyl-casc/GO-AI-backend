import os
import sys
import time
import subprocess
from PyQt5.QtWidgets import QApplication, QMainWindow, QShortcut
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineProfile, QWebEngineSettings
from PyQt5.QtCore import QUrl, QTimer
from PyQt5.QtGui import QKeySequence

# Configure Chromium flags for modern web features
os.environ["QTWEBENGINE_CHROMIUM_FLAGS"] = (
    "--ignore-gpu-blocklist "
    "--enable-gpu-rasterization "
    "--enable-zero-copy "
    "--enable-features=WebRTCPipeWireCapturer "
    "--disable-features=UseChromeOSDirectVideoDecoder "
    "--force-dark-mode "
    "--disable-compositing-antialiasing "
    "--enable-webgl "
    "--enable-smooth-scrolling"
)

class WebApp(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("My Web Application")
        self.setMinimumSize(1024, 768)
        
        # Configure browser profile
        self.profile = QWebEngineProfile.defaultProfile()
        self.profile.setHttpUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        )
        self.profile.setPersistentCookiesPolicy(QWebEngineProfile.ForcePersistentCookies)
        self.profile.setCachePath(os.path.expanduser("~/.cache/webapp"))
        self.profile.setPersistentStoragePath(os.path.expanduser("~/.local/webapp"))

        # Create web view with configured profile
        self.browser = QWebEngineView()
        self.configure_web_settings()

        # Set up browser events
        self.browser.loadStarted.connect(self.on_load_start)
        self.browser.loadFinished.connect(self.on_load_finish)

        # Configure UI
        self.setCentralWidget(self.browser)
        self.showMaximized()
        
        # Fullscreen shortcut (F11)
        QShortcut(QKeySequence("F11"), self).activated.connect(self.toggle_fullscreen)

    def configure_web_settings(self):
        settings = self.browser.settings()
        settings.setAttribute(QWebEngineSettings.FullScreenSupportEnabled, True)
        settings.setAttribute(QWebEngineSettings.JavascriptEnabled, True)
        settings.setAttribute(QWebEngineSettings.JavascriptCanOpenWindows, True)
        settings.setAttribute(QWebEngineSettings.LocalStorageEnabled, True)
        settings.setAttribute(QWebEngineSettings.PluginsEnabled, True)
        settings.setAttribute(QWebEngineSettings.ScrollAnimatorEnabled, True)
        settings.setAttribute(QWebEngineSettings.WebGLEnabled, True)
        settings.setAttribute(QWebEngineSettings.AllowWindowActivationFromJavaScript, True)
        settings.setAttribute(QWebEngineSettings.ShowScrollBars, False)
        settings.setUnknownUrlSchemePolicy(QWebEngineSettings.AllowAllUnknownUrlSchemes)

    def toggle_fullscreen(self):
        if self.isFullScreen():
            self.showNormal()
        else:
            self.showFullScreen()

    def on_load_start(self):
        self.browser.page().runJavaScript("""
            document.documentElement.style.colorScheme = 'light';
            document.documentElement.style.overflow = 'hidden';
            document.head.insertAdjacentHTML('beforeend', 
                '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">');
        """)

    def on_load_finish(self, ok):
        if ok:
            self.browser.page().runJavaScript("""
                // Force Tailwind's dark mode if needed
                if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                }
                
                // Prevent pinch-zoom on mobile devices
                document.body.style.touchAction = 'pan-y';
                const disableZoom = (e) => {
                    if (e.touches.length > 1) e.preventDefault();
                };
                document.addEventListener('touchstart', disableZoom, { passive: false });
            """)

            # Fix potential CSS transitions
            QTimer.singleShot(100, lambda: self.browser.page().setZoomFactor(0.6))

def start_server():
    """Start the Node.js server with better error handling"""
    try:
        process = subprocess.Popen(
            ["node", "forever.js"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True
        )
        
        # Wait for server to become ready
        timeout = 10  # seconds
        start_time = time.time()
        while True:
            if time.time() - start_time > timeout:
                raise TimeoutError("Server failed to start within 10 seconds")
            try:
                # Simple port check (modify according to your server)
                subprocess.check_output(["curl", "--silent", "http://localhost:3002"])
                break
            except:
                time.sleep(0.5)
        
        return process
    except Exception as e:
        print(f"Failed to start server: {str(e)}")
        sys.exit(1)

def main():
    server_process = start_server()
    
    app = QApplication(sys.argv)
    app.setApplicationName("MyWebApp")
    app.setDesktopFileName("my-webapp.desktop")
    
    window = WebApp()
    window.browser.setUrl(QUrl("http://localhost:3002"))
    
    try:
        sys.exit(app.exec_())
    finally:
        server_process.terminate()
        server_process.wait()

if __name__ == "__main__":
    main()