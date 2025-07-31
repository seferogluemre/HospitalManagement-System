import { config } from '@dotenvx/dotenvx';

// Package.json's envFile config (relative to apps/api working directory)
// NPM scripts already run from apps/api directory, so this path can be used directly
const envFilePath = process.env.npm_package_config_envFile || '../../config/apps/api/.env';

export const loadEnv = () => {
  config({
    path: envFilePath,
    quiet: true,
  });
};

export { envFilePath };
