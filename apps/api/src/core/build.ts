import dts from 'bun-plugin-dts';
import { existsSync, readdirSync } from 'fs';
import { dirname, extname, join, resolve } from 'path';
import sourcePackageJson from '../../package.json';
import { envFilePath, loadEnv } from '../config/env';

loadEnv();

const entrypoints = [
  'src/index.ts', // actual entrypoint
  // dts import fixes
  // ...
];
const distDir = '../../dist';
const outdir = distDir + '/apps/api';

const staticFileDirs = ['public'];

/*
Build script starts here
*/

// outdir'i temizle
const cleanProc = Bun.spawn(['rm', '-rf', outdir], {
  stdout: 'inherit',
  stderr: 'inherit',
});

const cleanExitCode = await cleanProc.exited;
if (cleanExitCode === 0) {
  console.info('Cleaned output directory');
} else {
  console.warn('Failed to clean output directory, continuing anyway...');
}

// outdir'i oluştur
const mkdirProc = Bun.spawn(['mkdir', '-p', outdir], {
  stdout: 'inherit',
  stderr: 'inherit',
});

await mkdirProc.exited;

const packageJson = {
  name: sourcePackageJson.name + '-standalone',
  version: sourcePackageJson.version,
  description: `${sourcePackageJson.name} Standalone Distribution`,
  main: 'index.js',
  scripts: {
    start: `bun run index.js`,
    'start:compiled': 'chmod +x ./compiled && ./compiled',
  },
  engines: {
    bun: '>=1.0.0',
  },
  type: sourcePackageJson.type || 'module',
};

await Bun.write(`${outdir}/package.json`, JSON.stringify(packageJson, null, 2));

