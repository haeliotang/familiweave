# Familiweave

[中文](README.md) | **English**

> A local-first symbolic space for ineffable inner experience.

![Familiweave desktop shell](docs/assets/desktop-shell-en.png)

Familiweave is a public research project initiated by **Inceptless**. It explores a simple question:

> Can an inner experience that has not yet become language have a form that can be entered, left, and interpreted only by the person who experienced it?

It is not a therapy product, a dream interpreter, a diagnostic tool, or a realistic clone of a person.

## Principles

1. **Symbol, not interpretation.** The system offers space, light, sound and pacing — not a dream dictionary or a diagnosis.
2. **Meaning stays with the user.** You may feel it resembles something, or nothing at all. There is no score and no correction.
3. **Bounded and exit-able.** An encounter is 75 seconds; a space is 180 seconds. Leaving is part of the experience.

## Current formats

| Format | Structure | Status |
| --- | --- | --- |
| Encounter | 75-second arc, optional figure | Prototype |
| Space | Ambient, no required arc | Prototype |
| Ritual | Short, repeatable, bounded | Planned |
| Artifact | A visual/sonic object you can take away | Planned |
| Archive | Fragments arranged as a terrain | Planned |

## What exists today

- **v0 — pre-verbal capture:** body map, sensation, intensity, breath, and 1–3 associative image fragments. No free-text box.
- **v1 — local motif journal:** name a motif yourself; store it locally; delete or export it.
- **v2 — relationship triggers:** user-authored moments, body reactions and automatic responses; a self-centred map with descriptive counts only. No partner inference, matching or attachment typing.
- **v3 — optional local voice summary:** 8 seconds of volume/pause summary; explicit consent; no raw audio saved or uploaded.
- **BCI-1 — signal lab:** device-agnostic `SignalSource`, a deterministic LSL-style simulator, and a local event timeline.
- **BCI-2 — local device bridge:** localhost-only WebSocket JSON bridge; no real hardware validation yet.
- **Desktop shell:** Tauri 2 + Rust host, SQLite persistence, app-data file sandbox, and a neutral three-pane workspace.

## Architecture

```text
fragment / body state / image fragments
        │
        ▼
InnerPlan
motifs · arc · figure · space/sound/light prompts · safety
        │
        ▼
EpisodePlan (kind: inner)
        │
        ▼
WorldRenderer (symbolic today; Genie 4 later)
        │
        ▼
75s encounter / 180s space
```

- `InnerPlan` is the symbolic director layer.
- `EpisodePlan` is the persisted plan envelope.
- `WorldRenderer` is the renderer seam.
- `CaptureProvenance` is reserved for non-deterministic captures.
- The Tauri Rust host manages app-data files, SQLite and packaging; the frontend calls it through `src/host.ts`.

## Privacy and boundaries

- Default local: no server, no account, no sync.
- Tauri stores motifs and relationship triggers in SQLite; browser preview falls back to `localStorage`.
- Raw audio is not stored by the voice summary.
- No diagnosis, no interpretation, no memory recovery, no realistic cloning.
- No engagement loops or “someone is waiting for you” mechanics.
- This is a research prototype; it has no clinical validation.

## Run

Requirements: Node.js 22+, pnpm 10, Rust toolchain. On macOS, Xcode Command Line Tools are needed for Tauri.

```sh
pnpm install
pnpm dev          # web preview
pnpm tauri:dev    # Tauri 2 desktop shell
```

Checks:

```sh
pnpm test
pnpm build
pnpm check:symbolic-path
pnpm rust:test
cargo test --manifest-path apps/desktop/src-tauri/Cargo.toml
```

Optional scenario tools:

```sh
pnpm inner:storyboard --fragment "a corridor ending in a door" --format encounter
pnpm measure:browser        # local headless baseline
pnpm measure:browser:full   # 75s + 180s frame sample
```

## Project map

- [`src/inner.ts`](src/inner.ts) — `InnerPlan`, encounter/space plans, capture-to-plan.
- [`src/somatic.ts`](src/somatic.ts) — body regions, sensations, breath, image fragments.
- [`src/somatic-entry.tsx`](src/somatic-entry.tsx) — v0 body-map entry.
- [`src/motif-journal.ts`](src/motif-journal.ts) — local motif storage.
- [`src/relationship.ts`](src/relationship.ts) — user-authored relationship triggers.
- [`src/local-store.ts`](src/local-store.ts) — SQLite/localStorage snapshot adapter.
- [`src/desktop-shell.tsx`](src/desktop-shell.tsx) — three-pane workspace.
- [`src/i18n.tsx`](src/i18n.tsx) — Chinese/English UI language.
- [`apps/desktop/src-tauri/`](apps/desktop/src-tauri/) — Tauri 2 Rust host.
- [`docs/inner/`](docs/inner/) — format, v0–v3 and safety notes.
- [`docs/vision/`](docs/vision/) — BCI landscape, BCI-1/2 and the staged path.
- [`docs/desktop-shell.md`](docs/desktop-shell.md) — desktop shell, SQLite and signing notes.

## Roadmap

- **Now:** v0–v3 local prototype, Tauri shell, SQLite persistence, bilingual UI.
- **Next:** real-device voice validation; visual QA of the Tauri window; migrate signal summaries into SQLite.
- **Research:** consented multimodal capture, with no clinical claims.
- **Later:** Genie 4 or other world models; a user-authored relationship topology; clinical work only with ethics review.

## Research questions

1. Can a symbolic space give form to experience without interpreting it?
2. Does a 75-second / 180-second bounded format make people safer, or more distant?
3. When the system does not interpret, do people feel respected or abandoned?
4. Does body-map + image-choice capture feel closer than typing?
5. Who is this for — and who should not use it?

## License

Apache License 2.0. See [LICENSE](LICENSE).

## Initiator

Familiweave is initiated by **Inceptless**.
