$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
& node (Join-Path $Root "bin\cursor-ollama.mjs") proxy install @args
