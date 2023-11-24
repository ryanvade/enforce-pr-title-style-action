import * as github from "@actions/github";
import { readFileSync } from "fs";
import { getPullRequestTitle, getRegex } from "../src";

const projectKeyInputName = "projectKey";
const separatorKeyInputName = "separator";
const keyAnywhereInTitle = "keyAnywhereInTitle";

const resetEnvironmentVariables = () => {
  process.env[`INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`] =
    "";
  process.env[
    `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
  ] = "";
  process.env[`INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`] =
    "false";
};

resetEnvironmentVariables();

describe("index", () => {
  describe("getPullRequestTitle", () => {
    beforeEach(() => {
      delete process.env["GITHUB_EVENT_PATH"];
      resetEnvironmentVariables();
    });
    it("can get the title from the context", () => {
      process.env["GITHUB_EVENT_PATH"] = __dirname + "/valid-context.json";
      github.context.payload = JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }),
      );
      const title = getPullRequestTitle();
      expect(title).toBe("Test Title");
    });

    it("raises an exception if the event is not for a pull_request", () => {
      process.env["GITHUB_EVENT_PATH"] =
        __dirname + "/wrong-event-type-context.json";
      github.context.payload = JSON.parse(
        readFileSync(process.env.GITHUB_EVENT_PATH, { encoding: "utf8" }),
      );
      expect(getPullRequestTitle).toThrow(
        "This action should only be run with Pull Request Events",
      );
    });
  });

  describe("getRegex", () => {
    beforeEach(() => resetEnvironmentVariables());
    it("gets the default when no project key is provided", () => {
      process.env[
        `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "";
      const regex = getRegex();
      const defaultRegex =
        /(?<=^|[a-z]-|[\s\p{Punct}&[^-]])([A-Z][A-Z0-9_]*-\d+)(?![^\W_])(\s)+(.)+/;
      expect(regex).toEqual(defaultRegex);
      expect(regex.test("PR-4 this is valid")).toBe(true);
    });

    it("uses a project key if it exists", () => {
      process.env[
        `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "AB";
      const regex = getRegex();
      expect(regex).toEqual(new RegExp(`(^AB-){1}(\\d)+(\\s)+(.)+`));
      expect(regex.test("AB-43 stuff and things")).toBe(true);
    });

    it("throws an exception if the provided project key is not valid", () => {
      process.env[
        `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "aB";
      expect(getRegex).toThrow('Project Key  "aB" is invalid');
    });

    it("uses a project key and a colon separator if they exist", () => {
      process.env[
        `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "AB";
      process.env[
        `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = ":";
      process.env[
        `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
      ] = "false";
      const regex = getRegex();
      expect(regex).toEqual(new RegExp(`(^AB-){1}(\\d)+(:)+(\\S)+(.)+`));
      expect(regex.test("AB-43: stuff and things")).toBe(false);
      expect(regex.test("AB-123: PR Title")).toBe(false);
      expect(regex.test("AB-43:stuff and things")).toBe(true);
      expect(regex.test("AB-123:PR Title")).toBe(true);
    });

    it("uses a project key and an underscore separator if they exist", () => {
      process.env[
        `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "AB";
      process.env[
        `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "_";
      process.env[
        `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
      ] = "false";
      const regex = getRegex();
      expect(regex).toEqual(new RegExp(`(^AB-){1}(\\d)+(_)+(\\S)+(.)+`));
      expect(regex.test("AB-43_stuff and things")).toBe(true);
      expect(regex.test("AB-123_PR Title")).toBe(true);
    });

    it("uses a project key if it exists anywhere in the title", () => {
      process.env[
        `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "AB";
      process.env[
        `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
      ] = "true";
      const regex = getRegex();
      expect(regex).toEqual(new RegExp(`(.)*(AB-){1}(\\d)+(\\s)+(.)+`));
      expect(regex.test("other words AB-43 stuff and things")).toBe(true);
    });

    it("uses a project key and a colon separator if they exist anywhere in the title", () => {
      process.env[
        `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = "AB";
      process.env[
        `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
      ] = ":";
      process.env[
        `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
      ] = "true";
      const regex = getRegex();
      expect(regex).toEqual(new RegExp(`(.)*(AB-){1}(\\d)+(:)+(\\S)+(.)+`));
      expect(regex.test("other words AB-43: stuff and things")).toBe(false);
      expect(regex.test("other words AB-123: PR Title")).toBe(false);
      expect(regex.test("other words AB-43:stuff and things")).toBe(true);
      expect(regex.test("other words AB-123:PR Title")).toBe(true);
      expect(regex.test("AB-43:stuff and things")).toBe(true);
      expect(regex.test("AB-123:PR Title")).toBe(true);
    });
  });
});
