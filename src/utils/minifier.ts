export function minifyCode(files: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [filename, content] of Object.entries(files)) {
    if (filename.endsWith('.html')) {
      // Remove HTML comments (except conditionals) and collapse multiple whitespace
      result[filename] = content
        .replace(/<!--[\s\S]*?-->/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim();
    } else if (filename.endsWith('.css')) {
      // Remove CSS comments and whitespace around symbols
      result[filename] = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;\}/g, '}')
        .replace(/\s{2,}/g, ' ')
        .trim();
    } else if (filename.endsWith('.js')) {
      // Remove standalone comment lines safely without destroying http:// or https:// in strings
      result[filename] = content
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '')
        .trim();
    } else {
      result[filename] = content;
    }
  }

  return result;
}

export function formatCode(content: string, type: 'html' | 'css' | 'js'): string {
  // Simple clean indentation formatter
  try {
    if (type === 'css' || type === 'js') {
      let formatted = '';
      let indent = 0;
      const lines = content.split('\n');
      for (let line of lines) {
        line = line.trim();
        if (line.endsWith('}') || line.startsWith('}')) {
          indent = Math.max(0, indent - 1);
        }
        formatted += '  '.repeat(indent) + line + '\n';
        if (line.endsWith('{')) {
          indent++;
        }
      }
      return formatted.trim();
    }
    return content;
  } catch (e) {
    return content;
  }
}
