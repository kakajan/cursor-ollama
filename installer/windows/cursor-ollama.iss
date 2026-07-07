; cursor-ollama Windows installer — build with Inno Setup 6+
; https://jrsoftware.org/isinfo.php

#define AppName "cursor-ollama"
#define AppVersion "1.3.3"
#define AppPublisher "AYTRONIC CO"
#define AppURL "https://kakajan.github.io/cursor-ollama/"

[Setup]
AppId={{A7B4E2C1-9F3D-4A8B-8C6E-1D2F3A4B5C6D}
AppName={#AppName}
AppVersion={#AppVersion}
AppPublisher={#AppPublisher}
AppPublisherURL={#AppURL}
AppSupportURL={#AppURL}
AppUpdatesURL={#AppURL}
DefaultDirName={autopf}\{#AppName}
DefaultGroupName={#AppName}
DisableProgramGroupPage=yes
LicenseFile=..\..\LICENSE
OutputDir=..\..\dist
OutputBaseFilename=Cursor-Ollama-Setup-{#AppVersion}
SetupIconFile=..\..\assets\logo.ico
UninstallDisplayIcon={app}\assets\logo.ico
WizardStyle=modern
Compression=lzma2/max
SolidCompression=yes
PrivilegesRequired=lowest
ArchitecturesInstallIn64BitMode=x64compatible

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut to run the tray"; GroupDescription: "Shortcuts:"; Flags: checkedonce
Name: "startup"; Description: "Start tray when Windows starts"; GroupDescription: "Shortcuts:"; Flags: checkedonce
Name: "launchwizard"; Description: "Launch setup wizard after install"; GroupDescription: "Setup:"; Flags: checkedonce

[Files]
Source: "..\..\bin\*"; DestDir: "{app}\bin"; Flags: ignoreversion recursesubdirs
Source: "..\..\src\*"; DestDir: "{app}\src"; Flags: ignoreversion recursesubdirs
Source: "..\..\config\*"; DestDir: "{app}\config"; Flags: ignoreversion recursesubdirs
Source: "..\..\assets\*"; DestDir: "{app}\assets"; Flags: ignoreversion recursesubdirs
Source: "..\..\installer\*"; DestDir: "{app}\installer"; Flags: ignoreversion recursesubdirs
Source: "..\..\package.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\package-lock.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\..\node_modules\*"; DestDir: "{app}\node_modules"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\Cursor Ollama (Tray)"; Filename: "{app}\bin\Cursor-Ollama-Tray.cmd"; IconFilename: "{app}\assets\logo.ico"
Name: "{group}\Cursor Ollama Setup Wizard"; Filename: "{app}\bin\Cursor-Ollama-Wizard.cmd"; IconFilename: "{app}\assets\logo.ico"
Name: "{group}\Uninstall {#AppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\Cursor Ollama"; Filename: "{app}\bin\Cursor-Ollama-Tray.cmd"; IconFilename: "{app}\assets\logo.ico"; Tasks: desktopicon
Name: "{userstartup}\Cursor Ollama"; Filename: "{app}\bin\Cursor-Ollama-Tray.cmd"; IconFilename: "{app}\assets\logo.ico"; Tasks: startup

[Run]
Filename: "{app}\bin\Cursor-Ollama-Wizard.cmd"; Description: "Open setup wizard"; Flags: postinstall nowait skipifsilent; Tasks: launchwizard

[UninstallRun]
Filename: "{cmd}"; Parameters: "/c ""{app}\bin\Cursor-Ollama-Uninstall.cmd"" --yes --keep-config"; Flags: runhidden waituntilterminated skipifdoesntexist

[Code]
function NodeInstalled: Boolean;
var
  ResultCode: Integer;
begin
  Result := Exec('cmd.exe', '/c where node >nul 2>&1', '', SW_HIDE, ewWaitUntilTerminated, ResultCode) and (ResultCode = 0);
end;

function InitializeSetup: Boolean;
begin
  Result := True;
  if not NodeInstalled then
  begin
    if MsgBox('Node.js 18+ was not found in PATH.' + #13#10 + 'Install Node from https://nodejs.org then run this installer again.' + #13#10#13#10 + 'Continue anyway?', mbConfirmation, MB_YESNO) = IDNO then
      Result := False;
  end;
end;

[UninstallDelete]
Type: filesandordirs; Name: "{localappdata}\cursor-ollama"
