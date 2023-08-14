"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.Diagnostics = void 0;
var typescript_1 = __importDefault(require("typescript"));
function createDiagnosticAtLocation(node, messageText, category, file) {
    if (file === void 0) { file = typescript_1.default.getSourceFileOfNode(node); }
    return {
        category: category,
        file: file,
        messageText: messageText,
        start: node.getStart(),
        length: node.getWidth(),
        code: " @easy-games/flamework-core",
    };
}
var DiagnosticError = /** @class */ (function (_super) {
    __extends(DiagnosticError, _super);
    function DiagnosticError(diagnostic) {
        var _this = _super.call(this, diagnostic.messageText) || this;
        _this.diagnostic = diagnostic;
        return _this;
    }
    return DiagnosticError;
}(Error));
var Diagnostics = exports.Diagnostics = /** @class */ (function () {
    function Diagnostics() {
    }
    Diagnostics.addDiagnostic = function (diag) {
        this.diagnostics.push(diag);
    };
    Diagnostics.createDiagnostic = function (node, category) {
        var messages = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            messages[_i - 2] = arguments[_i];
        }
        return createDiagnosticAtLocation(node, messages.join("\n"), category);
    };
    Diagnostics.relocate = function (diagnostic, node) {
        diagnostic.file = typescript_1.default.getSourceFileOfNode(node);
        diagnostic.start = node.getStart();
        diagnostic.length = node.getWidth();
        throw new DiagnosticError(diagnostic);
    };
    Diagnostics.error = function (node) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        throw new DiagnosticError(this.createDiagnostic.apply(this, __spreadArray([node, typescript_1.default.DiagnosticCategory.Error], __read(messages), false)));
    };
    Diagnostics.warning = function (node) {
        var messages = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            messages[_i - 1] = arguments[_i];
        }
        this.addDiagnostic(this.createDiagnostic.apply(this, __spreadArray([node, typescript_1.default.DiagnosticCategory.Warning], __read(messages), false)));
    };
    Diagnostics.flush = function () {
        var diagnostics = this.diagnostics;
        this.diagnostics = [];
        return diagnostics;
    };
    Diagnostics.diagnostics = new Array();
    return Diagnostics;
}());
//# sourceMappingURL=diagnostics.js.map