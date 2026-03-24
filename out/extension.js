"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
/**
 * This method is called when your extension is activated.
 * Activation occurs on startup due to "*" in package.json.
 */
function activate(context) {
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
    (0, child_process_1.exec)(psCommand, (error, stdout, stderr) => {
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
function deactivate() { }
//# sourceMappingURL=extension.js.map