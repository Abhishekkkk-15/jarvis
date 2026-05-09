import { Injectable } from '@nestjs/common';

export interface SafetyPolicy {
  dangerousTools: string[];
}

@Injectable()
export class SafetyService {
  private policy: SafetyPolicy = {
    dangerousTools: [
      'delete_file', 'write_file', 'move_file', 'delete_directory',
      'execute_shell', 'execute_powershell', 'shutdown_system', 'restart_system',
      'mouse_click', 'keyboard_type', 'keyboard_hotkey',
      'git_commit', 'git_push', 'query_database', 'send_email'
    ],
  };

  isDangerous(toolName: string): boolean {
    return this.policy.dangerousTools.includes(toolName);
  }

  getPolicy() {
    return this.policy;
  }
}
