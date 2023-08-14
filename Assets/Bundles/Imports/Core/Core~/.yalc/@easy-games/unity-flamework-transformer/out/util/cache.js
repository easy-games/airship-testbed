"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cache = void 0;
/**
 * Global cache that is only reset when rbxtsc is restarted.
 */
exports.Cache = {
    isInitialCompile: true,
    shouldView: new Map(),
    realPath: new Map(),
    moduleResolution: new Map(),
    pkgJsonCache: new Map(),
};
//# sourceMappingURL=cache.js.map