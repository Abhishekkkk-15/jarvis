import { pgTable, text, timestamp, uuid, jsonb, boolean } from 'drizzle-orm/pg-core';

export const conversations = pgTable('conversations', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  conversationId: uuid('conversation_id').references(() => conversations.id).notNull(),
  role: text('role').notNull(), // 'user', 'assistant', 'system', 'tool'
  content: text('content').notNull(),
  toolCalls: jsonb('tool_calls'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workflows = pgTable('workflows', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  description: text('description'),
  definition: jsonb('definition').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workflowRuns = pgTable('workflow_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  workflowId: uuid('workflow_id').references(() => workflows.id).notNull(),
  status: text('status').notNull(), // 'pending', 'running', 'completed', 'failed'
  result: jsonb('result'),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
});

export const settings = pgTable('settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const memories = pgTable('memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  content: text('content').notNull(),
  vector: text('vector'), // Placeholder for pgvector if needed
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Phase 1 - Agent Runtime System
export const agentTasks = pgTable('agent_tasks', {
  id: uuid('id').primaryKey().defaultRandom(),
  goal: text('goal').notNull(),
  status: text('status').notNull(), // 'pending', 'running', 'paused', 'completed', 'failed'
  context: jsonb('context'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const taskSteps = pgTable('task_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => agentTasks.id).notNull(),
  description: text('description').notNull(),
  status: text('status').notNull(), // 'pending', 'running', 'completed', 'failed'
  order: text('order').notNull(), // To maintain dependency chains (e.g. '1', '1.1')
  toolCall: jsonb('tool_call'),
  result: jsonb('result'),
  error: text('error'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const executionEvents = pgTable('execution_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => agentTasks.id).notNull(),
  stepId: uuid('step_id').references(() => taskSteps.id),
  eventType: text('event_type').notNull(), // 'observe', 'think', 'plan', 'execute', 'evaluate', 'retry'
  details: jsonb('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Phase 4 - Advanced Memory Layer
export const episodicMemories = pgTable('episodic_memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  summary: text('summary').notNull(),
  outcomes: jsonb('outcomes'),
  vector: text('vector'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const workingMemories = pgTable('working_memories', {
  id: uuid('id').primaryKey().defaultRandom(),
  taskId: uuid('task_id').references(() => agentTasks.id).notNull(),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
