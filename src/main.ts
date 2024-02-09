import * as core from "@actions/core";
import * as github from "@actions/github";

export const run = async () => {
  try {
    core.debug("Starting PR Title check for Jira Issue Key");
    const title = getPullRequestTitle();
    const regex = getRegex();

    core.debug(title);
    core.debug(regex.toString());

    if (!regex.test(title)) {
      core.debug(`Regex ${regex} failed with title ${title}`);
      core.info("Title Failed");
      core.setFailed("PullRequest title does not start with a Jira Issue key.");
      return;
    }
    core.info("Title Passed");
    // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  } catch (error: any) {
    core.setFailed(error.message);
  }
};
export const getRegex = () => {
  let projectKeys = core.getInput("projectKeys", { required: false });
  if (!Array.isArray(projectKeys)) projectKeys = [];
  const projectKey = core.getInput("projectKey", { required: false });
  if (!projectKey || projectKey === "") projectKeys.push(projectKey);
  
  const separator = core.getInput("separator", { required: false });
  const keyAnywhereInTitle = core.getBooleanInput("keyAnywhereInTitle", {
    required: false,
  });

  core.debug(`Project Keys ${projectKeys}`);
  core.debug(`Separator ${separator}`);
  core.debug(`Key Anywhere In Title ${keyAnywhereInTitle}`);

  if (projectKeys.length == 0) return getDefaultJiraIssueRegex();

  projectKeys.array.forEach(key => {
    if (!isValidProjectKey(key)) throw new Error(`Project Key "${key}" is invalid`);
  });

  if (!separator || separator === "")
    return getRegexWithProjectKeys(projectKey, keyAnywhereInTitle);

  return getRegexWithProjectKeysAndSeparator(
    projectKey,
    separator,
    keyAnywhereInTitle,
  );
};
export const getPullRequestTitle = () => {
  const pull_request = github.context.payload.pull_request;
  core.debug(
    `Pull Request: ${JSON.stringify(github.context.payload.pull_request)}`,
  );
  if (pull_request == undefined || pull_request.title == undefined) {
    throw new Error("This action should only be run with Pull Request Events");
  }
  return pull_request.title;
};
const getDefaultJiraIssueRegex = () =>
  new RegExp(
    "(?<=^|[a-z]-|[\\s\\p{Punct}&[^\\-]])([A-Z][A-Z0-9_]*-\\d+)(?![^\\W_])(\\s)+(.)+",
  );
const isValidProjectKey = (projectKey: string) =>
  /(?<=^|[a-z]-|[\s\p{Punct}&[^-]])([A-Z][A-Z0-9_]*)/.test(projectKey);
const getRegexWithProjectKeysAndKeyAnywhereInTitle = (
  projectKeys: string[],
  keyAnywhereInTitle: boolean,
) => {
  const projectKeysPattern = projectKeys.join('|'); 
  return `${keyAnywhereInTitle ? "(.)*" : ""}(${
    keyAnywhereInTitle ? "" : "^"
  }${projectKeysPattern}-){1}`;
};
const getRegexWithProjectKeys = (
  projectKey: string,
  keyAnywhereInTitle: boolean,
) =>
  new RegExp(
    `${getRegexWithProjectKeysAndKeyAnywhereInTitle(
      projectKey,
      keyAnywhereInTitle,
    )}(\\d)+(\\s)+(.)+`,
  );
const getRegexWithProjectKeysAndSeparator = (
  projectKey: string,
  separator: string,
  keyAnywhereInTitle: boolean,
) =>
  new RegExp(
    `${getRegexWithProjectKeysAndKeyAnywhereInTitle(
      projectKey,
      keyAnywhereInTitle,
    )}(\\d)+(${separator})+(\\S)+(.)+`,
  );
