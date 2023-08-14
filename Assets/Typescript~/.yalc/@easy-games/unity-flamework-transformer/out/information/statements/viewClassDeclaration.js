"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewClassDeclaration = void 0;
var typescript_1 = __importDefault(require("typescript"));
var path_1 = __importDefault(require("path"));
var factory_1 = require("../../util/factory");
var uid_1 = require("../../util/uid");
function viewClassDeclaration(state, node) {
    var e_1, _a;
    var _b, _c;
    var symbolProvider = state.symbolProvider;
    var symbol = state.getSymbol(node);
    var internalId = (0, uid_1.getNodeUid)(state, node);
    if (!node.name || !symbol)
        return;
    var nodeDecorators = typescript_1.default.canHaveDecorators(node) ? typescript_1.default.getDecorators(node) : undefined;
    var isFlameworkClass = nodeDecorators !== undefined || node.members.some(function (v) { return typescript_1.default.canHaveDecorators(v) && typescript_1.default.getDecorators(v); });
    var decorators = [];
    var flameworkDecorators = new Set([
        symbolProvider.flameworkFile.get("Service"),
        symbolProvider.flameworkFile.get("Controller"),
        (_b = symbolProvider.componentsFile) === null || _b === void 0 ? void 0 : _b.get("Component"),
    ]);
    if (nodeDecorators) {
        try {
            for (var nodeDecorators_1 = __values(nodeDecorators), nodeDecorators_1_1 = nodeDecorators_1.next(); !nodeDecorators_1_1.done; nodeDecorators_1_1 = nodeDecorators_1.next()) {
                var decorator = nodeDecorators_1_1.value;
                if (!factory_1.f.is.call(decorator.expression))
                    continue;
                var symbol_1 = state.getSymbol(decorator.expression.expression);
                if (!symbol_1)
                    continue;
                if (!((_c = symbol_1.declarations) === null || _c === void 0 ? void 0 : _c[0]))
                    continue;
                if (!factory_1.f.is.identifier(decorator.expression.expression))
                    continue;
                var name_1 = decorator.expression.expression.text;
                var isFlameworkDecorator = flameworkDecorators.has(symbol_1);
                decorators.push({
                    type: "WithNodes",
                    declaration: symbol_1.declarations[0],
                    arguments: decorator.expression.arguments.map(function (x) { return x; }),
                    internalId: (0, uid_1.getSymbolUid)(state, symbol_1, decorator.expression.expression),
                    isFlameworkDecorator: isFlameworkDecorator,
                    name: name_1,
                    symbol: symbol_1,
                });
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (nodeDecorators_1_1 && !nodeDecorators_1_1.done && (_a = nodeDecorators_1.return)) _a.call(nodeDecorators_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    if (isFlameworkClass) {
        var classInfo = {
            name: node.name.text,
            internalId: internalId,
            node: node,
            decorators: decorators,
            symbol: symbol,
        };
        state.classes.set(symbol, classInfo);
        if (!state.isGame && !state.buildInfo.getBuildClass(internalId)) {
            var filePath = state.pathTranslator.getOutputPath(state.getSourceFile(node).fileName);
            var relativePath = path_1.default.relative(state.currentDirectory, filePath);
            state.buildInfo.addBuildClass({
                filePath: relativePath,
                internalId: internalId,
                decorators: decorators.map(function (x) { return ({
                    internalId: x.internalId,
                    isFlameworkDecorator: x.isFlameworkDecorator,
                    name: x.name,
                }); }),
            });
        }
    }
    else {
        var buildClass = state.buildInfo.getBuildClass(internalId);
        if (buildClass) {
            state.classes.set(symbol, {
                internalId: internalId,
                node: node,
                symbol: symbol,
                name: node.name.text,
                decorators: buildClass.decorators.map(function (x) { return ({
                    type: "Base",
                    internalId: x.internalId,
                    name: x.name,
                    isFlameworkDecorator: x.isFlameworkDecorator,
                }); }),
            });
        }
    }
}
exports.viewClassDeclaration = viewClassDeclaration;
//# sourceMappingURL=viewClassDeclaration.js.map