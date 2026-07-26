---
name: pr-description
description: Generate a pull request description for this repo. Use when the user asks to "create a PR description", "write the PR", "generate PR description", "prep this branch for a PR", or similar. Diffs the current branch against main, refreshes README.md if the diff changed user-facing behavior, writes a description into docs/pr/, asks whether the app version needs bumping, and — only if a bump is approved — writes a short release-notes changelog into docs/pr/.
version: 1.0.0
---

# PR description generator — Yahtzee mobile

Produce a consistent, ready-to-paste PR description for the current branch, comparing against `main`.

## Procedure

1. **Analyze the diff.**
   - `git status`, `git log main..HEAD --oneline`, `git diff main...HEAD --stat`, and `git diff main...HEAD` for full detail.
   - If the current branch IS `main` or there is no diff vs `main`, say so and stop — don't fabricate a description.

2. **Update `README.md` if the diff warrants it.**
   - Only touch `README.md` if the diff changes something the README documents or should document: new/changed features (`## Features`), new npm scripts or commands, new dependencies or tech-stack entries (`## Tech Stack`), new/changed languages, or new setup steps.
   - Do NOT touch README for internal refactors, bug fixes with no user-facing effect, or test-only changes.
   - Keep edits minimal and matching the existing README's tone/structure — don't restructure sections that don't need it.
   - If no README update is needed, say so explicitly and move on.

3. **Prepare `docs/pr/`.**
   - The folder and its `.gitignore` entry already exist — don't check for or create either.
   - This folder is regenerated every run: remove any existing files inside it before writing the new one (the folder is disposable output, not history — don't accumulate old PR descriptions).

4. **Generate the description** using the template below and save it to `docs/pr/PR_DESCRIPTION.md`. Every PR description produced by this skill must follow this exact structure so PRs stay consistent over time:

   ```markdown
   # <Concise PR title, imperative mood, under ~70 chars>

   ## Summary
   - <1-3 bullets: what changed and why, focused on intent not mechanics>

   ## Changes
   - <bullet per notable change, grouped by file/area if the diff spans several>

   ## Testing
   - [ ] `node node_modules/typescript/bin/tsc --noEmit` passes
   - [ ] `npm test` passes
   - [ ] Manually verified on device/emulator: <what was checked, or "not yet — needs manual pass">

   ## Version
   - <"Bumped X.Y.Z → A.B.C" or "No version change">

   ## Notes
   - <anything reviewers should know: follow-ups, known gaps, out-of-scope items — omit section if empty>
   ```

   Base the Summary/Changes bullets on the actual diff and commit messages — don't invent scope. If the diff touches scoring, i18n, or persisted state, call that out explicitly since it affects parity with the web reference app.

5. **Ask about the version bump.** Use AskUserQuestion to ask whether `package.json`'s `version` needs updating for this PR (current version is whatever `package.json` has now). Offer patch/minor/major bump options plus "no change". If the user picks a bump, update `version` in `package.json` accordingly and reflect the new version in the `## Version` section of the saved description (rewrite that section after the answer, don't leave it stale).

6. **If, and only if, the user approved a version bump in step 5**, generate a short release notes file and save it to `docs/pr/RELEASE_NOTES.md`. This is a separate, terser artifact from the PR description — written for a git release/tag, not a reviewer. Skip this step entirely (don't create or touch `RELEASE_NOTES.md`) when the user chose "no change". Use this structure:

   ```markdown
   # <new version> — <short release title>

   - <short, user-facing bullet per notable change>
   - <...>
   ```

   Keep bullets short (one line each), user-facing (skip internal refactors/test-only changes unless they fixed a visible bug), and ordered by impact. Use the new version from `package.json` (post-bump) as `<version>`.

7. **Report** the final path(s) written (`docs/pr/PR_DESCRIPTION.md`, plus `docs/pr/RELEASE_NOTES.md` if step 6 ran), whether README was updated, and whether the version changed.

## Rules

- Do not commit or push anything — per `CLAUDE.md`, the user commits all changes themselves. This skill only writes files.
- Don't ask about the version bump until after the description file exists — the version question can change one section of an otherwise-finished file, not gate its creation.
- Keep the description grounded in the actual diff; no speculative "future work" beyond what `## Notes` calls out from real context.
- Do not reference AI, Claude, Claude Code, "the skill," prompts, or any AI-assisted workflow anywhere in the generated content (`PR_DESCRIPTION.md`, `RELEASE_NOTES.md`, or README edits). Write as if a human authored it directly.
