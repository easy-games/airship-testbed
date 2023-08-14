export declare class PathInfo {
    dirName: string;
    fileName: string;
    exts: Array<string>;
    private constructor();
    static from(filePath: string): PathInfo;
    extsPeek(depth?: number): string | undefined;
    join(): string;
}
export declare class PathTranslator {
    readonly rootDir: string;
    readonly outDir: string;
    readonly buildInfoOutputPath: string | undefined;
    readonly declaration: boolean;
    constructor(rootDir: string, outDir: string, buildInfoOutputPath: string | undefined, declaration: boolean);
    private makeRelativeFactory;
    /**
     * Maps an input path to an output path
     * - `.tsx?` && !`.d.tsx?` -> `.lua`
     * 	- `index` -> `init`
     * - `src/*` -> `out/*`
     */
    getOutputPath(filePath: string): string;
    /**
     * Maps an output path to possible import paths
     * - `.lua` -> `.tsx?`
     * 	- `init` -> `index`
     * - `out/*` -> `src/*`
     */
    getInputPaths(filePath: string): string[];
    /**
     * Maps a src path to an import path
     * - `.d.tsx?` -> `.tsx?` -> `.lua`
     * 	- `index` -> `init`
     */
    getImportPath(filePath: string, isNodeModule?: boolean): string;
}
