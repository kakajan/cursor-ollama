@echo off
setlocal
set "APP=%~dp0.."
set "CLI=%~dp0cursor-ollama.mjs"
set "NODE=%APP%\node\node.exe"
if not exist "%NODE%" set "NODE=node"
"%NODE%" "%CLI%" uninstall %*
