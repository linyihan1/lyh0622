@echo off
chcp 65001 >nul
rem 姓名：林奕含| 学号：24002120622 |
rem 时间：2026-11-20 | 大模型：Trae
rem lyh: 一键后台启动后端服务（端口 622），前端由 express.static 托管，访问 http://localhost:622/

cd /d "%~dp0"

set "LYH_BACKEND_DIR=%~dp0backend"
set "LYH_ENTRY=%LYH_BACKEND_DIR%\app.js"

rem lyh: 校验后端入口文件是否存在
if not exist "%LYH_ENTRY%" (
    echo [ERROR] Backend entry not found: %LYH_ENTRY%
    pause
    exit /b 1
)

rem lyh: 校验依赖是否已安装
if not exist "%LYH_BACKEND_DIR%\node_modules" (
    echo [ERROR] node_modules not found.
    echo         Please run: cd backend ^&^& npm install
    pause
    exit /b 1
)

echo ============================================================
echo  [lyh] Starting backend service ...
echo  [lyh] Frontend : http://localhost:622/
echo  [lyh] Health   : http://localhost:622/api/health
echo  [lyh] Close the backend window to stop the service.
echo ============================================================

rem lyh: 在新窗口后台启动后端，/D 指定工作目录，/k 保留窗口查看日志
start "LYH Backend (port 622)" /D "%LYH_BACKEND_DIR%" cmd /k npm start

exit /b 0
