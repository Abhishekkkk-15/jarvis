import { Injectable } from '@nestjs/common';
import { ToolService } from './tool.service';
import { SafetyService } from './safety.service';
import { EventEmitter } from 'events';

export interface ToolExecutionEvent {
  type: 'start' | 'end' | 'approval_required' | 'error';
  toolName: string;
  id: string;
  args?: any;
  result?: any;
  error?: string;
}

@Injectable()
export class ExecutionService {
  private events = new EventEmitter();

  constructor(
    private readonly toolService: ToolService,
    private readonly safetyService: SafetyService,
  ) {}

  onEvent(callback: (event: ToolExecutionEvent) => void) {
    this.events.on('event', callback);
  }

  async runTool(name: string, args: any, id: string, approveCallback?: (id: string) => Promise<boolean>) {
    this.events.emit('event', { type: 'start', toolName: name, id, args });

    // 1. Safety Check
    if (this.safetyService.isDangerous(name)) {
      this.events.emit('event', { type: 'approval_required', toolName: name, id, args });
      
      if (!approveCallback) {
        const error = 'Manual approval required but no callback provided';
        this.events.emit('event', { type: 'error', toolName: name, id, error });
        return { error };
      }

      const approved = await approveCallback(id);
      if (!approved) {
        const error = 'User denied permission';
        this.events.emit('event', { type: 'end', toolName: name, id, result: { error } });
        return { error };
      }
    }

    // 2. Execution
    try {
      const result = await this.toolService.executeTool(name, args);
      this.events.emit('event', { type: 'end', toolName: name, id, result });
      return result;
    } catch (error: any) {
      this.events.emit('event', { type: 'error', toolName: name, id, error: error.message });
      return { error: error.message };
    }
  }
}
