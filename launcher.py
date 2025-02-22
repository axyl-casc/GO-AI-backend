import json
import os
import psutil
import GPUtil
import subprocess

CONFIG_PATH = "data/config.json"

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

def update_config():
    """Reads config.json, updates RAM and VRAM values, and saves it back."""
    if os.path.exists(CONFIG_PATH):
        try:
            with open(CONFIG_PATH, "r") as file:
                config = json.load(file)
        except json.JSONDecodeError:
            print("Error: Invalid JSON format in config file. Resetting it.")
            config = {}
    else:
        config = {}

    # Update values
    config["RAM"] = get_ram_info()
    config["VRAM"] = get_vram_info()

    # Save back to the file
    with open(CONFIG_PATH, "w") as file:
        json.dump(config, file, indent=4)

if __name__ == "__main__":
    update_config()
    subprocess.run(["serve.exe"])
