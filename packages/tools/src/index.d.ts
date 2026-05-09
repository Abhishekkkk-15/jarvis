import { z } from 'zod';
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: z.ZodObject<any>;
    execute: (args: any) => Promise<any>;
}
export declare class ToolRegistry {
    private tools;
    register(tool: ToolDefinition): void;
    getTool(name: string): ToolDefinition | undefined;
    getAllTools(): ToolDefinition[];
    getJsonSchemas(): {
        name: string;
        description: string;
        parameters: import("zod-to-json-schema").JsonSchema7Type & {
            $schema?: string | undefined;
            definitions?: {
                [key: string]: import("zod-to-json-schema").JsonSchema7Type;
            } | undefined;
        };
    }[];
}
export declare const openBrowserTool: ToolDefinition;
export declare const searchFilesTool: ToolDefinition;
