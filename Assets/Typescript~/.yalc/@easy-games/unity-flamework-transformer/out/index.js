"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
var path_1 = __importDefault(require("path"));
var typescript_1 = __importDefault(require("typescript"));
var logger_1 = require("./classes/logger");
var constants_1 = require("./classes/pathTranslator/constants");
var transformState_1 = require("./classes/transformState");
var viewFile_1 = require("./information/viewFile");
var transformFile_1 = require("./transformations/transformFile");
var factory_1 = require("./util/factory");
function default_1(program, config) {
    return function (context) {
        if (logger_1.Logger.verbose)
            logger_1.Logger.write("\n");
        factory_1.f.setFactory(context.factory);
        var state = new transformState_1.TransformState(program, context, config !== null && config !== void 0 ? config : {});
        var hasCollectedInformation = false;
        var projectFlameworkVersion = state.buildInfo.getFlameworkVersion();
        if (projectFlameworkVersion !== constants_1.PKG_VERSION) {
            logger_1.Logger.writeLine("".concat(chalk_1.default.red("Project was compiled on different version of Flamework.")), "Please recompile by deleting the ".concat(path_1.default.relative(state.currentDirectory, state.outDir), " directory"), "Current Flamework Version: ".concat(chalk_1.default.yellow(constants_1.PKG_VERSION)), "Previous Flamework Version: ".concat(chalk_1.default.yellow(projectFlameworkVersion)));
            process.exit(1);
        }
        return function (file) {
            if (!typescript_1.default.isSourceFile(file)) {
                logger_1.Logger.writeLine("not source file.");
                // Logger.writeLine("file: " + inspect(file));
                // emitTypescriptMismatch(state, chalk.red("Failed to load! TS version mismatch detected"));
            }
            if (state.config.noSemanticDiagnostics !== true) {
                var originalFile = typescript_1.default.getParseTreeNode(file, typescript_1.default.isSourceFile);
                if (originalFile) {
                    var preEmitDiagnostics = typescript_1.default.getPreEmitDiagnostics(program, originalFile);
                    if (preEmitDiagnostics.some(function (x) { return x.category === typescript_1.default.DiagnosticCategory.Error; })) {
                        preEmitDiagnostics
                            .filter(typescript_1.default.isDiagnosticWithLocation)
                            .forEach(function (diag) { return context.addDiagnostic(diag); });
                        return file;
                    }
                }
                else {
                    var relativeName = path_1.default.relative(state.srcDir, file.fileName);
                    logger_1.Logger.warn("Failed to validate '".concat(relativeName, "' due to lack of parse tree node."));
                }
            }
            if (!hasCollectedInformation) {
                hasCollectedInformation = true;
                state.symbolProvider.registerInterestingFiles();
                program.getSourceFiles().forEach(function (file) {
                    if (file.isDeclarationFile && !state.shouldViewFile(file))
                        return;
                    (0, viewFile_1.viewFile)(state, file);
                });
                state.setupMacros();
            }
            if (state.hasErrors)
                return file;
            var result = (0, transformFile_1.transformFile)(state, file);
            return result;
        };
    };
}
exports.default = default_1;
//# sourceMappingURL=index.js.map