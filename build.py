import shutil
import os

def run_command(command):
    """Runs a command using os.system and exits if it fails."""
    os.system(command)

def deleteFolder(path):
    if os.path.exists(path):
        shutil.rmtree(path)

# Run commands in order

deleteFolder("dist")
deleteFolder("gtp_logs")
run_command("npx electron-builder build")
run_command("pyinstaller --onefile --clean --name RunGOGame --exclude-module pygame --distpath ./dist/win-unpacked/ launcher.py")
deleteFolder("build")

src = "data"
dest = "dist/win-unpacked/data"

# Copy entire folder (works on Windows, Mac, and Linux)
shutil.copytree(src, dest, dirs_exist_ok=True)  # `dirs_exist_ok=True` allows overwriting
src = "baduk_AI"
dest = "dist/win-unpacked/baduk_AI"

# Copy entire folder (works on Windows, Mac, and Linux)
shutil.copytree(src, dest, dirs_exist_ok=True)  # `dirs_exist_ok=True` allows overwriting

src = "AI_Data.db"
dest = "dist/win-unpacked/"

# Copy entire folder (works on Windows, Mac, and Linux)
shutil.copy(src, dest)  # `dirs_exist_ok=True` allows overwriting

src = "tsumego_sets.db"
dest = "dist/win-unpacked/"

# Copy entire folder (works on Windows, Mac, and Linux)
shutil.copy(src, dest)  # `dirs_exist_ok=True` allows overwriting


print("\nBuild process completed successfully!")
