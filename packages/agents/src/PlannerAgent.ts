import { AIProvider } from '@jarvis/ai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export interface PlanStep {
  description: string;
  order: string;
}

export class PlannerAgent {
  private parser = new JsonOutputParser<PlanStep[]>();
  private prompt = ChatPromptTemplate.fromMessages([
    ['system', `You are the Planner for Jarvis, a fully autonomous AI operating assistant.
Your job is to take a high-level goal from the user and decompose it into a sequence of logical, executable steps.

Rules:
1. Each step should be actionable.
2. Maintain a clear order (e.g., '1', '2', '3' or '1', '1.1', '1.2' for subtasks).
3. Do not include too many steps; keep it concise but complete.
4. Output ONLY a JSON array of objects with 'description' and 'order' keys.

Example Goal: "Download React docs and summarize them"
Output:
[
  {{"description": "Open browser and navigate to React documentation", "order": "1"}},
  {{"description": "Locate and download the PDF documentation", "order": "2"}},
  {{"description": "Read the content of the downloaded file", "order": "3"}},
  {{"description": "Generate a concise summary of the content", "order": "4"}},
  {{"description": "Save the summary to a new file and notify user", "order": "5"}}
]`],
    ['human', '{goal}']
  ]);

  constructor(private aiProvider: AIProvider) {}

  async generatePlan(goal: string): Promise<PlanStep[]> {
    const chain = this.prompt.pipe(this.aiProvider.getModel()).pipe(this.parser);
    return chain.invoke({ goal });
  }
}
