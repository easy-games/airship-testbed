export type Constructor<T = object> = new (...args: never[]) => T;

interface EasyFileServiceConstructor {
	GetFilesInPath(path: string, searchPattern?: string): CSArray<string>;
}

declare function require(path: string): unknown;

interface RunCore {
    constructor(): RunCore;
}
    
interface RunCoreConstructor {
    IsClient(): boolean;
    IsEditor(): boolean;
    IsServer(): boolean;
}