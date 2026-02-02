import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DEFAULT_OPENCLAW_URL } from './config/constants.js';

export interface CliArgs {
  openclawUrl: string;
}

export function parseArguments(version: string): CliArgs {
  const argv = yargs(hideBin(process.argv))
    .version(version)
    .option('openclaw-url', {
      alias: 'u',
      type: 'string',
      description: 'OpenClaw gateway URL',
      default: process.env.OPENCLAW_URL || DEFAULT_OPENCLAW_URL,
    })
    .help()
    .parseSync();

  return {
    openclawUrl: argv['openclaw-url'] as string,
  };
}
