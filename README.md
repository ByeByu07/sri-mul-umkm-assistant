This is my saas template starter only use in cloudflare environment, use nextjs with betterauth. 

## Tech Stack:
- nextjs
- tailwindcss
- typescript
- better-auth
- kysely
- opennextjs-cloudflare
- d1
- shadcn/ui
- simple icons
- lucide-react
- claude-code

## How to use
- clone this repository
- see the schema in **drizzle/schema.ts**, that the schema setup with initial for better-auth.
- then :
```bash
npx drizzle-kit generate
```
- migrate better-auth to local and remote
``` bash
npm run db:migrate local
npm run db:migrate remote
```
- after changes schema, generated schema with
```bash
npx drizzle-kit generate
```
- don't forgot to generate type with kysely-codegen
```bash
npm run codegen
```
> [!WARNING] 
> change the --url argument first in package.json.

--- 

> [!NOTE] 
> if u want to use plugin from better-auth, add schema manually then generate and migrate.

---

### migrate database
- npm run db:migrate:local
- npm run db:migrate:remote

### run codegen
- npm run codegen

### deploy
- npm run deploy

### preview
- npm run preview

## NB:

### Overrides:
- kysely-codegen conflict with better-sqlite3 (use version ^12.2.0)
## Features

- Authentication


## Environment Variables

To run this project, you will need to setup the following environment variables.

### Preview
Fill `.dev.vars` before run 

``` bash
npm run preview
```

### Development
Fill `.env` before run

``` bash
npm run dev
```

> [!IMPORTANT] 
> then run below command to upload secret key to cf workers.

``` bash
npm run cf:secret:bulk
```

