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

  async writeFile(filePath: string, content: string) {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  }

  async deleteFile(filePath: string) {
    await fs.unlink(filePath);
    return { success: true };
  }

  async listDirectory(dirPath: string) {
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    return files.map(f => ({
      name: f.name,
      isDirectory: f.isDirectory(),
      path: path.join(dirPath, f.name),
    }));
  }

  async moveFile(source: string, destination: string) {
    await fs.rename(source, destination);
    return { success: true };
  }
}
