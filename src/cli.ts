import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { DEFAULT_OPENCLAW_URL } from './config/constants.js';

export interface CliArgs {
  openclawUrl: string;
  transport: 'stdio' | 'sse';
  port: number;
  host: string;
  oauthEnabled: boolean;
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
    .option('transport', {
      alias: 't',
      type: 'string',
      choices: ['stdio', 'sse'] as const,
      description: 'Transport mode (stdio for local, sse for remote)',
      default: 'stdio',
    })
    .option('port', {
      alias: 'p',
      type: 'number',
      description: 'Port for SSE server',
      default: parseInt(process.env.PORT || '3000', 10),
    })
    .option('host', {
      type: 'string',
      description: 'Host for SSE server',
      default: process.env.HOST || '0.0.0.0',
    })
    .option('oauth', {
      type: 'boolean',
      description: 'Enable OAuth authentication (SSE mode)',
      default: process.env.OAUTH_ENABLED === 'true',
    })
    .help()
    .parseSync();

  return {
    openclawUrl: argv['openclaw-url'] as string,
    transport: argv.transport as 'stdio' | 'sse',
    port: argv.port,
    host: argv.host,
    oauthEnabled: argv.oauth,
  };
}
