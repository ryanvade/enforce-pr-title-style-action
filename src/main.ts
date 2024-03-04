import * as core from "@actions/core";
import * as github from "@actions/github";

export const run = async () => {
  try {
    core.debug("Starting PR Title check for Jira Issue Key");
    const title = getPullRequestTitle();
    const allPossibleRegex = getRegex();

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
  } catch (error: any) {
    core.setFailed(error.message);
  }
};
export const getRegex = (): RegExp[] => {
  const projectKeyInput = core.getInput("projectKey", { required: false });
  let projectKeysInput = core.getInput("projectKeys", { required: false });
  const separator = core.getInput("separator", { required: false });
  const keyAnywhereInTitle = core.getBooleanInput("keyAnywhereInTitle", {
    required: false,
  });

  core.debug(`Project Key ${projectKeyInput}`);
  core.debug(`Project Keys ${projectKeysInput}`);
  core.debug(`Separator ${separator}`);
  core.debug(`Key Anywhere In Title ${keyAnywhereInTitle}`);

  if ((!projectKeysInput || projectKeysInput === "") && (!projectKeyInput || projectKeyInput === "")) return [getDefaultJiraIssueRegex()];

  const projectKeys: string[] = [];
  // if there is any input in projectKeys.
  // input separated by multiple lines: split and consume.
  projectKeysInput = projectKeysInput.trim(); // remove extra spaces.
  if (projectKeysInput.length > 0) {
    projectKeysInput.split('\n').forEach((project: string) => {
      projectKeys.push(project.trim());
    });
  }
  if (projectKeyInput) {
    projectKeys.push(projectKeyInput);
  }

  projectKeys.forEach((projectName: string) => {
    if (!isValidProjectKey(projectName))
      throw new Error(`Project Key  "${projectName}" is invalid`);
  });

  const allPossibleRegex: RegExp[] = [];

  if (!separator || separator === "") {
    projectKeys.forEach((projectName: string) => {
      allPossibleRegex.push(getRegexWithProjectKey(projectName, keyAnywhereInTitle));
    });
    return allPossibleRegex;
  }

  projectKeys.forEach((projectName: string) => {
    allPossibleRegex.push(getRegexWithProjectKeyAndSeparator(
      projectName,
      separator,
      keyAnywhereInTitle,
    ));
  });
  return allPossibleRegex;
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
const getRegexWithProjectKeyAndKeyAnywhereInTitle = (
  projectKey: string,
  keyAnywhereInTitle: boolean,
) =>
  `${keyAnywhereInTitle ? "(.)*" : ""}(${
    keyAnywhereInTitle ? "" : "^"
  }${projectKey}-){1}`;
const getRegexWithProjectKey = (
  projectKey: string,
  keyAnywhereInTitle: boolean,
) =>
  new RegExp(
    `${getRegexWithProjectKeyAndKeyAnywhereInTitle(
      projectKey,
      keyAnywhereInTitle,
    )}(\\d)+(\\s)+(.)+`,
  );
const getRegexWithProjectKeyAndSeparator = (
  projectKey: string,
  separator: string,
  keyAnywhereInTitle: boolean,
) =>
  new RegExp(
    `${getRegexWithProjectKeyAndKeyAnywhereInTitle(
      projectKey,
      keyAnywhereInTitle,
    )}(\\d)+(${separator})+(\\S)+(.)+`,
  );
