@echo off
chcp 65001 > nul
title EDUMIND Privée - مولد التراخيص وإدارة المشتركين
cd /d "%~dp0"

node keygen.js

echo.
pause
