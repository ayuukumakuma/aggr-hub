import { diffLines } from "diff";

export function computeDiffHtml(oldText: string, newText: string): string {
  const changes = diffLines(oldText, newText);

  const parts = changes.map((change) => {
    const lines = change.value.replace(/\n$/, "");
    if (change.added) {
      return `<div class="diff-added">${escapeHtml(lines)}</div>`;
    }
    if (change.removed) {
      return `<div class="diff-removed">${escapeHtml(lines)}</div>`;
    }
    return `<div class="diff-unchanged">${escapeHtml(lines)}</div>`;
  });

  return parts.join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
