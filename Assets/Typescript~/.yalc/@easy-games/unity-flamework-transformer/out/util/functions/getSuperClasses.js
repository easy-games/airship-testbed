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
exports.getSuperClasses = void 0;
var typescript_1 = __importDefault(require("typescript"));
function getSuperClasses(typeChecker, node) {
    var _a, _b, _c, _d;
    var superClasses = new Array();
    var superClass = (_c = (_b = (_a = node.heritageClauses) === null || _a === void 0 ? void 0 : _a.find(function (x) { return x.token === typescript_1.default.SyntaxKind.ExtendsKeyword; })) === null || _b === void 0 ? void 0 : _b.types) === null || _c === void 0 ? void 0 : _c[0];
    if (superClass) {
        var aliasSymbol = typeChecker.getSymbolAtLocation(superClass.expression);
        if (aliasSymbol) {
            var symbol = typescript_1.default.skipAlias(aliasSymbol, typeChecker);
            var classDeclaration = (_d = symbol === null || symbol === void 0 ? void 0 : symbol.declarations) === null || _d === void 0 ? void 0 : _d.find(function (x) {
                return typescript_1.default.isClassDeclaration(x);
            });
            if (classDeclaration) {
                superClasses.push(classDeclaration);
                superClasses.push.apply(superClasses, __spreadArray([], __read(getSuperClasses(typeChecker, classDeclaration)), false));
            }
        }
    }
    return superClasses;
}
exports.getSuperClasses = getSuperClasses;
//# sourceMappingURL=getSuperClasses.js.map