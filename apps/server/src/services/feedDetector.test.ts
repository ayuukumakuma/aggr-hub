import { describe, expect, test } from "vite-plus/test";
import { tryGitHubReleasesAtomUrl } from "./feedDetector.js";

describe("tryGitHubReleasesAtomUrl", () => {
  test("converts /releases URL to .atom", () => {
    expect(tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/releases")).toBe(
      "https://github.com/anthropics/claude-code/releases.atom",
    );
  });

  test("converts /releases/ with trailing slash", () => {
    expect(tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/releases/")).toBe(
      "https://github.com/anthropics/claude-code/releases.atom",
    );
  });

  test("converts /releases/tag/v1.0.0 URL", () => {
    expect(
      tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/releases/tag/v1.0.0"),
    ).toBe("https://github.com/anthropics/claude-code/releases.atom");
  });

  test("converts /releases/latest URL", () => {
    expect(
      tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/releases/latest"),
    ).toBe("https://github.com/anthropics/claude-code/releases.atom");
  });

  test("converts repository root URL", () => {
    expect(tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code")).toBe(
      "https://github.com/anthropics/claude-code/releases.atom",
    );
  });

  test("converts repository root URL with trailing slash", () => {
    expect(tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/")).toBe(
      "https://github.com/anthropics/claude-code/releases.atom",
    );
  });

  test("converts .git suffix URL", () => {
    expect(tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code.git")).toBe(
      "https://github.com/anthropics/claude-code/releases.atom",
    );
  });

  test("returns null for non-GitHub URLs", () => {
    expect(tryGitHubReleasesAtomUrl("https://example.com/feed.xml")).toBeNull();
  });

  test("returns null for GitHub non-repo URLs", () => {
    expect(tryGitHubReleasesAtomUrl("https://github.com/anthropics")).toBeNull();
  });

  test("returns null for GitHub blob URLs", () => {
    expect(
      tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md"),
    ).toBeNull();
  });

  test("returns null for GitHub issues URLs", () => {
    expect(tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/issues")).toBeNull();
  });

  test("returns null for GitHub pull requests URLs", () => {
    expect(
      tryGitHubReleasesAtomUrl("https://github.com/anthropics/claude-code/pull/123"),
    ).toBeNull();
  });
});
