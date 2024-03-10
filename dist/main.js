"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestTitle = exports.getRegex = exports.run = void 0;
var core = __importStar(require("@actions/core"));
var github = __importStar(require("@actions/github"));
var run = function () { return __awaiter(void 0, void 0, void 0, function () {
    var title, allPossibleRegex, _i, allPossibleRegex_1, regex;
    return __generator(this, function (_a) {
        try {
            core.debug("Starting PR Title check for Jira Issue Key");
            title = (0, exports.getPullRequestTitle)();
            allPossibleRegex = (0, exports.getRegex)();
            core.debug(title);
            core.debug(allPossibleRegex.toString());
            for (_i = 0, allPossibleRegex_1 = allPossibleRegex; _i < allPossibleRegex_1.length; _i++) {
                regex = allPossibleRegex_1[_i];
                if (regex.test(title)) {
                    core.info("Title Passed");
                    return [2 /*return*/];
                }
            }
            core.debug("Regex ".concat(allPossibleRegex, " failed with title ").concat(title));
            core.info("Title Failed");
            core.setFailed("PullRequest title does not start with any Jira Issue key.");
            return [2 /*return*/];
            // eslint-disable-next-line  @typescript-eslint/no-explicit-any
        }
        catch (error) {
            core.setFailed(error.message);
        }
        return [2 /*return*/];
    });
}); };
exports.run = run;
var getRegex = function () {
    var projectKeyInput = core.getInput("projectKey", { required: false });
    var projectKeysInput = core.getMultilineInput("projectKeys", { required: false });
    var separator = core.getInput("separator", { required: false });
    var keyAnywhereInTitle = core.getBooleanInput("keyAnywhereInTitle", {
        required: false,
    });
    core.debug("Project Key ".concat(projectKeyInput));
    core.debug("Project Keys ".concat(projectKeysInput));
    core.debug("Separator ".concat(separator));
    core.debug("Key Anywhere In Title ".concat(keyAnywhereInTitle));
    if (stringIsNullOrWhitespace(projectKeyInput) && projectKeysInput.length < 1)
        return [getDefaultJiraIssueRegex()];
    // If projectKeys input is not provided this will be an empty array
    var projectKeys = projectKeysInput.map(function (projectKey) { return projectKey
        .replaceAll(/'/g, ""); });
    if (!stringIsNullOrWhitespace(projectKeyInput)) {
        projectKeys.push(projectKeyInput);
    }
    projectKeys.forEach(function (projectKey) {
        if (!isValidProjectKey(projectKey)) {
            var message = "ProjectKey ".concat(projectKey, " is not valid");
            core.setFailed(message);
            throw new Error(message);
        }
    });
    var allPossibleRegex = [];
    if (stringIsNullOrWhitespace(separator)) {
        projectKeys.forEach(function (projectKey) {
            allPossibleRegex.push(getRegexWithProjectKey(projectKey, keyAnywhereInTitle));
        });
        return allPossibleRegex;
    }
    projectKeys.forEach(function (projectKey) {
        allPossibleRegex.push(getRegexWithProjectKeyAndSeparator(projectKey, separator, keyAnywhereInTitle));
    });
    return allPossibleRegex;
};
exports.getRegex = getRegex;
var getPullRequestTitle = function () {
    var pull_request = github.context.payload.pull_request;
    core.debug("Pull Request: ".concat(JSON.stringify(github.context.payload.pull_request)));
    if (pull_request == undefined || pull_request.title == undefined) {
        var message = "This action should only be run with Pull Request Events";
        core.setFailed(message);
        throw new Error(message);
    }
    return pull_request.title;
};
exports.getPullRequestTitle = getPullRequestTitle;
var getDefaultJiraIssueRegex = function () {
    return new RegExp("(?<=^|[a-z]-|[\\s\\p{Punct}&[^\\-]])([A-Z][A-Z0-9_]*-\\d+)(?![^\\W_])(\\s)+(.)+");
};
var isValidProjectKey = function (projectKey) {
    return /(?<=^|[a-z]-|[\s\p{Punct}&[^-]])([A-Z][A-Z0-9_]*)/.test(projectKey);
};
var getRegexWithProjectKeyAndKeyAnywhereInTitle = function (projectKey, keyAnywhereInTitle) {
    return "".concat(keyAnywhereInTitle ? "(.)*" : "", "(").concat(keyAnywhereInTitle ? "" : "^").concat(projectKey, "-){1}");
};
var getRegexWithProjectKey = function (projectKey, keyAnywhereInTitle) {
    return new RegExp("".concat(getRegexWithProjectKeyAndKeyAnywhereInTitle(projectKey, keyAnywhereInTitle), "(\\d)+(\\s)+(.)+"));
};
var getRegexWithProjectKeyAndSeparator = function (projectKey, separator, keyAnywhereInTitle) {
    return new RegExp("".concat(getRegexWithProjectKeyAndKeyAnywhereInTitle(projectKey, keyAnywhereInTitle), "(\\d)+(").concat(separator, ")+(\\S)+(.)+"));
};
var stringIsNullOrWhitespace = function (str) {
    return str == null || str.trim() === "";
};
