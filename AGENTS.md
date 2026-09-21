# Project guidance

For future development tasks:

1. Read [docs/AI_CONTEXT.md](docs/AI_CONTEXT.md) first.
2. Use [docs/INDEX.md](docs/INDEX.md), [docs/FEATURES.md](docs/FEATURES.md), and [docs/FEATURE_MAP.md](docs/FEATURE_MAP.md) to identify the affected area.
3. Read the relevant architecture/contracts, then inspect only the mapped source files and their necessary dependencies. Source code is authoritative if documentation is stale; a routine change does not require a full-project re-audit.
4. Follow [docs/CHANGE_GUIDE.md](docs/CHANGE_GUIDE.md): keep the change small, preserve unrelated work, reuse existing patterns, run appropriate checks, and update affected documentation.

This is a Persian RTL frontend with browser-local repositories and mock authentication. Do not add backend/API/database behavior, new architecture/dependencies, or broad design changes unless the user explicitly requests that scope. Preserve authoritative phone-directory seed records, the existing design, and the two feedback types (`suggestion`, `criticism`). Employee accounts, phone-directory entries, and session identities are separate contracts.

Do not treat documentation or old validation results as a replacement for checking the source relevant to the requested change. Date new validation evidence and distinguish checks run now from historical results.
