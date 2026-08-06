# Closing a Task Skill Design

## Goal

Create a personal Codex skill that triggers when the user asks to wrap up, close out, perform a completion audit, or check whether a task is truly done. The skill must turn vague “收尾” requests into an evidence-based audit without silently expanding authority or competing with delivery workflows.

## Installation and discovery

- Skill name and folder: `closing-a-task`.
- Install under `~/.codex/skills/closing-a-task` so it is available across projects.
- Include `SKILL.md` and `agents/openai.yaml`; add no README or auxiliary documentation.
- The description must cover Chinese and English completion-audit vocabulary, including: `收尾`, `結案`, `wrap up`, `completion audit`, `memory`, `stale docs`, `過期文件`, `聯動檔案`, and `有沒有漏掉`.
- Bare `finish` and `handoff` are intentionally excluded because they overlap branch-integration and delivery skills.
- When a request explicitly asks to push, create a PR, merge, publish, deploy, or integrate completed work, the matching delivery skill owns the workflow. Run this audit first only when the user also requests a completion audit.

## Audit contract

When triggered, perform these six audit areas in order.

### 1. Objective completion

- Reconstruct explicit requirements from the request, referenced specs/plans/issues, and current repository state.
- Map each requirement to authoritative evidence such as files, tests, rendered output, deployment state, or remote Git state.
- Treat missing or indirect evidence as incomplete.

### 2. Durable project memory

- Discover the project’s existing authority: `AGENTS.md`, instructions, decisions, specs, learnings, ADRs, or a configured memory system.
- Update the existing canonical source when a reusable decision is missing.
- Do not create duplicate “memory” documents when specs, tests, or existing decision records already preserve the decision.
- State explicitly when no persistent memory system exists and what artifact provides durable memory instead.

### 3. Stale documentation

- Search changed names, numbers, paths, commands, screenshots, metadata, and completed tasks across documentation.
- Check unchecked plan steps that are demonstrably complete, obsolete TODOs, dead references, and documentation that contradicts shipped behavior.
- Distinguish intentional out-of-scope copy from genuinely stale documentation.

### 4. Linked impact

Inspect only relevant project surfaces, including:

- localized or duplicated variants;
- tests, fixtures, snapshots, and generated artifacts;
- SEO/social metadata, manifests, configuration, schemas, and assets;
- user docs, release notes, changelogs, TODOs, and operational runbooks;
- deployment, monitoring, migration, or cleanup obligations introduced by the change.

Use repository search and changed-file evidence to decide which surfaces apply; do not run a generic mutation sweep disconnected from the task.

### 5. Verification and Git

- Run the fullest proportionate test/build/lint/typecheck suite supported by the repository.
- Run whitespace/diff checks and inspect worktree state.
- If the task includes commit or push, verify exact local and remote commit identity after success.
- Re-run verification after any automatic fix.

### 6. Closeout report

Report, in this order:

1. completion verdict;
2. safe fixes applied;
3. memory status and canonical artifact;
4. stale or linked items found;
5. remaining manual actions or missing authority;
6. verification evidence and Git state.

Keep the report concise when nothing is wrong; expand only for findings or blockers.

## Mutation and authority boundary

- Automatically apply clear, reversible, in-scope local fixes, especially documentation consistency and completed-plan status.
- Do not create speculative memory files, perform unrelated refactors, or broaden the product scope.
- Commit, push, deploy, publish, delete, message, or change external state only when the original task or a later user instruction authorizes that exact class of action.
- If external approval is missing, complete all safe local work and ask for the narrow authorization required.

## Failure handling

- Do not call a task complete when required evidence is absent.
- Separate a genuine blocker from a manual follow-up that does not prevent delivery.
- If verification fails, diagnose within scope; do not hide or downgrade the failure.
- Preserve user changes and avoid destructive cleanup.

## Validation strategy

Use skill TDD with fresh subagents because this is a discipline-enforcing workflow.

### Baseline scenarios without the skill

Run at least three scenarios that combine pressure to stop quickly with incomplete evidence:

1. A localized website change where one locale, SEO metadata, and a TODO remain stale.
2. A code change with passing focused tests but missing full-suite verification and an unpushed commit.
3. A project with specs/tests as durable memory but no memory service, tempting the agent to create a redundant memory file.

Record omissions and rationalizations from baseline responses.

### Skill-enabled scenarios

Run the same scenarios with `closing-a-task`. Success requires the agent to:

- identify every seeded issue;
- avoid inventing duplicate memory;
- distinguish safe local fixes from external actions;
- request narrow authority where required;
- provide evidence rather than a generic completion claim.

Validate structure with the system skill validator and confirm `agents/openai.yaml` matches the final skill.

## Acceptance criteria

- The skill auto-discovers from the personal Codex skills directory.
- Chinese and English closeout requests reliably trigger it.
- Baseline failures are materially improved in skill-enabled tests.
- The workflow covers memory, stale docs, linked impact, verification, Git, and authority.
- The installed skill contains no placeholders and passes structural validation.
