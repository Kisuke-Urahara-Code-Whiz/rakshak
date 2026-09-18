import subprocess
import sys
import json
import urllib.request
import time
import threading
import asyncio
import requests

cmd = ["ssh", "-p", "443", "-R0:127.0.0.1:8000", "-L4300:127.0.0.1:4300", "free.pinggy.io"]
def pinger(url):
    while True:
        requests.get(f"https://iotserver-mauve.vercel.app/push?service=esp&url={url}")
        asyncio.sleep(0.1)
def fetch_and_send_urls():
    """Queries Pinggy's built-in JSON API and posts the URLs to your server."""
    # Give the SSH tunnel a couple of seconds to authenticate and assign endpoints
    time.sleep(4) 
    
    try:
        # 1. Fetch JSON mapping directly from Pinggy's local endpoint
        with urllib.request.urlopen("http://localhost:4300/urls") as response:
            url_data = json.loads(response.read().decode())
        url = url_data['urls'][0]
        # The JSON data looks like: {"http": "http://...", "https": "https://..."}
        print(f"\n[API] Successfully retrieved URLs: {url_data}")
        while True:
            requests.get(f"https://iotserver-mauve.vercel.app/push?service=esp&url={url}")
            time.sleep(10)
        #requests.get(f"https://iotserver-mauve.vercel.app/push?service=esp&url={url}")            
    except Exception as e:
        print(f"\n[API Error] Failed to retrieve/transmit endpoints: {e}")

def live_clone_process():
    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE, 
        stdin=subprocess.PIPE, 
        stderr=subprocess.STDOUT, 
        shell=True,
        bufsize=0  
    )

    # Launch our API fetcher on a background thread so it won't block the password prompt
    threading.Thread(target=fetch_and_send_urls, daemon=True).start()

    # Read character-by-character to allow interactive password authentication
    while True:
        char_bytes = process.stdout.read(1)
        if not char_bytes:
            break  
            
        char_text = char_bytes.decode('utf-8', errors='replace')
        sys.stdout.write(char_text)     
        sys.stdout.flush()

if __name__ == "__main__":
    global url
    url = ""
    live_clone_process()
