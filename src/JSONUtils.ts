export class JSONUtils {
  static readFile<T>(filePath: string): T {
    const fs = require('fs');

    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  }
}
