@echo off
chcp 65001 > nul
title EDUMIND Privée - تسيير المؤسسات والمدارس الخاصة
cd /d "%~dp0"

echo ========================================================
echo     EDUMIND Privée — تسيير المؤسسات التعليمية الخاصة
echo ========================================================
echo.
echo جار تشغيل الخادم على المنفذ 3002...
echo.

start "" http://localhost:3002
node server.js

pause
