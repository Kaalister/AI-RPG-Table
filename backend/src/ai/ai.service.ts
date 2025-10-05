import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class AiService {
  ask(prompt: string): Promise<{ response: string }> {
    return new Promise((resolve) => {
      const process = spawn('ollama', ['run', 'mistral'], {
        stdio: ['pipe', 'pipe', 'inherit'],
      });
      let output = '';

      process.stdout.on('data', (data) => (output += data.toString()));
      process.stdin.write(prompt);
      process.stdin.end();

      process.on('close', () => resolve({ response: output }));
    });
  }
}
