import { config } from '@dotenvx/dotenvx';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Package.json'daki envFile config'i (apps/api working directory'sinden relative)
// NPM script'ler zaten apps/api klasöründen çalıştığı için bu path direkt kullanılabilir
const configEnvFilePath = process.env.npm_package_config_envFile ?? '../../config/apps/api/.env';

// Failsafe .env dosyası arama yolları (öncelik sırasına göre)
function getEnvSearchPaths(): string[] {
  const paths: string[] = [];

  // 1. Çalışılan dizin (cwd) - normal npm script durumu
  paths.push(resolve(process.cwd(), '.env'));

  // 2. apps/api dizini (eğer monorepo root'tan çalışıyorsa)
  if (!process.cwd().endsWith('/apps/api')) {
    paths.push(resolve(process.cwd(), 'apps/api/.env'));
  }

  // 3. Config klasöründeki .env (package.json'daki config)
  paths.push(resolve(configEnvFilePath));

  return paths;
}

function loadEnv() {
  const searchPaths = getEnvSearchPaths();

  // İlk bulunan .env dosyasını kullan
  let envPath: string | null = null;

  for (const path of searchPaths) {
    if (existsSync(path)) {
      envPath = path;
      break;
    }
  }

  // Eğer hiçbiri bulunamazsa config path'ini kullan (son çare)
  if (!envPath) {
    envPath = configEnvFilePath;
    console.warn(`No .env file found in search paths, using fallback: ${envPath}`);
  }

  config({
    path: envPath,
    quiet: true,
  });
}

export { configEnvFilePath as envFilePath, loadEnv };
