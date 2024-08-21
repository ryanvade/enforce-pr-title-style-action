import * as core from "@actions/core";
import * as github from "@actions/github";
import escaperegexp from "lodash.escaperegexp";

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
  const projectKeys: string[] = projectKeysInput.map((projectKey) =>
    projectKey.replaceAll(/'/g, ""),
  );

  if (!stringIsNullOrWhitespace(projectKeyInput)) {
    projectKeys.push(projectKeyInput);
  }

  const escapedProjectKeys = projectKeys.map((projectKey) =>
    escaperegexp(projectKey),
  );

  escapedProjectKeys.forEach((projectKey: string) => {
    if (!isValidProjectKey(projectKey)) {
      const message = `ProjectKey ${projectKey} is not valid`;
      throw new Error(message);
    }
  });

  const allPossibleRegex: RegExp[] = [];

  if (stringIsNullOrWhitespace(separator)) {
    escapedProjectKeys.forEach((projectKey) => {
      allPossibleRegex.push(
        getRegexWithProjectKey(projectKey, keyAnywhereInTitle),
      );
    });
    return allPossibleRegex;
  }

  const escapedSeparator = escaperegexp(separator);

  escapedProjectKeys.forEach((projectKey) => {
    allPossibleRegex.push(
      getRegexWithProjectKeyAndSeparator(
        projectKey,
        escapedSeparator,
        keyAnywhereInTitle,
      ),
    );
  });
  return allPossibleRegex;
};

export const getPullRequestTitle = () => {
  const pull_request = github.context.payload.pull_request;
  core.debug(
    `Pull Request: ${JSON.stringify(github.context.payload.pull_request)}`,
  );
  if (pull_request == undefined || pull_request.title == undefined) {
    const message = "This action should only be run with Pull Request Events";
    throw new Error(message);
  }
  return pull_request.title;
};

const getDefaultJiraIssueRegex = () =>
  new RegExp(
    "(?<=^|[a-z]-|[\\s\\p{P}&[^\\-])([A-Z][A-Z0-9_]*-\\d+)(?![^\\W_])(\\s)+(.)+",
    "u",
  );

const isValidProjectKey = (projectKey: string) =>
  /(?<=^|[a-z]-|[\s\p{P}&[^-])([A-Z][A-Z0-9_]*)/u.test(projectKey);

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
    )}(\\d)+${separator}(\\S)+(.)+`,
  );

const stringIsNullOrWhitespace = (str: string | null | undefined) =>
  str == null || str.trim() === "";
