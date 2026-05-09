import { AIProvider } from '@jarvis/ai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export interface ReflectionResult {
  analysis: string;
  action: 'retry' | 'modify_plan' | 'fail';
  newSteps?: { description: string; order: string }[];
}

export class ReflectionAgent {
  private parser = new JsonOutputParser<ReflectionResult>();
  private prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are the ReflectionAgent for Jarvis.
Your job is to analyze failed tool outputs or execution errors and decide how to recover.

Possible Actions:
- 'retry': If it's a transient error or a slight mismatch (e.g., button not found but might be visible after scroll).
- 'modify_plan': If the current approach is fundamentally wrong (e.g., the website layout changed, need to search differently).
- 'fail': If the goal is impossible or requires user intervention.

Output ONLY a JSON object with 'analysis', 'action', and optionally 'newSteps'.`],
    ['human', 'Goal: {goal}\nFailed Step: {stepDescription}\nError: {error}\nExecution History: {history}']
  ]);

  constructor(private aiProvider: AIProvider) {}

  async reflect(goal: string, stepDescription: string, error: string, history: string): Promise<ReflectionResult> {
    const chain = this.prompt.pipe(this.aiProvider.getModel()).pipe(this.parser);
    return chain.invoke({ goal, stepDescription, error, history });
  }
}
