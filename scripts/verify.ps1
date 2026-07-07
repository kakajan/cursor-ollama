param(
    [switch]$Mock
)

$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$argsList = @('verify')
if ($Mock) { $argsList += '--mock' }
& node (Join-Path $Root "bin\cursor-ollama.mjs") @argsList
