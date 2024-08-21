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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestTitle = exports.getRegex = exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const lodash_escaperegexp_1 = __importDefault(require("lodash.escaperegexp"));
const run = async () => {
    try {
        core.debug("Starting PR Title check for Jira Issue Key");
        const title = (0, exports.getPullRequestTitle)();
        const allPossibleRegex = (0, exports.getRegex)();
        core.debug(title);
        core.debug(allPossibleRegex.toString());
        for (const regex of allPossibleRegex) {
            if (regex.test(title)) {
                core.info("Title Passed");
                return;
            }
        }
        core.debug(`Regex ${allPossibleRegex} failed with title ${title}`);
        core.info("Title Failed");
        core.setFailed("PullRequest title does not start with any Jira Issue key.");
        return;
        // eslint-disable-next-line  @typescript-eslint/no-explicit-any
    }
    catch (error) {
        core.setFailed(error.message);
    }
};
exports.run = run;
const getRegex = () => {
    const projectKeyInput = core.getInput("projectKey", { required: false });
    const projectKeysInput = core.getMultilineInput("projectKeys", {
        required: false,
    });
    const separator = core.getInput("separator", {
        required: false,
        trimWhitespace: false,
    });
    const keyAnywhereInTitle = core.getBooleanInput("keyAnywhereInTitle", {
        required: false,
    });
    core.debug(`Project Key ${projectKeyInput}`);
    core.debug(`Project Keys ${projectKeysInput}`);
    core.debug(`Separator "${separator}"`);
    core.debug(`Key Anywhere In Title ${keyAnywhereInTitle}`);
    if (stringIsNullOrWhitespace(projectKeyInput) && projectKeysInput.length < 1)
        return [getDefaultJiraIssueRegex()];
    // If projectKeys input is not provided this will be an empty array
    const projectKeys = projectKeysInput.map((projectKey) => projectKey.replaceAll(/'/g, ""));
    if (!stringIsNullOrWhitespace(projectKeyInput)) {
        projectKeys.push(projectKeyInput);
    }
    const escapedProjectKeys = projectKeys.map((projectKey) => (0, lodash_escaperegexp_1.default)(projectKey));
    escapedProjectKeys.forEach((projectKey) => {
        if (!isValidProjectKey(projectKey)) {
            const message = `ProjectKey ${projectKey} is not valid`;
            throw new Error(message);
        }
    });
    const allPossibleRegex = [];
    if (stringIsNullOrWhitespace(separator)) {
        escapedProjectKeys.forEach((projectKey) => {
            allPossibleRegex.push(getRegexWithProjectKey(projectKey, keyAnywhereInTitle));
        });
        return allPossibleRegex;
    }
    const escapedSeparator = (0, lodash_escaperegexp_1.default)(separator);
    escapedProjectKeys.forEach((projectKey) => {
        allPossibleRegex.push(getRegexWithProjectKeyAndSeparator(projectKey, escapedSeparator, keyAnywhereInTitle));
    });
    return allPossibleRegex;
};
exports.getRegex = getRegex;
const getPullRequestTitle = () => {
    const pull_request = github.context.payload.pull_request;
    core.debug(`Pull Request: ${JSON.stringify(github.context.payload.pull_request)}`);
    if (pull_request == undefined || pull_request.title == undefined) {
        const message = "This action should only be run with Pull Request Events";
        throw new Error(message);
    }
    return pull_request.title;
};
exports.getPullRequestTitle = getPullRequestTitle;
const getDefaultJiraIssueRegex = () => new RegExp("(?<=^|[a-z]-|[\\s\\p{P}&[^\\-])([A-Z][A-Z0-9_]*-\\d+)(?![^\\W_])(\\s)+(.)+", "u");
const isValidProjectKey = (projectKey) => /(?<=^|[a-z]-|[\s\p{P}&[^-])([A-Z][A-Z0-9_]*)/u.test(projectKey);
const getRegexWithProjectKeyAndKeyAnywhereInTitle = (projectKey, keyAnywhereInTitle) => `${keyAnywhereInTitle ? "(.)*" : ""}(${keyAnywhereInTitle ? "" : "^"}${projectKey}-){1}`;
const getRegexWithProjectKey = (projectKey, keyAnywhereInTitle) => new RegExp(`${getRegexWithProjectKeyAndKeyAnywhereInTitle(projectKey, keyAnywhereInTitle)}(\\d)+(\\s)+(.)+`);
const getRegexWithProjectKeyAndSeparator = (projectKey, separator, keyAnywhereInTitle) => new RegExp(`${getRegexWithProjectKeyAndKeyAnywhereInTitle(projectKey, keyAnywhereInTitle)}(\\d)+${separator}(\\S)+(.)+`);
const stringIsNullOrWhitespace = (str) => str == null || str.trim() === "";
//# sourceMappingURL=main.js.map