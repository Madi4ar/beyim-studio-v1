# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Individual schoolteachers in Kazakhstan, using the product on their own account to prepare lessons for their own classes (not a school- or district-licensed institutional rollout).

## Product Purpose

Beyim Studio is an AI-assisted lesson-preparation tool: a teacher enters a topic, subject, grade, and language, and the product generates a package of lesson materials (lesson plan/KSP, presentation, worksheet, differentiated tasks, quiz, reflection, homework, "text detective" exercise, cards). Success means less time spent on manual lesson prep.

## Positioning

The product spans the full teaching loop, not just content generation: create the material package, edit/review it, then deliver the lesson live in "Lesson Mode" (timer, slide walkthrough, random-student picker, group formation, QR entry for a quiz, scoreboard), then review results in Analytics. A plain content generator stops after the first step; this does not.

## Operating Context

Solo teacher workflow: Home → enter topic/subject/grade/language → pick which material types to generate → generation screen → review/edit materials in My Materials or the editor → optionally run the lesson live in Lesson Mode → check Analytics afterward. Runs in a browser, individually, not in a shared/admin-managed classroom device context.

## Capabilities and Constraints

- Currently a **prototype/demo**: all content and progress data is mocked (`js/data/seed.js`, `js/data/mockContent.js`); there is no real backend AI integration wired up yet, though real prompt templates exist (`api/prompts/`) for future LLM calls via `js/data/aiClient.js`.
- Vanilla JS SPA (no framework), hash-based router, Tailwind CSS, served by a small Express static server (`server.js`).
- Must remain fully bilingual: Kazakh and Russian are both first-class UI languages, not a secondary/partial translation.

## Brand Commitments

Product name: **Beyim Studio** (also referred to in-product as "Beyim AI").

## Evidence on Hand

None. This is a prototype with mocked content — no real user testimonials, usage metrics, case studies, or press exist yet. Future work must not fabricate any of these.

## Product Principles

1. The product is one continuous loop — prepare, deliver, review — not a one-shot generator.
2. Minimize time-to-first-material; a teacher juggles many subjects, grades, and languages in one sitting.
3. Kazakh and Russian are equally first-class throughout the UI, not an afterthought.
4. It is a prototype today: no fabricated proof, metrics, or claims beyond what is actually built.

## Accessibility & Inclusion

No specific accessibility standard has been established yet.
