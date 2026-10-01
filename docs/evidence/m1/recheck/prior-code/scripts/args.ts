import { ContractError } from '../src/lib/errors.js';
export function args(allowed: string[], argv = process.argv.slice(2)) {
  const result: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith('--') || !allowed.includes(key.slice(2)) || !value || value.startsWith('--') || result[key.slice(2)] !== undefined) throw new ContractError('INVALID_ARGUMENT', argv.join(' '));
    result[key.slice(2)] = value;
  }
  return result;
}
