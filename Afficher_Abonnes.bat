@echo off
chcp 65001 > nul
title EDUMIND Privée - سجل المشتركين والتراخيص
cd /d "%~dp0"

node keygen.js --list

echo.
echo اضغط على أي زر للرجوع...
pause > nul
