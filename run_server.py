import subprocess
import psutil
import GPUtil
import os
import signal

def get_ram_info():
    """Returns total system RAM in GB."""
    ram = psutil.virtual_memory().total / (1024 ** 3)
    return f"{ram:.2f}"

def get_vram_info():
    """Returns total VRAM of the primary GPU in GB."""
    gpus = GPUtil.getGPUs()
    if gpus:
        vram = gpus[0].memoryTotal / 1024  # Convert MB to GB
        return f"{vram:.2f}"
    return "0"

def main():
    ram = get_ram_info()
    vram = get_vram_info()

    print(f"Total RAM: {ram} GB")
    print(f"Total VRAM: {vram} GB")

    # Pass RAM and VRAM as arguments to forever.js
    print("\nRunning 'node forever.js' with parameters...\n")

    try:
        if os.name == "nt":
            # Windows: Use CREATE_NEW_PROCESS_GROUP to manage the subprocess
            process = subprocess.Popen(
                ["node", "forever.js", ram, vram],
                creationflags=subprocess.CREATE_NEW_PROCESS_GROUP
            )
        else:
            # Linux/macOS: Use setsid to manage the subprocess
            process = subprocess.Popen(
                ["node", "forever.js", ram, vram],
                preexec_fn=os.setsid
            )

        # Wait for the Python script to exit
        process.wait()
    finally:
        # Ensure the Node.js process terminates when Python exits
        print("Python process exiting. Killing Node.js process...")
        if os.name == "nt":
            subprocess.call(["taskkill", "/F", "/T", "/PID", str(process.pid)])
        else:
            os.killpg(os.getpgid(process.pid), signal.SIGTERM)

if __name__ == "__main__":
    main()
