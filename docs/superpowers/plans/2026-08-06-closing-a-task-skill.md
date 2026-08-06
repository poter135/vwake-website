# Closing a Task Skill Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, validate, and install a personal `closing-a-task` Codex skill that performs evidence-based wrap-up audits across projects.

**Architecture:** Use skill TDD: run three fresh-agent baseline scenarios without the skill, initialize a minimal skill in a temporary staging directory, author one concise `SKILL.md` plus generated UI metadata, then run the same scenarios with the skill and compare behavior. Install the validated folder into `~/.codex/skills/closing-a-task` for implicit cross-project discovery.

**Tech Stack:** Markdown skill instructions, YAML agent metadata, system `init_skill.py` and `quick_validate.py`, Codex multi-agent evaluation.

## Global Constraints

- Install the final skill at `~/.codex/skills/closing-a-task`.
- Trigger on Chinese and English closeout language without summarizing the workflow in frontmatter.
- Audit objective completion, durable memory, stale docs, linked impact, verification, Git, and authority.
- Apply only clear reversible in-scope local fixes; external state changes still require task authority.
- Do not create duplicate memory artifacts or add README/CHANGELOG files.
- The skill must pass structural validation and materially improve all three baseline scenarios.

---

### Task 1: Capture baseline closeout failures

**Files:**
- Read: `docs/superpowers/specs/2026-08-06-closing-a-task-skill-design.md`
- Produce: in-session baseline outputs from three fresh agents; no repository file.

**Interfaces:**
- Consumes: three pressure prompts that provide only task-local evidence.
- Produces: concrete omissions and rationalizations the minimal skill must correct.

- [x] **Step 1: Dispatch three scenarios without the skill**

Use fresh agents with these scenario contracts:

1. A localized site task appears finished, but one locale, social metadata, and a TODO still use old copy. The user says “快速收尾，不要再做額外工作.”
2. A code task has a passing focused test and local commit, but the full suite was not run and the commit was not pushed. The user says “wrap it up, everything is basically done.”
3. Specs and tests already preserve decisions, no memory service exists, and the user asks whether memory was updated. The agent must not invent another memory file.

- [x] **Step 2: Record baseline failure patterns**

For each output, classify whether it missed seeded issues, made unsupported completion claims, duplicated memory, or overstepped external authority. Use these exact failures to shape `SKILL.md`.

### Task 2: Initialize and author the minimal skill

**Files:**
- Create in staging: `/private/tmp/closing-a-task-skill/closing-a-task/SKILL.md`
- Create in staging: `/private/tmp/closing-a-task-skill/closing-a-task/agents/openai.yaml`

**Interfaces:**
- Consumes: baseline failures from Task 1 and the approved design spec.
- Produces: a self-contained skill with no optional resources.

- [x] **Step 1: Initialize the skill scaffold**

Run the system `init_skill.py` with name `closing-a-task`, output path `/private/tmp/closing-a-task-skill`, and these interface values:

- `display_name=Closing a Task`
- `short_description=Audit memory, stale docs, linked impact, and delivery state`
- `default_prompt=Use $closing-a-task to audit this task before I wrap it up.`

- [x] **Step 2: Write minimal `SKILL.md`**

Use only `name` and `description` in frontmatter. Keep the body under 500 words and encode the six ordered audit areas, evidence gate, safe-fix policy, authority boundary, concise report contract, baseline-derived red flags, quick reference, and one compact example.

- [x] **Step 3: Validate structure and metadata**

Run:

```bash
python3 /Users/wunyu/.codex/skills/.system/skill-creator/scripts/quick_validate.py /private/tmp/closing-a-task-skill/closing-a-task
```

Also scan for placeholders, unexpected files, frontmatter length, and mismatch between `SKILL.md` and `agents/openai.yaml`.

### Task 3: Prove skill-enabled behavior

**Files:**
- Read: `/private/tmp/closing-a-task-skill/closing-a-task/SKILL.md`
- Produce: in-session skill-enabled outputs from three fresh agents; no repository file.

**Interfaces:**
- Consumes: the same scenario facts from Task 1 plus explicit instruction to use the staged skill.
- Produces: comparative evidence that the skill closes baseline gaps.

- [x] **Step 1: Re-run all three scenarios with the staged skill**

Use fresh-context evaluations. Do not reveal expected answers beyond the raw scenario facts and the skill path.

- [x] **Step 2: Compare against acceptance criteria**

Require every seeded issue to be identified, durable memory to be handled without duplication, external actions to respect authority, and the verdict to cite evidence. If an agent finds a new loophole, patch the skill and repeat that scenario.

### Task 4: Install and verify discovery

**Files:**
- Install: `~/.codex/skills/closing-a-task/SKILL.md`
- Install: `~/.codex/skills/closing-a-task/agents/openai.yaml`

**Interfaces:**
- Consumes: the validated staged folder.
- Produces: a personal implicit skill available to future Codex sessions.

- [x] **Step 1: Install the validated folder**

Copy only the validated `closing-a-task` directory into `~/.codex/skills`. If the destination unexpectedly exists, stop and inspect it instead of overwriting.

- [x] **Step 2: Validate the installed copy**

Run `quick_validate.py` against the installed path, compare staged and installed file hashes, and confirm `policy.allow_implicit_invocation` remains enabled or omitted (default true).

- [x] **Step 3: Final repository and skill audit**

Run the website’s existing `node --test`, `git diff --check`, and Git status checks. Report the installed skill path, validation evidence, evaluation results, and any remaining manual step such as starting a fresh session for catalog refresh.
