# Ralph Cohort — Playground Constraints

## Main Branch

The main branch is the base state of the playground. It's a mostly-complete ~20k line TypeScript/Node app with a meaningful frontend. All exercises either run directly on main or branch off from it.

### Project Constraints Imposed by Exercises

| Constraint                                                                  | Required By                                                                     | Solution                                                                                                               |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| ~20k lines, architecturally complex enough to warrant exploration           | 1.1 Codebase Exploration                                                        | Solved naturally by project size                                                                                       |
| At least one small unbuilt feature (completable in a single context window) | 1.2 Build A Feature, 1.3 Plan/Execute/Clear Loop                                | Feature A — TBD once project is chosen                                                                                 |
| Non-obvious architectural conventions an agent will naturally violate       | 2.1 Steering with AGENTS.md                                                     | Enums throughout the codebase. Agent will default to string literals or union types. AGENTS.md steers it back to enums |
| Uses at least one library with a well-known migration target                | 2.3 Skill for Writing Skills                                                    | Zod → Valibot migration                                                                                                |
| Uses external libraries with documentation                                  | 2.4 External Docs                                                               | Solved naturally — Zod, ORM, frontend framework, etc.                                                                  |
| At least one large unbuilt feature area spanning backend, frontend, and DB  | 3.2 PRDs, 3.3 Multi-Phase Plans, 3.4 Tracer Bullets, 3.5 Multi-Phase Plan Skill | Feature B — TBD once project is chosen                                                                                 |
| A design decision area with multiple valid implementation approaches        | 6.4 Design It Twice                                                             | Feature C — TBD once project is chosen                                                                                 |
| Meaningful, interactive frontend (not just CRUD forms)                      | 4.5 Playwright MCP                                                              | Project selection constraint — needs drag-and-drop, multi-step flows, interactive charts, or similar                   |
| Functions with positional parameters or similar lintable anti-patterns      | 4.6 Custom ESLint Rules                                                         | Deliberately write utility and service functions with positional args. ESLint rule transforms them to named parameters |
| Some intentionally messy/legacy-style code ripe for refactoring             | 6.5 Refactors                                                                   | A module "written early" — inconsistent error handling, repeated patterns, `any` types                                 |
| Working test suite with room to add more tests                              | 4.4 Red-Green-Refactor                                                          | Tests for core business logic but obvious gaps. Red-green-refactor branch highlights one untested module               |
| Backlog of known bugs, feature requests, and improvements in GitHub Issues  | 5.1–5.6 Ralph exercises, 6.6 Debugging Errors                                   | Pre-populated GitHub Issues. Seeded bugs in codebase on ralph-backlog branch                                           |
| Dockerizable setup (SQLite for simplicity)                                  | 6.1 Sandboxing, 6.2 Templates for Sandboxing                                    | SQLite via Drizzle or better-sqlite3. No Dockerfile on main — students add it                                          |
| Uses pnpm                                                                   | 6.2 Templates for Sandboxing                                                    | Use pnpm                                                                                                               |

### Exercises That Run Directly on Main

| Exercise                           | Notes                                                                  |
| ---------------------------------- | ---------------------------------------------------------------------- |
| 1.1 Codebase Exploration           | Just needs the codebase to exist                                       |
| 1.2 Build A Feature                | Small unbuilt feature on main                                          |
| 1.3 Plan/Execute/Clear Loop        | Same feature or a second one                                           |
| 2.1 Steering with AGENTS.md        | Main has no/minimal AGENTS.md; conventions exist but aren't documented |
| 2.3 Skill for Writing Skills       | Project-independent                                                    |
| 2.4 External Docs                  | Project-independent                                                    |
| 3.1 Concise Plans                  | Project-independent (AGENTS.md focused)                                |
| 3.2 PRDs                           | Large unbuilt feature area on main                                     |
| 3.3 Multi-Phase Plans              | Same large feature area                                                |
| 3.4 Tracer Bullets                 | Builds on 3.3                                                          |
| 3.5 Multi-Phase Plan Skill         | Builds on 3.3/3.4                                                      |
| 4.5 Playwright MCP                 | Frontend is complex enough on main                                     |
| 4.6 Custom ESLint Rules            | Anti-patterns baked into main                                          |
| 6.1 Sandboxing                     | No Docker config on main; students add it                              |
| 6.2 Templates for Sandboxing       | Builds on 6.1                                                          |
| 6.3 Preventing Destructive Git Ops | Project-independent                                                    |
| 6.4 Design It Twice                | Ambiguous design area on main                                          |
| 6.5 Refactors                      | Messy code baked into main                                             |

