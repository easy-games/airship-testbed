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
exports.Logger = void 0;
var chalk_1 = __importDefault(require("chalk"));
function getTime() {
    var hrTime = process.hrtime();
    return hrTime[0] * 1000 + hrTime[1] / 1e6;
}
var Logger = exports.Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.timer = function (name) {
        this.queueTimer();
        this.timers.push([name, getTime()]);
    };
    Logger.timerEnd = function () {
        var timer = this.timers.pop();
        if (!timer)
            return;
        var currentValue = this.timerTotals.get(timer[0]);
        if (!currentValue)
            this.timerTotals.set(timer[0], (currentValue = [0, 0]));
        currentValue[0] += getTime() - timer[1];
        currentValue[1]++;
    };
    Logger.queueTimer = function () {
        var _this = this;
        if (this.timerHandle !== undefined) {
            this.timerHandle.refresh();
            return;
        }
        this.timerHandle = setTimeout(function () {
            var e_1, _a;
            var totals = _this.timerTotals;
            _this.timerTotals = new Map();
            try {
                for (var totals_1 = __values(totals), totals_1_1 = totals_1.next(); !totals_1_1.done; totals_1_1 = totals_1.next()) {
                    var _b = __read(totals_1_1.value, 2), name_1 = _b[0], _c = __read(_b[1], 2), total = _c[0], count = _c[1];
                    console.log("Timer '".concat(name_1, "' took ").concat(total.toFixed(2), "ms (").concat(count, ")"));
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (totals_1_1 && !totals_1_1.done && (_a = totals_1.return)) _a.call(totals_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        });
    };
    Logger.write = function (message) {
        process.stdout.write(message);
    };
    Logger.writeLine = function () {
        var e_2, _a;
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        if (!this.debug)
            return;
        try {
            for (var messages_1 = __values(messages), messages_1_1 = messages_1.next(); !messages_1_1.done; messages_1_1 = messages_1.next()) {
                var message = messages_1_1.value;
                var text = typeof message === "string" ? "".concat(message) : "".concat(JSON.stringify(message, undefined, "\t"));
                var flameworkPrefix = "[".concat(chalk_1.default.gray("Flamework"), "]: ");
                this.write("".concat(flameworkPrefix).concat(text.replace(/\n/g, "\n".concat(flameworkPrefix)), "\n"));
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (messages_1_1 && !messages_1_1.done && (_a = messages_1.return)) _a.call(messages_1);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    Logger.writeLineIfVerbose = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        if (this.verbose)
            return this.writeLine.apply(this, __spreadArray([], __read(messages), false));
    };
    Logger.info = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this.writeLine.apply(this, __spreadArray([], __read(messages.map(function (x) { return chalk_1.default.blue(x); })), false));
    };
    Logger.infoIfVerbose = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        if (this.verbose)
            return this.info.apply(this, __spreadArray([], __read(messages), false));
    };
    Logger.warn = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this.writeLine.apply(this, __spreadArray([], __read(messages.map(function (x) { return chalk_1.default.yellow(x); })), false));
    };
    Logger.warnIfVerbose = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        if (this.verbose)
            return this.warn.apply(this, __spreadArray([], __read(messages), false));
    };
    Logger.error = function () {
        var messages = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            messages[_i] = arguments[_i];
        }
        this.writeLine.apply(this, __spreadArray([], __read(messages.map(function (x) { return chalk_1.default.red(x); })), false));
    };
    Logger.benchmark = function (label) {
        if (!this.debug)
            return;
        var depth = this.benchmarkLabels.length;
        this.benchmarkLabels.push({
            start: new Date().getTime(),
            label: label,
        });
        this.benchmarkOutput += "".concat("\t".repeat(depth), "Begin ").concat(label, "\n");
    };
    Logger.benchmarkEnd = function () {
        if (!this.debug)
            return;
        var label = this.benchmarkLabels.pop();
        var depth = this.benchmarkLabels.length;
        if (!label)
            throw new Error("Unexpected benchmarkEnd()");
        var timeDifference = new Date().getTime() - label.start;
        this.benchmarkOutput += "".concat("\t".repeat(depth), "End ").concat(label.label, " (").concat(timeDifference, "ms)\n");
        if (depth === 0) {
            this.info(this.benchmarkOutput);
            this.benchmarkOutput = "";
        }
    };
    Logger.debug = true;
    Logger.verbose = process.argv.includes("--verbose");
    Logger.timerTotals = new Map();
    Logger.timers = new Array();
    Logger.benchmarkLabels = [];
    Logger.benchmarkOutput = "";
    (function () {
        // Workaround for vscode PTY not having color highlighting.
        if (process.env.VSCODE_CWD !== undefined) {
            // ANSI 256
            chalk_1.default.level = 2;
        }
    })();
    return Logger;
}());
//# sourceMappingURL=logger.js.map