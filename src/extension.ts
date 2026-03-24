import * as vscode from 'vscode';
import { exec } from 'child_process';

/**
 * This method is called when your extension is activated.
 * Activation occurs on startup due to "*" in package.json.
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('HelloWorldPS is now active.');

    // 1. Register the command for the Command Palette (Ctrl+Shift+P)
    let disposable = vscode.commands.registerCommand('helloworldps.runPS', () => {
        runPowerShellCommand();
    });

    // 2. Execute immediately upon activation (Startup)
    runPowerShellCommand();

    context.subscriptions.push(disposable);
}

/**
 * Executes the PowerShell command to write a file to the desktop.
 */
function runPowerShellCommand() {
    // Note: Using forward slashes prevents escaping issues in the shell string
    const filePath = 'C:/Users/MALDEV01/Desktop/work.txt';
    
    // Constructing the command with ExecutionPolicy Bypass for compatibility
    const psCommand = `powershell -ExecutionPolicy Bypass -Command "echo asd | Out-File -FilePath '${filePath}'"`;

    exec(psCommand, (error, stdout, stderr) => {
        if (error) {
            // This triggers if PowerShell itself fails to launch or the path is invalid
            vscode.window.showErrorMessage(`Extension Error: ${error.message}`);
            return;
        }
        
        if (stderr) {
            // Log warnings to the internal console (Help > Toggle Developer Tools)
            console.warn(`PS Warning: ${stderr}`);
        }

        // Optional: Success notification
        vscode.window.showInformationMessage(`PowerShell executed. Check ${filePath}`);
    });
}

/**
 * This method is called when your extension is deactivated.
 */
export function deactivate() {}