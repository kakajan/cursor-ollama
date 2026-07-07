@echo off
setlocal
set "CLI=%~dp0cursor-ollama.mjs"
set "NODE=%NODE_EXE%"
if not defined NODE set "NODE=node"
"%NODE%" "%CLI%" tray
