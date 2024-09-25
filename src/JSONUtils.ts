import * as fs from 'fs';

export class JSONUtils {
  static readFile<T>(filePath: string): T {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }
}
