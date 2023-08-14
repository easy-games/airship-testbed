import normalize from "normalize-package-data";
export type PackageJsonResult = ReturnType<typeof getPackageJsonInner>;
/**
 * Looks recursively at ancestors until a package.json is found
 * @param directory The directory to start under.
 */
export declare function getPackageJson(directory: string): {
    directory: string;
    path: string;
    result: normalize.Package;
};
declare function getPackageJsonInner(directory: string): {
    directory: string;
    path: string;
    result: normalize.Package;
};
export {};
