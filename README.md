# NWP-Engineering-Department-Project-management-system
vushwa

## Quick start

Needs Node.js 24+, Git and Docker Desktop.

```bash
npm install
npx supabase start            # local database (Docker)
cp .env.example .env.local    # paste keys from `npx supabase status`
npm run dev                   # http://localhost:3000
```

Checks before a pull request: `npm run lint && npm run typecheck && npm test && npm run build`

## Documentation

- [Project docs index](docs/README.md)
- [Phase 1 overview and team split](docs/phase-1/00-overview.md)
- [Start the Next.js + Supabase project](docs/setup/01-nextjs-supabase-setup.md)
