import * as core from "@actions/core";
import * as github from "@actions/github";
import { EventPayloads } from "@octokit/webhooks";

async function run() {
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
  } catch (error: any) {
    core.setFailed(error.message);
  }
}

export function getRegex() {
  const commitMessageSeparator = core.getInput("commitMessageSeparator", {
    required: false,
  });
  const projectKey = core.getInput("projectKey", { required: false });
  let regex = isValidInput(commitMessageSeparator)
    ? new RegExp(
        "(?<=^|[a-z]\\-|[sp{Punct}&&[^-]])([A-Z][A-Z0-9_]*-\\d+)(?![^\\W_])(" +
          commitMessageSeparator +
          ")+(.)+",
        ""
      )
    : /(?<=^|[a-z]\-|[\s\p{Punct}&&[^\-]])([A-Z][A-Z0-9_]*-\d+)(?![^\W_])(\s)+(.)+/;
  if (isValidInput(projectKey)) {
    core.debug(`Project Key ${projectKey}`);
    if (
      !/(?<=^|[a-z]\-|[\s\p{Punct}&&[^\-]])([A-Z][A-Z0-9_]*)/.test(projectKey)
    ) {
      throw new Error(`Project Key "${projectKey}" is invalid`);
    }
    regex = isValidInput(commitMessageSeparator)
      ? new RegExp(
          "(^" +
            projectKey +
            "-){1}(\\d)+(" +
            commitMessageSeparator +
            ")+(.)+",
          ""
        )
      : new RegExp("(^" + projectKey + "-){1}(\\d)+(\\s)+(.)+");
  }
  return regex;
}

export function isValidInput(input: string) {
  if (input && input !== "") {
    return true;
  }
  return false;
}

export function getPullRequestTitle() {
  let pull_request = github.context.payload.pull_request;
  core.debug(
    `Pull Request: ${JSON.stringify(github.context.payload.pull_request)}`
  );
  if (pull_request == undefined || pull_request.title == undefined) {
    throw new Error("This action should only be run with Pull Request Events");
  }
  return pull_request.title;
}

run();
