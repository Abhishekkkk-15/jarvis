import { Injectable } from '@nestjs/common';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

@Injectable()
export class TerminalService {
  async executeCommand(command: string, cwd?: string, timeout = 30000) {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd,
        timeout,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      });
      
      return {
        success: true,
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout?.trim(),
        stderr: error.stderr?.trim(),
      };
    }
  }

  async executePowerShell(command: string, cwd?: string, timeout = 30000) {
    // Use Base64 encoding to avoid any escaping issues with quotes, dollar signs, etc.
    const buffer = Buffer.from(command, 'utf16le');
    const base64 = buffer.toString('base64');
    const psCommand = `powershell.exe -NoProfile -NonInteractive -EncodedCommand ${base64}`;
    return this.executeCommand(psCommand, cwd, timeout);
  }
}
