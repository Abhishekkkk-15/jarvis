import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

@Injectable()
export class FileService {
  async searchFiles(query: string, rootDir: string = process.env.USERPROFILE || process.env.HOME || '/') {
    const results: string[] = [];
    try {
      const files = await fs.readdir(rootDir, { withFileTypes: true });
      for (const file of files) {
        if (file.name.toLowerCase().includes(query.toLowerCase())) {
          results.push(path.join(rootDir, file.name));
        }
      }
    } catch (e) {
      console.error('Error searching files:', e);
    }
    return results;
  }

  async readFile(filePath: string) {
    return fs.readFile(filePath, 'utf-8');
  }
}
