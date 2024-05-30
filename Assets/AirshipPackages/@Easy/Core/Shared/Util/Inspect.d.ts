interface InspectOptions {
  depth?: number;
  newline?: string;
  indent?: string;
  process?: (item: any, path: Array<string>) => string | undefined;
}

interface Inspect {
  (value: any, options?: InspectOptions): string;
  readonly KEY: symbol;
  readonly METATABLE: symbol;
  readonly _VERSION: string;
  readonly _URL: string;
  readonly _DESCRIPTION: string;
  readonly _LICENSE: string;
}

declare const inspect: Inspect;
export = inspect;
