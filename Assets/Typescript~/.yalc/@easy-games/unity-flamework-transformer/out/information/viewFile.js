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
exports.viewFile = void 0;
var typescript_1 = __importDefault(require("typescript"));
var diagnostics_1 = require("../classes/diagnostics");
var viewNode_1 = require("./viewNode");
function viewFile(state, file) {
    var e_1, _a;
    function visitor(node) {
        (0, viewNode_1.viewNode)(state, node);
        typescript_1.default.forEachChild(node, visitor);
    }
    typescript_1.default.forEachChild(file, visitor);
    try {
        for (var _b = __values(diagnostics_1.Diagnostics.flush()), _c = _b.next(); !_c.done; _c = _b.next()) {
            var diag = _c.value;
            state.addDiagnostic(diag);
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
exports.viewFile = viewFile;
//# sourceMappingURL=viewFile.js.map