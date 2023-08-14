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
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformStatementList = void 0;
var getNodeList_1 = require("../util/functions/getNodeList");
var transformStatement_1 = require("./transformStatement");
function transformStatementList(state, statements) {
    var e_1, _a;
    var result = new Array();
    var _loop_1 = function (statement) {
        var _b = __read(state.capture(function () { return (0, transformStatement_1.transformStatement)(state, statement); }), 2), newStatements = _b[0], prereqs = _b[1];
        result.push.apply(result, __spreadArray([], __read(prereqs), false));
        result.push.apply(result, __spreadArray([], __read((0, getNodeList_1.getNodeList)(newStatements)), false));
    };
    try {
        for (var statements_1 = __values(statements), statements_1_1 = statements_1.next(); !statements_1_1.done; statements_1_1 = statements_1.next()) {
            var statement = statements_1_1.value;
            _loop_1(statement);
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (statements_1_1 && !statements_1_1.done && (_a = statements_1.return)) _a.call(statements_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return result;
}
exports.transformStatementList = transformStatementList;
//# sourceMappingURL=transformStatementList.js.map