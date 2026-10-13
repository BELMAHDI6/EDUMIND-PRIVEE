@echo off
chcp 65001 > nul
title EDUMIND Privée - بناء ملف التثبيت التنفيذي EXE
cd /d "%~dp0"

echo ========================================================
echo     EDUMIND Privée — بناء ملف التثبيت التنفيذي EXE
echo ========================================================
echo.
node build_setup.js
echo.
pause
