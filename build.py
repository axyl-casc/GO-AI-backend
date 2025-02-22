import shutil
import os

def run_command(command):
    """Runs a command using os.system and exits if it fails."""
    os.system(command)

# Run commands in order
run_command("rmdir /s /q dist")
run_command("npx electron-builder build")
run_command("pyinstaller --onefile --clean --name RunGOGame --exclude-module pygame --distpath ./dist/win-unpacked/ launcher.py")
run_command("rmdir /s /q build")

src = "data"
dest = "dist/win-unpacked/data"

# Copy entire folder (works on Windows, Mac, and Linux)
shutil.copytree(src, dest, dirs_exist_ok=True)  # `dirs_exist_ok=True` allows overwriting

print("\nBuild process completed successfully!")
