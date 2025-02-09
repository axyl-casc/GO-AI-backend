import os
import sys
import time
import subprocess
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView, QWebEngineProfile
from PyQt5.QtCore import QUrl

# ✅ Fix 2: Enable GPU acceleration
os.environ["QTWEBENGINE_CHROMIUM_FLAGS"] = "--ignore-gpu-blocklist --enable-gpu-rasterization --enable-zero-copy"

class FullScreenBrowser(QMainWindow):
    def __init__(self):
        super().__init__()

        # Create the web view
        self.browser = QWebEngineView()

        # ✅ Fix 1: Set a modern Chrome user-agent
        profile = QWebEngineProfile.defaultProfile()
        profile.setHttpUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
        )

        # ✅ Fix 4: Force desktop view
        self.browser.page().runJavaScript("""
            document.querySelector('meta[name="viewport"]').setAttribute('content', 'width=1920, initial-scale=1.0');
        """)

        # Load the website
        url = QUrl("http://localhost:3003")
        self.browser.setUrl(url)

        self.setCentralWidget(self.browser)
        self.showMaximized()  # Use Maximized instead of Full-Screen

def start_server():
    """Start the Node.js server in the background."""
    print("\nStarting 'node forever.js'...\n")

    process = subprocess.Popen(["node", "forever.js"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    
    # Wait for the server to start
    time.sleep(2)

    return process

def main():
    process = start_server()

    # Start PyQt application
    app = QApplication(sys.argv)
    window = FullScreenBrowser()
    window.show()

    try:
        sys.exit(app.exec_())
    except KeyboardInterrupt:
        print("\nCtrl+C detected. Terminating...")
        process.terminate()
        sys.exit(0)

if __name__ == "__main__":
    main()
