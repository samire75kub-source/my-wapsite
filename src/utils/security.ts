import { MalwareScanResult } from '../types';

export function scanCodeForMalware(files: Record<string, string>, sensitivity: 'high' | 'medium' | 'relaxed' = 'high'): MalwareScanResult {
  const threats: string[] = [];
  let riskScore = 0;

  const code = Object.values(files).join('\n');

  // Check 1: Suspicious Obfuscation & Eval
  if (/(?:eval\s*\(|Function\s*\(\s*["'`]|setTimeout\s*\(\s*["'`])/i.test(code)) {
    threats.push('Dangerous dynamic code execution (eval or dynamic Function) detected.');
    riskScore += 45;
  }

  // Check 2: Obfuscated Base64 execution or hex arrays
  if (/atob\s*\(|unescape\s*\(|\\x[0-9a-fA-F]{2}\\x[0-9a-fA-F]{2}/i.test(code)) {
    threats.push('Potential obfuscated payload (atob/unescape/hex strings) detected.');
    riskScore += 35;
  }

  // Check 3: Cookie theft and session hijacking patterns
  if (/document\.cookie\s*(\+|\.match|\.indexOf|\s*=.*(http|fetch|xhr|\.src))/i.test(code)) {
    threats.push('Potential credential harvesting or cookie exfiltration pattern detected.');
    riskScore += 50;
  }

  // Check 4: Crypto Mining signatures (Coinhive, cryptonight, etc.)
  if (/(?:coinhive|cryptonight|stratum\+tcp|webminerpool|coin-hive)/i.test(code)) {
    threats.push('Crypto currency mining script pattern detected.');
    riskScore += 90;
  }

  // Check 5: Malicious credential harvesting patterns
  if (/document\.cookie\s*(\+|\.match|\.indexOf|\s*=.*(http|fetch|xhr|\.src))/i.test(code)) {
    threats.push('Potential credential exfiltration pattern detected.');
    riskScore += 40;
  }

  // Check 6: Unauthorized window hijacking
  if (/top\.location\s*=|parent\.location\s*=/i.test(code)) {
    threats.push('Window/top-frame hijacking attempt detected.');
    riskScore += 25;
  }

  // Only block critical malicious threats (e.g., active crypto miners or dangerous exploit payloads)
  const isClean = riskScore < 85;

  return {
    isClean,
    riskScore: Math.min(riskScore, 100),
    threats
  };
}
