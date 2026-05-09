export type TaskStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed';
export type StepStatus = 'pending' | 'running' | 'completed' | 'failed';
export type EventType = 'observe' | 'think' | 'plan' | 'execute' | 'evaluate' | 'retry';

export interface TaskStep {
  id: string;
  description: string;
  status: StepStatus;
  order: string;
  toolCall?: any;
  result?: any;
  error?: string;
}

export interface AgentTask {
  id: string;
  goal: string;
  status: TaskStatus;
  context?: any;
  steps: TaskStep[];
}

export interface ExecutionEvent {
  id: string;
  taskId: string;
  stepId?: string;
  eventType: EventType;
  details?: any;
  createdAt: Date;
}
