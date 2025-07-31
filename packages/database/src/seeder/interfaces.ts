export interface SeederConfig {
  name: string;
  description?: string;
  priority?: number; // Lower number = runs first
  dependencies?: string[]; // Seeders that must run before this seeder
}

export interface Seeder {
  config: SeederConfig;
  // biome-ignore lint/suspicious/noExplicitAny: <To fix build errors on api, it must be set to any>
  seed: (db: any) => Promise<void>;
  // biome-ignore lint/suspicious/noExplicitAny: <To fix build errors on api, it must be set to any>
  rollback?: (db: any) => Promise<void>;
}

export interface SeederRunOptions {
  includeOnly?: string[];
  exclude?: string[];
}

export interface SeederExecutionStats {
  name: string;
  startTime: number;
  endTime: number;
  duration: number;
  success: boolean;
  error?: Error;
}
