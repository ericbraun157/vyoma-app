@echo off
setlocal

REM Vyoma dev launcher (Windows)
REM - Installs dependencies (root + backend)
REM - Shows outdated packages (non-fatal)
REM - Starts Prisma dev DB, backend API, and Expo frontend in separate windows

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not found. Install from https://nodejs.org/ and re-run.
  exit /b 1
)

where npm >nul 2>nul
if errorlevel 1 (
  echo [ERROR] npm not found. Reinstall Node.js ^(includes npm^) and re-run.
  exit /b 1
)

node -e "try{const z=require('node:zlib'); process.exit(typeof z.zstdCompressSync==='function'?0:1)}catch(e){process.exit(1)}" >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Your Node.js runtime is missing zlib.zstdCompressSync, which Prisma "dev" requires.
  echo [ERROR] Please upgrade Node.js to a newer 22.x release ^(recommended: 22.17+^), then run again.
  echo [INFO] Current version:
  node -v
  exit /b 1
)

set ROOT=%~dp0
set BACKEND=%ROOT%backend

set VYOMA_LOCALAPPDATA=%ROOT%.vyoma-localappdata
if not exist "%VYOMA_LOCALAPPDATA%" (
  mkdir "%VYOMA_LOCALAPPDATA%" >nul 2>nul
)
set LOCALAPPDATA=%VYOMA_LOCALAPPDATA%

set VYOMA_TEMP=%ROOT%.vyoma-temp
if not exist "%VYOMA_TEMP%" (
  mkdir "%VYOMA_TEMP%" >nul 2>nul
)
set TEMP=%VYOMA_TEMP%
set TMP=%VYOMA_TEMP%

set EXPO_HOME=%ROOT%.vyoma-expo-home
if not exist "%EXPO_HOME%" (
  mkdir "%EXPO_HOME%" >nul 2>nul
)

echo.
echo =========================
echo Vyoma: installing deps...
echo =========================
echo.

pushd "%ROOT%"
echo [ROOT] npm install
call npm install
if errorlevel 1 (
  echo [ROOT] npm install failed; retrying with --legacy-peer-deps
  call npm install --legacy-peer-deps
)
if errorlevel 1 (
  echo [ERROR] Root npm install failed.
  popd
  exit /b 1
)

echo.
echo [ROOT] npm outdated (non-fatal)
call npm outdated
echo.
popd

pushd "%BACKEND%"
echo [BACKEND] npm install
call npm install
if errorlevel 1 (
  echo [ERROR] Backend npm install failed.
  popd
  exit /b 1
)

echo.
echo [BACKEND] npm outdated (non-fatal)
call npm outdated
echo.
popd

echo.
echo =========================
echo Vyoma: starting services...
echo =========================
echo.

REM Workaround: some npm installs miss optional lightningcss platform folders.
REM Metro may crash with ENOENT while watching these paths.
if not exist "%ROOT%node_modules\lightningcss-linux-arm-gnueabihf" mkdir "%ROOT%node_modules\lightningcss-linux-arm-gnueabihf" >nul 2>nul
if not exist "%ROOT%node_modules\lightningcss-linux-arm64-gnu" mkdir "%ROOT%node_modules\lightningcss-linux-arm64-gnu" >nul 2>nul
if not exist "%ROOT%node_modules\lightningcss-linux-arm64-musl" mkdir "%ROOT%node_modules\lightningcss-linux-arm64-musl" >nul 2>nul
if not exist "%ROOT%node_modules\lightningcss-linux-x64-gnu" mkdir "%ROOT%node_modules\lightningcss-linux-x64-gnu" >nul 2>nul
if not exist "%ROOT%node_modules\lightningcss-linux-x64-musl" mkdir "%ROOT%node_modules\lightningcss-linux-x64-musl" >nul 2>nul
if not exist "%ROOT%node_modules\lightningcss-darwin-arm64" mkdir "%ROOT%node_modules\lightningcss-darwin-arm64" >nul 2>nul
if not exist "%ROOT%node_modules\lightningcss-darwin-x64" mkdir "%ROOT%node_modules\lightningcss-darwin-x64" >nul 2>nul

REM Prisma dev DB (required for backend migrations/runtime)
REM Note: In .bat files, escape quotes inside quotes by doubling them: ""path""
start "Vyoma Prisma DB" cmd /k "cd /d ""%BACKEND%"" & npx prisma dev"

REM Backend API (defaults to PORT=4000 from backend/.env)
start "Vyoma Backend" cmd /k "cd /d ""%BACKEND%"" & npm run start:dev"

REM Expo app
start "Vyoma Frontend (Expo)" cmd /k "cd /d ""%ROOT%"" & npm start"

echo Started Prisma dev DB, backend, and Expo in separate windows.
echo.
exit /b 0


