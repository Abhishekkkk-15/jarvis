import { Injectable } from '@nestjs/common';

export interface SafetyPolicy {
  dangerousTools: string[];
}

@Injectable()
export class SafetyService {
  private policy: SafetyPolicy = {
    dangerousTools: ['delete_file', 'execute_shell', 'click_desktop', 'type_text'],
  };

  isDangerous(toolName: string): boolean {
    return this.policy.dangerousTools.includes(toolName);
  }

  getPolicy() {
    return this.policy;
  }
}
