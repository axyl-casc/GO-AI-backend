pyinstaller --onefile --clean --name server --distpath . run_server.py ; Remove-Item -Recurse -Force build
npx electron-packager . MyApp --platform=win32 --arch=x64 --out=release --overwrite --asar
