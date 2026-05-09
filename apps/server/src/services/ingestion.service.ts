import { Injectable, OnModuleInit } from '@nestjs/common';
import { MemoryService } from './memory.service';
import { FileService } from './file.service';
import * as path from 'path';

@Injectable()
export class IngestionService implements OnModuleInit {
  constructor(
    private readonly memoryService: MemoryService,
    private readonly fileService: FileService,
  ) {}

  async onModuleInit() {
    // Start background ingestion after a short delay
    setTimeout(() => this.ingestWorkspace(), 5000);
  }

  async ingestWorkspace() {
    console.log('🔍 Starting background ingestion...');
    const rootDir = process.cwd(); // For now, index the project itself
    
    try {
      const files = await this.fileService.searchFiles('', rootDir);
      for (const filePath of files) {
        if (this.isIndexable(filePath)) {
          const content = await this.fileService.readFile(filePath);
          await this.memoryService.storeMemory(content.substring(0, 5000), {
            path: filePath,
            type: 'file',
          });
          console.log(`✅ Indexed: ${path.basename(filePath)}`);
        }
      }
    } catch (e) {
      console.error('Ingestion failed:', e);
    }
  }

  private isIndexable(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();
    const indexableExts = ['.ts', '.tsx', '.js', '.jsx', '.md', '.txt', '.json'];
    const ignoredDirs = ['node_modules', 'dist', '.git', '.pnpm'];
    
    return indexableExts.includes(ext) && !ignoredDirs.some(dir => filePath.includes(dir));
  }
}
