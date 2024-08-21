import * as github from "@actions/github";
import { readFileSync } from "fs";
import { getPullRequestTitle, getRegex } from "../src/main";

const projectKeyInputName = "projectKey";
const projectKeysInputName = "projectKeys";
const separatorKeyInputName = "separator";
const keyAnywhereInTitle = "keyAnywhereInTitle";

const resetEnvironmentVariables = () => {
  process.env[`INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`] =
    "";
  process.env[
    `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
  ] = "";
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
    describe("when projectKey is provided", () => {
      it("uses a project key if it exists", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        const regex = getRegex();
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(^AB-){1}(\\d)+(\\s)+(.)+`));
        expect(regex[0].test("AB-43 stuff and things")).toBe(true);
      });

      it("throws an exception if the provided project key is not valid", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "aB";
        expect(getRegex).toThrow("ProjectKey aB is not valid");
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
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(^AB-){1}(\\d)+:(\\S)+(.)+`));
        expect(regex[0].test("AB-43: stuff and things")).toBe(false);
        expect(regex[0].test("AB-123: PR Title")).toBe(false);
        expect(regex[0].test("AB-43:stuff and things")).toBe(true);
        expect(regex[0].test("AB-123:PR Title")).toBe(true);
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
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(^AB-){1}(\\d)+_(\\S)+(.)+`));
        expect(regex[0].test("AB-43_stuff and things")).toBe(true);
        expect(regex[0].test("AB-123_PR Title")).toBe(true);
      });

      it("uses a project key if it exists anywhere in the title", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regex = getRegex();
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(.)*(AB-){1}(\\d)+(\\s)+(.)+`));
        expect(regex[0].test("other words AB-43 stuff and things")).toBe(true);
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
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(.)*(AB-){1}(\\d)+:(\\S)+(.)+`));
        expect(regex[0].test("other words AB-43: stuff and things")).toBe(
          false,
        );
        expect(regex[0].test("other words AB-123: PR Title")).toBe(false);
        expect(regex[0].test("other words AB-43:stuff and things")).toBe(true);
        expect(regex[0].test("other words AB-123:PR Title")).toBe(true);
        expect(regex[0].test("AB-43:stuff and things")).toBe(true);
        expect(regex[0].test("AB-123:PR Title")).toBe(true);
      });
    });

    describe("when projectKeys are provided", () => {
      it("uses a project key if it exists in projectKeys", () => {
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        const regexes = getRegex();
        expect(regexes.length).toEqual(1);
        expect(regexes[0]).toEqual(new RegExp(`(^AB-){1}(\\d)+(\\s)+(.)+`));
        expect(regexes[0].test("AB-43 stuff and things")).toBe(true);
      });

      it("throws an exception if the provided project key is not valid", () => {
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "aB";
        expect(getRegex).toThrow("ProjectKey aB is not valid");
      });

      it("throws an exception if one of the provided project key is not valid", () => {
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB\naB\nCD";
        expect(getRegex).toThrow("ProjectKey aB is not valid");
      });

      it("uses a project key and a colon separator if they exist", () => {
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ":";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "false";
        const regexes = getRegex();
        expect(regexes.length).toEqual(1);
        const regex = regexes[0];
        expect(regex).toEqual(new RegExp(`(^AB-){1}(\\d)+:(\\S)+(.)+`));
        expect(regex.test("AB-43: stuff and things")).toBe(false);
        expect(regex.test("AB-123: PR Title")).toBe(false);
        expect(regex.test("AB-43:stuff and things")).toBe(true);
        expect(regex.test("AB-123:PR Title")).toBe(true);
      });

      it("uses a project key and an underscore separator if they exist", () => {
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "_";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "false";
        const regexes = getRegex();
        expect(regexes.length).toEqual(1);
        const regex = regexes[0];
        expect(regex).toEqual(new RegExp(`(^AB-){1}(\\d)+_(\\S)+(.)+`));
        expect(regex.test("AB-43_stuff and things")).toBe(true);
        expect(regex.test("AB-123_PR Title")).toBe(true);
      });

      it("uses a project key if it exists anywhere in the title", () => {
        const projectNames: string[] = ["AB", "CD", "EF"];
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB\nCD\nEF";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regexes = getRegex();
        expect(regexes.length).not.toEqual(1);
        regexes.forEach((regex: RegExp, index: number) => {
          expect(regex).toEqual(
            new RegExp(`(.)*(${projectNames[index]}-){1}(\\d)+(\\s)+(.)+`),
          );
          expect(
            regex.test(
              `other words ${projectNames[index]}-43 stuff and things`,
            ),
          ).toBe(true);
        });
      });

      it("uses a project key and a colon separator if they exist anywhere in the title", () => {
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ":";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regexes = getRegex();
        expect(regexes.length).toEqual(1);
        const regex = regexes[0];
        expect(regex).toEqual(new RegExp(`(.)*(AB-){1}(\\d)+:(\\S)+(.)+`));
        expect(regex.test("other words AB-43: stuff and things")).toBe(false);
        expect(regex.test("other words AB-123: PR Title")).toBe(false);
        expect(regex.test("other words AB-43:stuff and things")).toBe(true);
        expect(regex.test("other words AB-123:PR Title")).toBe(true);
        expect(regex.test("AB-43:stuff and things")).toBe(true);
        expect(regex.test("AB-123:PR Title")).toBe(true);
      });

      it("uses a project key and a colon separator if they exist", () => {
        const projectNames: string[] = ["AB", "CD", "EF", "GH"];
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB\nCD\nEF\nGH";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ":";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "false";
        const regexCollection = getRegex();
        regexCollection.forEach((regex: RegExp, index: number) => {
          expect(regex).toEqual(
            new RegExp(`(^${projectNames[index]}-){1}(\\d)+:(\\S)+(.)+`),
          );
          expect(
            regex.test(`${projectNames[index]}-43: stuff and things`),
          ).toBe(false);
          expect(regex.test(`${projectNames[index]}-123: PR Title`)).toBe(
            false,
          );
          expect(regex.test(`${projectNames[index]}-43:stuff and things`)).toBe(
            true,
          );
          expect(regex.test(`${projectNames[index]}-123:PR Title`)).toBe(true);
        });
      });

      it("uses a project key and a colon separator if they exist with single tick in string", () => {
        const projectNames: string[] = ["AB", "CD", "EF", "GH"];
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "'AB'\n'CD'\n'EF'\n'GH'";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ":";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "false";
        const regexCollection = getRegex();
        regexCollection.forEach((regex: RegExp, index: number) => {
          expect(regex).toEqual(
            new RegExp(`(^${projectNames[index]}-){1}(\\d)+:(\\S)+(.)+`),
          );
          expect(
            regex.test(`${projectNames[index]}-43: stuff and things`),
          ).toBe(false);
          expect(regex.test(`${projectNames[index]}-123: PR Title`)).toBe(
            false,
          );
          expect(regex.test(`${projectNames[index]}-43:stuff and things`)).toBe(
            true,
          );
          expect(regex.test(`${projectNames[index]}-123:PR Title`)).toBe(true);
        });
      });
    });

    describe("when projectKey and projectKeys both are provided", () => {
      it("gets the default when no project key is provided", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "";
        const regex = getRegex();
        const defaultRegex =
          // eslint-disable-next-line no-useless-escape
          /(?<=^|[a-z]-|[\s\p{P}&[^\-])([A-Z][A-Z0-9_]*-\d+)(?![^\W_])(\s)+(.)+/u;
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(defaultRegex);
        expect(regex[0].test("PR-4 this is valid")).toBe(true);
      });

      it("uses project key if it exists anywhere in the title", () => {
        const projectNames: string[] = ["AB", "CD", "EF", "GH"];
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB\nCD\nEF";
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "GH";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regexes = getRegex();
        expect(regexes.length).not.toEqual(1);
        regexes.forEach((regex: RegExp, index: number) => {
          expect(regex).toEqual(
            new RegExp(`(.)*(${projectNames[index]}-){1}(\\d)+(\\s)+(.)+`),
          );
          expect(
            regex.test(
              `other words ${projectNames[index]}-43 stuff and things`,
            ),
          ).toBe(true);
        });
      });

      it("multiple project keys are present", () => {
        const projectNames: string[] = ["AB", "CD"];
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB\n";
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "CD";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regexes = getRegex();
        expect(regexes.length).not.toEqual(1);
        regexes.forEach((regex: RegExp, index: number) => {
          expect(regex).toEqual(
            new RegExp(`(.)*(${projectNames[index]}-){1}(\\d)+(\\s)+(.)+`),
          );
          expect(
            regex.test(
              `other words ${projectNames[index]}-43 CD-43 stuff and things`,
            ),
          ).toBe(true);
          expect(
            regex.test(
              `other words CD-43 ${projectNames[index]}-43 stuff and things`,
            ),
          ).toBe(true);
        });
      });
    });

    describe("when a separator with a trailing space is provided", () => {
      beforeEach(() => resetEnvironmentVariables());

      it("uses a project key and a colon separator with a trailing space if they exist", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ": ";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "false";
        const regex = getRegex();
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(^AB-){1}(\\d)+: (\\S)+(.)+`));
        expect(regex[0].test("AB-43: stuff and things")).toBe(true);
        expect(regex[0].test("AB-123: PR Title")).toBe(true);
        expect(regex[0].test("AB-43:stuff and things")).toBe(false);
      });

      it("uses a project key and an underscore separator with a trailing space if they exist", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "_ ";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "false";
        const regex = getRegex();
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(^AB-){1}(\\d)+_ (\\S)+(.)+`));
        expect(regex[0].test("AB-43_ stuff and things")).toBe(true);
        expect(regex[0].test("AB-123_ PR Title")).toBe(true);
        expect(regex[0].test("AB-43_stuff and things")).toBe(false);
      });

      it("uses a project key and a colon separator with a trailing space if they exist anywhere in the title", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ": ";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regex = getRegex();
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(.)*(AB-){1}(\\d)+: (\\S)+(.)+`));
        expect(regex[0].test("other words AB-43: stuff and things")).toBe(true);
        expect(regex[0].test("other words AB-123: PR Title")).toBe(true);
        expect(regex[0].test("other words AB-43:stuff and things")).toBe(false);
      });

      it("uses a project key and an underscore separator with a trailing space if they exist anywhere in the title", () => {
        process.env[
          `INPUT_${projectKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "_ ";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regex = getRegex();
        expect(regex.length).toEqual(1);
        expect(regex[0]).toEqual(new RegExp(`(.)*(AB-){1}(\\d)+_ (\\S)+(.)+`));
        expect(regex[0].test("other words AB-43_ stuff and things")).toBe(true);
        expect(regex[0].test("other words AB-123_ PR Title")).toBe(true);
        expect(regex[0].test("other words AB-43_stuff and things")).toBe(false);
      });

      it("uses a project key with multiple keys and a separator with a trailing space", () => {
        const projectNames: string[] = ["AB", "CD", "EF", "GH"];
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB\nCD\nEF\nGH";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ": ";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "false";
        const regexCollection = getRegex();
        regexCollection.forEach((regex: RegExp, index: number) => {
          expect(regex).toEqual(
            new RegExp(`(^${projectNames[index]}-){1}(\\d)+: (\\S)+(.)+`),
          );
          expect(
            regex.test(`${projectNames[index]}-43: stuff and things`),
          ).toBe(true);
          expect(regex.test(`${projectNames[index]}-123: PR Title`)).toBe(true);
          expect(regex.test(`${projectNames[index]}-43:stuff and things`)).toBe(
            false,
          );
        });
      });

      it("uses a project key with multiple keys and a separator with a trailing space anywhere in the title", () => {
        const projectNames: string[] = ["AB", "CD", "EF"];
        process.env[
          `INPUT_${projectKeysInputName.replace(/ /g, "_").toUpperCase()}`
        ] = "AB\nCD\nEF";
        process.env[
          `INPUT_${separatorKeyInputName.replace(/ /g, "_").toUpperCase()}`
        ] = ": ";
        process.env[
          `INPUT_${keyAnywhereInTitle.replace(/ /g, "_").toUpperCase()}`
        ] = "true";
        const regexCollection = getRegex();
        regexCollection.forEach((regex: RegExp, index: number) => {
          expect(regex).toEqual(
            new RegExp(`(.)*(${projectNames[index]}-){1}(\\d)+: (\\S)+(.)+`),
          );
          expect(
            regex.test(
              `other words ${projectNames[index]}-43: stuff and things`,
            ),
          ).toBe(true);
          expect(
            regex.test(
              `other words ${projectNames[index]}-43:stuff and things`,
            ),
          ).toBe(false);
        });
      });
    });
  });
});
