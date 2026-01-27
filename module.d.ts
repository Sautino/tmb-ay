declare namespace NodeJS {
  export interface ProcessEnv {
    // Project settings
    PORT: number;

    // Database Config
    DATABASE_URL: string;
  }
}
