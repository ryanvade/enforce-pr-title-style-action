import * as core from "@actions/core";
import * as github from "@actions/github";
import { EventPayloads } from "@octokit/webhooks";

async function run() {
    try {
        core.debug("Starting PR Title check for Jira Issue Key");
        console.log(JSON.stringify(github.context));
        core.debug(JSON.stringify(github.context));
        const title = getPullRequestTitle();
        const regex = getRegex();

        if (!regex.test(title)) {
            core.debug(`Regex ${regex} failed with title ${title}`);
            core.info("Title Failed");
            core.setFailed("PullRequest title does not start with a Jira Issue key.");
            return;
        }
        core.info("Title Passed");

    } catch (error) {
        core.setFailed(error.message);
    }
}

export function getRegex() {
    let regex = /(?<=^|[a-z]\-|[\s\p{Punct}&&[^\-]])([A-Z][A-Z0-9_]*-\d+)(?![^\W_])(\s)+(.)+/;
    const projectKey = core.getInput("projectKey", { required: false });
    if (projectKey && projectKey !== "") {
        core.debug(`Project Key ${projectKey}`);
        if (!/(?<=^|[a-z]\-|[\s\p{Punct}&&[^\-]])([A-Z][A-Z0-9_]*)/.test(projectKey)) {
            throw new Error(`Project Key  "${projectKey}" is invalid`)
        }
        regex = new RegExp(`(^${projectKey}-){1}(\\d)+(\\s)+(.)+`);
    }
    return regex;
}

export function getPullRequestTitle() {
    core.debug(`Context: ${JSON.stringify(github.context)}`);
    let pull_request = github.context.payload.pull_request;
    core.debug(`Pull Request: ${JSON.stringify(github.context.payload.pull_request)}`);
    if (!pull_request || !pull_request.body) {
        throw new Error("This action should only be run with Pull Request Events");
    }
    core.debug(`Pull Request Body: ${pull_request.body}`);
    let body: EventPayloads.WebhookPayloadPullRequestPullRequest = JSON.parse(pull_request.body);
    return body.title;
}

run()