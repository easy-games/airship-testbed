"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchDiagnostic = exports.relocateDiagnostic = exports.captureDiagnostic = void 0;
/* eslint-disable @typescript-eslint/no-explicit-any */
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../classes/diagnostics");
function captureDiagnostic(cb) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    try {
        return { success: true, value: cb.apply(void 0, __spreadArray([], __read(args), false)) };
    }
    catch (e) {
        if ("diagnostic" in e) {
            /// Temporary workaround for 1.1.1
            if (typescript_1.default.version.startsWith("1.1.1") &&
                !typescript_1.default.version.startsWith("1.1.1-dev") &&
                !globalThis.RBXTSC_DEV) {
                e.diagnostic = undefined;
                throw e;
            }
            return { success: false, diagnostic: e.diagnostic };
        }
        throw e;
    }
}
exports.captureDiagnostic = captureDiagnostic;
function relocateDiagnostic(node, cb) {
    var params = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        params[_i - 2] = arguments[_i];
    }
    var result = captureDiagnostic.apply(void 0, __spreadArray([cb], __read(params), false));
    if (result.success) {
        return result.value;
    }
    diagnostics_1.Diagnostics.relocate(result.diagnostic, node);
}
exports.relocateDiagnostic = relocateDiagnostic;
function catchDiagnostic(fallback, cb) {
    var _a;
    var result = captureDiagnostic(cb);
    if (!result.success) {
        diagnostics_1.Diagnostics.addDiagnostic(result.diagnostic);
    }
    return (_a = result.value) !== null && _a !== void 0 ? _a : fallback;
}
exports.catchDiagnostic = catchDiagnostic;
//# sourceMappingURL=diagnosticsUtils.js.map