---

## Branches

### `exercises/progressive-disclosure`

**Exercises:** 2.2 Progressive Disclosure for AGENTS.md files

A single massive, sedimented AGENTS.md file that's grown unwieldy over time. Everything dumped into one file. Students break it apart into smaller, progressively-disclosed chunks using a pre-built prompt.

**Diff from main:** Adds a large, bloated AGENTS.md file.

---

### `exercises/ci-broken`

**Exercises:** 4.1 Demonstrate What Happens When CI Is Broken

CI pipeline exists but is failing — a failing test, a type error, or a lint failure that's been merged. The point is to show what happens when you try to work on a feature with broken CI.

**Diff from main:** Adds a CI pipeline (GitHub Actions) with a deliberately broken state (failing test or type error).

---

### `exercises/no-formatting`

**Exercises:** 4.2 Fixing Agents' Broken Formatting With Lint-Staged, 4.3 Increasing Friction With Pre-commit Hooks

No prettier, no lint-staged, no pre-commit hooks. Some inconsistently formatted files to make the need obvious. Students set up the tooling themselves.

**Diff from main:** Removes any formatting config. Introduces inconsistently formatted files.

---

### `exercises/red-green-refactor`

**Exercises:** 4.4 Red-Green-Refactor

A specific piece of business logic that has no tests. Students write a failing test, make it pass, then refactor. May include a skill file for the red-green-refactor workflow.

**Diff from main:** Flags a specific module with no test coverage. Possibly includes the red-green-refactor skill.

---

### `exercises/ralph-backlog`

**Exercises:** 5.1 Trying HITL Ralph, 5.2 Setting Up And Trying AFK Ralph, 5.3 Hooking Up Ralph To Your Backlog, 5.4 QA-ing Ralph While It's Running, 5.5 Improving Ralph's Task Prioritization, 5.6 Triage Ralph, 6.6 Debugging Errors

A populated GitHub Issues backlog with a mix of bugs, feature requests, improvement tasks, and triage-needed items. The codebase itself has several known bugs seeded in.

**Diff from main:** Seeded bugs in the codebase. Populated issue tracker. Possibly a Ralph config file.

---

## Unbuilt Features on Main

Main needs three distinct unbuilt features, kept separate so exercises don't rework the same material.

### Feature A — Small (Day 1)

**Used by:** 1.2 Build A Feature, 1.3 Plan/Execute/Clear Loop

**Course Review/Rating System.** Students and completers can leave a star rating and written review on a course. New `reviews` table, a couple of API routes (create, list), and a review component on the course page. Well-scoped enough for a single context window.

### Feature B — Large (Day 3)

**Used by:** 3.2 PRDs, 3.3 Multi-Phase Plans, 3.4 Tracer Bullets, 3.5 Multi-Phase Plan Skill

**Analytics/Reporting Dashboard for Instructors.** A full dashboard showing enrollment trends, lesson completion rates, quiz performance, drop-off points, and student engagement over time. Requires new tables for event tracking, multiple API endpoints for different metrics, and a whole new frontend section with interactive charts and filters. Spans DB, API, and frontend — too large for a single context window.

### Feature C — Design-Ambiguous (Day 6)

**Used by:** 6.4 Design It Twice

A feature where there are two or more genuinely valid implementation approaches with real trade-offs. The exercise is about having the agent design it both ways before committing. Think: real-time updates via WebSockets vs SSE vs polling, optimistic vs pessimistic UI updates, client-side vs server-side filtering.

---

## Summary

| Branch                             | Exercises                                                                                | Key Difference from Main                          |
| ---------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------- |
| `main`                             | 1.1, 1.2, 1.3, 2.1, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 4.5, 4.6, 6.1, 6.2, 6.3, 6.4, 6.5 | Base app — mostly complete, with deliberate warts |
| `exercises/progressive-disclosure` | 2.2                                                                                      | Bloated AGENTS.md file                            |
| `exercises/ci-broken`              | 4.1                                                                                      | Broken CI pipeline                                |
| `exercises/no-formatting`          | 4.2, 4.3                                                                                 | No prettier/lint-staged, inconsistent formatting  |
| `exercises/red-green-refactor`     | 4.4                                                                                      | Untested business logic module                    |
| `exercises/ralph-backlog`          | 5.1–5.6, 6.6                                                                             | Seeded bugs + populated issue tracker             |
