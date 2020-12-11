import * as github from "@actions/github";
import * as core from "@actions/core";
import { readFileSync } from "fs";
import { getPullRequestTitle, getRegex } from "../src";

describe("index", () => {
    describe("getPullRequestTitle", () => {
        beforeEach(() => {
            delete process.env["GITHUB_EVENT_PATH"];
        });
        it("can get the title from the context", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/valid-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            const title = getPullRequestTitle();
            expect(title).toBe("Test Title");
        });

        it("raises an exception if the event is not for a pull_request", () => {
            process.env["GITHUB_EVENT_PATH"] = __dirname + "/wrong-event-type-context.json";
            github.context.payload = JSON.parse(
                readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: 'utf8' })
            );
            expect(getPullRequestTitle).toThrowError("This action should only be run with Pull Request Events");
        })
    });

    describe("getRegex", () => {
        const name = "projectKey";
        it("gets the default when no project key is provided", () => {
            process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = "";
            const regex = getRegex();
            let defaultRegex = /(?<=^|[a-z]\-|[\s\p{Punct}&&[^\-]])([A-Z][A-Z0-9_]*-\d+)(?![^\W_])(\s)+(.)+/;
            expect(regex).toEqual(defaultRegex);
            expect(regex.test("PR-4 this is valid")).toBe(true);
        });

        it("uses a project key if it exists", () => {
            process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = "AB";
            const regex = getRegex();
            expect(regex).toEqual(new RegExp(`(^AB-){1}(\\d)+(\\s)+(.)+`));
            expect(regex.test("AB-43 stuff and things")).toBe(true);
        });

        it("throws an exception if the provided project key is not valid", () => {
            process.env[`INPUT_${name.replace(/ /g, '_').toUpperCase()}`] = "aB";
            expect(getRegex).toThrowError("Project Key  \"aB\" is invalid");
        });
    });
});