// public ve docs klasörlerini kopyala
const copyDirectory = async (src: string, dest: string) => {
  const absoluteSrc = resolve(src);

  if (!existsSync(absoluteSrc)) {
    console.warn(`Source directory ${src} does not exist, skipping...`);
    return;
  }

  const proc = Bun.spawn(['cp', '-r', absoluteSrc, dest], {
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    console.error(`Failed to copy ${src} to ${dest}`);
  }
};

// static file klasörlerini kopyala
for (const dir of staticFileDirs) {
  await copyDirectory(dir, `${outdir}/${dir}`);
}

// .env dosyasını kopyala
const copyEnvFile = async () => {
  const defaultEnvPath = resolve(envFilePath);
  const envConfigDir = dirname(defaultEnvPath);
  const productionEnvPath = resolve(`${envConfigDir}/.env.production`);

  let sourceEnvPath: string | null = null;

  if (existsSync(productionEnvPath)) {
    sourceEnvPath = productionEnvPath;
    console.info('Found .env.production, using it for build');
  } else if (existsSync(defaultEnvPath)) {
    sourceEnvPath = defaultEnvPath;
    console.info('Using .env file for build');
  } else {
    console.warn('No .env or .env.production file found, skipping...');
    return;
  }

  const destEnvPath = `${outdir}/.env`;

  const proc = Bun.spawn(['cp', sourceEnvPath, destEnvPath], {
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    console.error(`Failed to copy env file`);
  }

  // .env.example dosyasını da kopyala
  const exampleEnvPath = resolve(`${envConfigDir}/.env.example`);
  if (existsSync(exampleEnvPath)) {
    const destExamplePath = `${outdir}/.env.example`;

    const exampleProc = Bun.spawn(['cp', exampleEnvPath, destExamplePath], {
      stdout: 'inherit',
      stderr: 'inherit',
    });

    const exampleExitCode = await exampleProc.exited;
    if (exampleExitCode !== 0) {
      console.error(`Failed to copy .env.example file`);
    }
  } else {
    console.warn('No .env.example file found, skipping...');
  }
};

await copyEnvFile();

if (process.env.BUILD_COMPILE_ONLY !== 'true') {
  await Bun.build({
    entrypoints,
    outdir,
    target: 'bun',
    plugins: [
      dts({
        output: {
          noBanner: true,
        },
        compilationOptions: {
          preferredConfigPath: './tsconfig.json',
        },
      }),
    ],
    minify: process.env.BUILD_MINIFY === 'true',
    sourcemap: process.env.BUILD_SOURCEMAP === 'true' ? 'linked' : 'none',
    bytecode: process.env.BUILD_BYTECODE === 'true',
  });
} else {
  console.info('BUILD_COMPILE_ONLY is enabled, skipping regular build...');
}

// Standalone executable oluşturma
if (process.env.BUILD_COMPILE_TARGET) {
  console.info('Creating standalone executable...');

  const compileArgs = [
    'build',
    entrypoints[0] as string,
    '--compile',
    '--outfile',
    `${outdir}/compiled`,
  ];

  // Cross-compilation target ekle
  if (process.env.BUILD_COMPILE_TARGET) {
    compileArgs.push(`--target=${process.env.BUILD_COMPILE_TARGET}`);
    console.info(`Target platform: ${process.env.BUILD_COMPILE_TARGET}`);
  }

  // Ek CLI flag'leri ekle
  if (process.env.BUILD_MINIFY === 'true') {
    compileArgs.push('--minify');
  }

  if (process.env.BUILD_SOURCEMAP === 'true') {
    compileArgs.push('--sourcemap');
  }

  if (process.env.BUILD_BYTECODE === 'true') {
    compileArgs.push('--bytecode');
  }

  const proc = Bun.spawn(['bun', ...compileArgs], {
    stdout: 'inherit',
    stderr: 'inherit',
  });

  const exitCode = await proc.exited;

  if (exitCode === 0) {
    console.info('Standalone executable created successfully');

    // Executable permission'ları ayarla
    const chmodProc = Bun.spawn(['chmod', '+x', `${outdir}/compiled`], {
      stdout: 'inherit',
      stderr: 'inherit',
    });

    const chmodExitCode = await chmodProc.exited;
    if (chmodExitCode !== 0) {
      console.warn('Failed to set executable permissions');
    }
  } else {
    console.error('Failed to create standalone executable');
    process.exit(exitCode);
  }
}

// .node dosyalarını database client klasöründen kopyala
const copyNodeFiles = async () => {
  const clientPath = resolve('../../packages/database/client');
  const destPath = outdir;

  if (!existsSync(clientPath)) {
    console.warn('Database client directory does not exist, skipping .node files...');
    return;
  }

  // client klasörünü oluştur
  const mkdirProc = Bun.spawn(['mkdir', '-p', destPath], {
    stdout: 'inherit',
    stderr: 'inherit',
  });
  await mkdirProc.exited;

  try {
    const files = readdirSync(clientPath);
    const nodeFiles = files.filter((file) => extname(file) === '.node');

    if (nodeFiles.length === 0) {
      console.warn('No .node files found in client directory');
      return;
    }

    for (const nodeFile of nodeFiles) {
      const sourcePath = join(clientPath, nodeFile);
      const destFilePath = join(destPath, nodeFile);

      const copyProc = Bun.spawn(['cp', sourcePath, destFilePath], {
        stdout: 'inherit',
        stderr: 'inherit',
      });

      const exitCode = await copyProc.exited;
      if (exitCode !== 0) {
        console.error(`Failed to copy ${nodeFile}`);
      }
    }
  } catch (error) {
    console.error('Error reading client directory:', error);
  }
};

await copyNodeFiles();

// İlk entrypoint dışındaki entrypoint klasörlerini sil
const cleanExtraEntrypointFolders = async () => {
  if (entrypoints.length <= 1) {
    return; // Tek entrypoint varsa silecek bir şey yok
  }

  // İlk entryoint'in klasör adını belirle
  const firstEntrypoint = entrypoints[0]!;
  const firstEntrypointDir = firstEntrypoint.split('/')[0]; // "src/index.ts" -> "src"

  // Diğer entrypoint'lerin klasör adlarını belirle ve sil
  for (let i = 1; i < entrypoints.length; i++) {
    const entrypoint = entrypoints[i]!;

    // Relative path'i hesapla
    const entrypointDir = entrypoint.startsWith('../../')
      ? // "../.." ile başlıyorsa, bunları kaldır ve geriye kalan ilk klasörü al
        entrypoint.replace('../../', '').split('/')[0]!
      : entrypoint.split('/')[0]!;

    const dirToDelete = `${distDir}/${entrypointDir}`;

    if (existsSync(dirToDelete) && entrypointDir !== firstEntrypointDir) {
      const deleteProc = Bun.spawn(['rm', '-rf', dirToDelete], {
        stdout: 'inherit',
        stderr: 'inherit',
      });

      const deleteExitCode = await deleteProc.exited;
      if (deleteExitCode !== 0) {
        console.warn(`Failed to delete extra entrypoint folder: ${dirToDelete}`);
      }
    }
  }
};

await cleanExtraEntrypointFolders();

console.info('Build completed');
