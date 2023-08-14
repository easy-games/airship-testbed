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
exports.NodeMetadata = void 0;
var typescript_1 = __importDefault(require("typescript"));
var factory_1 = require("../util/factory");
var NodeMetadata = /** @class */ (function () {
    function NodeMetadata(state, node) {
        this.set = new Set();
        this.symbols = new Map();
        this.types = new Map();
        this.trace = new Map();
        this.parse(state, node);
    }
    NodeMetadata.prototype.parseText = function (text, node) {
        var e_1, _a;
        try {
            for (var _b = __values(text.trim().replace(/\s+/, " ").split(" ")), _c = _b.next(); !_c.done; _c = _b.next()) {
                var name_1 = _c.value;
                this.set.add(name_1);
                this.trace.set(name_1, node);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    NodeMetadata.prototype.parseMetadata = function (state, tag) {
        var e_2, _a;
        if (typeof tag.comment === "string") {
            this.parseText(tag.comment, tag);
        }
        else if (tag.comment) {
            try {
                for (var _b = __values(tag.comment), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var comment = _c.value;
                    if (typescript_1.default.isJSDocLinkLike(comment)) {
                        if (!comment.name)
                            continue;
                        var symbol = state.getSymbol(comment.name);
                        if (!symbol)
                            continue;
                        var type = symbol.flags & typescript_1.default.SymbolFlags.TypeAlias
                            ? state.typeChecker.getDeclaredTypeOfSymbol(symbol)
                            : state.typeChecker.getTypeAtLocation(comment.name);
                        var symbols = this.symbols.get(comment.text);
                        var types = this.types.get(comment.text);
                        if (!types)
                            this.types.set(comment.text, (types = []));
                        if (!symbols)
                            this.symbols.set(comment.text, (symbols = []));
                        symbols.push(symbol);
                        types.push(type);
                        this.trace.set(symbol, comment);
                        this.trace.set(type, comment);
                    }
                    else {
                        this.parseText(comment.text, comment);
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_2) throw e_2.error; }
            }
        }
    };
    NodeMetadata.prototype.parse = function (state, node) {
        var e_3, _a, e_4, _b, e_5, _c, e_6, _d, e_7, _e, e_8, _f;
        var _g, _h;
        var tags = typescript_1.default.getJSDocTags(node);
        try {
            for (var tags_1 = __values(tags), tags_1_1 = tags_1.next(); !tags_1_1.done; tags_1_1 = tags_1.next()) {
                var tag = tags_1_1.value;
                if (tag.tagName.text === "metadata") {
                    this.parseMetadata(state, tag);
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (tags_1_1 && !tags_1_1.done && (_a = tags_1.return)) _a.call(tags_1);
            }
            finally { if (e_3) throw e_3.error; }
        }
        var decorators = typescript_1.default.canHaveDecorators(node) ? typescript_1.default.getDecorators(node) : undefined;
        if (decorators) {
            try {
                for (var decorators_1 = __values(decorators), decorators_1_1 = decorators_1.next(); !decorators_1_1.done; decorators_1_1 = decorators_1.next()) {
                    var decorator = decorators_1_1.value;
                    var expression = decorator.expression;
                    var symbol = state.getSymbol(factory_1.f.is.call(expression) ? expression.expression : expression);
                    if (!symbol || !symbol.declarations)
                        continue;
                    try {
                        for (var _j = (e_5 = void 0, __values(symbol.declarations)), _k = _j.next(); !_k.done; _k = _j.next()) {
                            var declaration = _k.value;
                            this.parse(state, declaration);
                        }
                    }
                    catch (e_5_1) { e_5 = { error: e_5_1 }; }
                    finally {
                        try {
                            if (_k && !_k.done && (_c = _j.return)) _c.call(_j);
                        }
                        finally { if (e_5) throw e_5.error; }
                    }
                }
            }
            catch (e_4_1) { e_4 = { error: e_4_1 }; }
            finally {
                try {
                    if (decorators_1_1 && !decorators_1_1.done && (_b = decorators_1.return)) _b.call(decorators_1);
                }
                finally { if (e_4) throw e_4.error; }
            }
        }
        if (typescript_1.default.isClassElement(node) && node.name) {
            // Interfaces are able to request metadata for their own property/methods.
            var name_2 = typescript_1.default.getNameFromPropertyName(node.name);
            if (name_2 && typescript_1.default.isClassLike(node.parent)) {
                var implementNodes = typescript_1.default.getEffectiveImplementsTypeNodes(node.parent);
                if (implementNodes) {
                    try {
                        for (var implementNodes_1 = __values(implementNodes), implementNodes_1_1 = implementNodes_1.next(); !implementNodes_1_1.done; implementNodes_1_1 = implementNodes_1.next()) {
                            var implement = implementNodes_1_1.value;
                            var symbol = state.getSymbol(implement.expression);
                            var member = (_g = symbol === null || symbol === void 0 ? void 0 : symbol.members) === null || _g === void 0 ? void 0 : _g.get(typescript_1.default.escapeLeadingUnderscores(name_2));
                            if (member && member.declarations) {
                                try {
                                    for (var _l = (e_7 = void 0, __values(member.declarations)), _m = _l.next(); !_m.done; _m = _l.next()) {
                                        var declaration = _m.value;
                                        this.parse(state, declaration);
                                    }
                                }
                                catch (e_7_1) { e_7 = { error: e_7_1 }; }
                                finally {
                                    try {
                                        if (_m && !_m.done && (_e = _l.return)) _e.call(_l);
                                    }
                                    finally { if (e_7) throw e_7.error; }
                                }
                            }
                        }
                    }
                    catch (e_6_1) { e_6 = { error: e_6_1 }; }
                    finally {
                        try {
                            if (implementNodes_1_1 && !implementNodes_1_1.done && (_d = implementNodes_1.return)) _d.call(implementNodes_1);
                        }
                        finally { if (e_6) throw e_6.error; }
                    }
                }
            }
        }
        else if (typescript_1.default.isClassLike(node)) {
            // Interfaces are able to request metadata for the object it is implemented on.
            var implementNodes = typescript_1.default.getEffectiveImplementsTypeNodes(node);
            if (implementNodes) {
                try {
                    for (var implementNodes_2 = __values(implementNodes), implementNodes_2_1 = implementNodes_2.next(); !implementNodes_2_1.done; implementNodes_2_1 = implementNodes_2.next()) {
                        var implement = implementNodes_2_1.value;
                        var symbol = state.getSymbol(implement.expression);
                        if (symbol && ((_h = symbol.declarations) === null || _h === void 0 ? void 0 : _h[0])) {
                            this.parse(state, symbol.declarations[0]);
                        }
                    }
                }
                catch (e_8_1) { e_8 = { error: e_8_1 }; }
                finally {
                    try {
                        if (implementNodes_2_1 && !implementNodes_2_1.done && (_f = implementNodes_2.return)) _f.call(implementNodes_2);
                    }
                    finally { if (e_8) throw e_8.error; }
                }
            }
        }
    };
    NodeMetadata.prototype.isRequested = function (metadata) {
        if (this.set.has("~".concat(metadata))) {
            return false;
        }
        return this.set.has(metadata) || this.set.has("*");
    };
    NodeMetadata.prototype.getSymbol = function (key) {
        return this.symbols.get(key);
    };
    NodeMetadata.prototype.getType = function (key) {
        return this.types.get(key);
    };
    NodeMetadata.prototype.getTrace = function (name) {
        return this.trace.get(name);
    };
    return NodeMetadata;
}());
exports.NodeMetadata = NodeMetadata;
//# sourceMappingURL=nodeMetadata.js.map