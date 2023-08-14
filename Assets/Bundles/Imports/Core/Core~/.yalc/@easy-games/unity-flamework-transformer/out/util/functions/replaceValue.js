"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replaceValue = void 0;
/**
 * Replace a value (in-place) in an array.
 */
function replaceValue(arr, needle, value) {
    var index = arr.lastIndexOf(needle);
    if (index === -1)
        return;
    arr[index] = value;
}
exports.replaceValue = replaceValue;
//# sourceMappingURL=replaceValue.js.map