"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isDefinedType = void 0;
var typescript_1 = __importDefault(require("typescript"));
// https://github.com/roblox-ts/roblox-ts/blob/dc74f34fdab3caf20d65db080cf2dbf5c4f38fdc/src/TSTransformer/util/types.ts#L70
function isDefinedType(type) {
    return (type.flags === typescript_1.default.TypeFlags.Object &&
        type.getProperties().length === 0 &&
        type.getCallSignatures().length === 0 &&
        type.getConstructSignatures().length === 0 &&
        type.getNumberIndexType() === undefined &&
        type.getStringIndexType() === undefined);
}
exports.isDefinedType = isDefinedType;
//# sourceMappingURL=isDefinedType.js.map