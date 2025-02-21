import subprocess
import psutil
import GPUtil
import sys

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
    sys.stdout.flush()  # Force immediate output

    print(f"Total RAM: {ram} GB")
    print(f"Total VRAM: {vram} GB")
    print("\nRunning 'node forever.js' with parameters...\n")
    try:
        subprocess.run(["node", "forever.js", ram, vram], check=True)
    except KeyboardInterrupt:
        print("\nCtrl+C detected. Terminating...")
        sys.exit(0)

if __name__ == "__main__":
    main()
