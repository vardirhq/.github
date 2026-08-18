# Vardir

**Small software with sharp edges, useful ideas, and a strong preference for owning your own data.**

Vardir is an independent software workshop building desktop apps, developer tools, local-first systems, and experimental software that solves real problems without requiring a subscription-shaped middleman for every button click.

The projects here tend to share a few principles:

- **Local-first when it makes sense** — your files and data should remain yours.
- **Open source by default** — useful software is better when people can inspect it, learn from it, and improve it.
- **Privacy over telemetry theater** — cloud services and AI should be explicit choices, not hidden dependencies.
- **Practical over fashionable** — Rust, TypeScript, Kotlin, Electron, Tauri, React, SQLite, PostgreSQL, and whatever else fits the problem.
- **Build the tool we actually want to use** — occasionally a dangerous philosophy, judging by the number of repositories.

## Featured projects

| Project | What it is |
| --- | --- |
| **[Skald](https://github.com/vardirhq/skald)** | A local-first Markdown knowledge base with semantic documents, tasks, backlinks, graph navigation, extensions, GitHub integration, Mermaid, local history, and encrypted sync. |
| **[Vitni](https://github.com/vardirhq/vitni)** | A structured investigation workspace for entities, relationships, evidence, sources, assertions, timelines, review, and reporting. |
| **[Sindri](https://github.com/vardirhq/sindri-engine)** | A Rust 2D game engine and editor stack with Lua scripting, `wgpu`, physics, scene tooling, and local AI-assisted workflows. |
| **[Fattern](https://github.com/vardirhq/fattern)** | Local-first invoicing, expenses, customers, products, and accounting-oriented tooling for Norwegian freelancers and small businesses. |
| **[GESH](https://github.com/vardirhq/generic-encrypted-sync-hub)** | A generic encrypted synchronization relay designed so the server handles encrypted data without receiving the content key. |
| **[Hodd](https://github.com/vardirhq/hodd)** | A collection companion for tracking what you own, what is missing, and the story behind a collection. |
| **[Deploid](https://github.com/vardirhq/deploid)** | Tooling for turning web projects into installable Android applications. |
| **[Edda](https://github.com/vardirhq/edda)** | A visual design tool for terminal interfaces and TUI workflows. |

There are also smaller experiments and utilities for search, disk cloning, software updates, Android cleanup, image/vector tooling, local coding assistants, and other problems that somehow became repositories instead of remaining five-minute ideas.

## How Vardir builds

Vardir is intentionally not tied to one stack. The common pattern is to keep systems understandable, portable, and reasonably boring beneath the interesting parts.

Typical technologies include:

`Rust` · `TypeScript` · `React` · `Tauri` · `Electron` · `Kotlin` · `SQLite` · `PostgreSQL` · `Node.js` · `wgpu`

Local AI is used where it genuinely improves a workflow, usually with providers such as Ollama and with cloud access kept optional or explicit.

## Project status

Some repositories are polished applications, some are active experiments, and some are archived snapshots of ideas that led somewhere better. Each repository README should be treated as the source of truth for its current status, supported platforms, setup instructions, and roadmap.

## Contributing

Issues, bug reports, discussions, and pull requests are welcome where enabled. Before contributing, check the individual repository for project-specific guidance and existing issues.

Most projects are built first to solve a concrete problem, then opened up for anyone else who finds the same problem irritating enough to care.

## License

Licensing varies by repository. Check the individual project for details.

---

<sub>Vardir is maintained by [Christoffer Madsen](https://github.com/MadsenDev).</sub>
