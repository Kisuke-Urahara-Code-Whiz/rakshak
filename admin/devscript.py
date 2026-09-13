import subprocess
import re
import requests
import sys

# Configuration
LOCAL_PORT = 8000
NOTIFICATION_ENDPOINT = "https://iotserver-mauve.vercel.app/push"


def start_pinggy_and_notify():
    # Construct the Pinggy SSH command
    # -R 80:localhost:PORT tunnels local HTTP traffic
    cmd = ["ssh", "-p", "443", "-R", f"0:localhost:{LOCAL_PORT}", "qr@free.pinggy.io"]
    
    print(f"[*] Starting Pinggy tunnel for local port {LOCAL_PORT}...")
    
    # Launch SSH process and capture output stream line-by-line
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )

    url_found = False
    
    try:
        for line in process.stdout:
            print(line, end="") # Print SSH output to terminal
            
            # Regex to match Pinggy generated public HTTPS URL
            match = re.search(r"https://[a-zA-Z0-9\-]+\.pinggy\.(io|link)", line)
            
            if match and not url_found:
                public_url = match.group(0)
                url_found = True
                print(f"\n[+] Captured Pinggy URL: {public_url}")
                
                # Notify your backend/endpoint about the new URL
                notify_endpoint(public_url)
                
    except KeyboardInterrupt:
        print("\n[*] Stopping tunnel...")
        process.terminate()

def notify_endpoint(new_url):
    new_url = new_url.replace("https://", "")
    try:
        response = requests.get(NOTIFICATION_ENDPOINT+"?service=esp&url="+new_url, timeout=5)
        if response.status_code == 200:
            print(f"[✓] Successfully notified endpoint with new URL!")
        else:
            print(f"[!] Endpoint returned status code {response.status_code}: {response.text}")
    except Exception as e:
        print(f"[!] Failed to send URL to endpoint: {e}")

if __name__ == "__main__":
    start_pinggy_and_notify()