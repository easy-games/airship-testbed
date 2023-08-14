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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenericIdMap = void 0;
var MODDING_SYMBOLS = {
    getDecorator: { index: 2 },
    getDecorators: { index: 0 },
    // onListenerAdded: { index: 1, optional: true },
    // onListenerRemoved: { index: 1, optional: true },
    registerDependency: { index: 1 },
    getPropertyDecorators: { index: 1 },
};
var TESTING_SYMBOLS = {
    patchDependency: { index: 1 },
};
var COMPONENTS_SYMBOLS = {
    getComponent: { index: 1 },
    getComponents: { index: 1 },
    addComponent: { index: 1 },
    removeComponent: { index: 1 },
    getAllComponents: { index: 0 },
};
function getGenericIdMap(state) {
    if (state.genericIdMap)
        return state.genericIdMap;
    var map = new Map();
    var modding = state.symbolProvider.moddingFile.getNamespace("Modding");
    var testing = state.symbolProvider.flamework.getNamespace("Testing");
    var components = state.symbolProvider.components;
    addRecord(modding, MODDING_SYMBOLS);
    addRecord(testing, TESTING_SYMBOLS);
    if (components)
        addRecord(components, COMPONENTS_SYMBOLS);
    return map;
    function addRecord(symbol, record) {
        var e_1, _a;
        try {
            for (var _b = __values(Object.entries(record)), _c = _b.next(); !_c.done; _c = _b.next()) {
                var _d = __read(_c.value, 2), name_1 = _d[0], settings = _d[1];
                map.set(symbol.get(name_1), settings);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
}
exports.getGenericIdMap = getGenericIdMap;
//# sourceMappingURL=getGenericIdMap.js.map