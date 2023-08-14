/**
 * Checks if the `filePath` path is a descendant of the `dirPath` path.
 * @param filePath A path to a file.
 * @param dirPath A path to a directory.
 */
export declare function isPathDescendantOf(filePath: string, dirPath: string): boolean;
/**
 * Checks if the `filePath` is a descendant of any of the specified `dirPaths` paths.
 * @param filePath A path to a file.
 * @param dirPaths The directories to check.
 */
export declare function isPathDescendantOfAny(filePath: string, dirPaths: string[]): boolean;
