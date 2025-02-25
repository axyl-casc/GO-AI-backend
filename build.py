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
run_command("pyinstaller --onefile --clean --name reset_tsumego --exclude-module pygame --distpath ./dist/win-unpacked/ init_tsumego_db.py")
deleteFolder("build")

src = "data"
dest = "dist/win-unpacked/data"

# Copy entire folder (works on Windows, Mac, and Linux)
shutil.copytree(src, dest, dirs_exist_ok=True)

src = "baduk_AI"
dest = "dist/win-unpacked/baduk_AI"

shutil.copytree(src, dest, dirs_exist_ok=True)

src = "AI_Data.db"
dest = "dist/win-unpacked/"

shutil.copy(src, dest)

src = "tsumego_sets.db"
dest = "dist/win-unpacked/"

shutil.copy(src, dest)

# Rename "dist/win-unpacked" to "dist/GO-Game"
old_path = "dist/win-unpacked"
new_path = "dist/GO-Game"

if os.path.exists(old_path):
    os.rename(old_path, new_path)

# Zip "dist/GO-Game" into "dist/GO-Game.zip"
shutil.make_archive("dist/GO-Game", 'zip', new_path)

print("\nBuild process completed successfully!")
