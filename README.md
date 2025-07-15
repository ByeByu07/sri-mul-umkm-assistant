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
- change the **migrations_dir** in **wrangler.jsonc** to better-auth_migrations first.
- migrate better-auth to local and remote
``` bash
npm run db:migrate local
npm run db:migrate remote
```
- uncomment in **drizzle.config.ts** and fill the dbCredentials.
- pull the schema from cf to your project.
```bash
npx drizzle-kit pull
```
- then u can know changes the schema in **drizzle/schema.ts**
- after changes schema generated schema with
```bash
npx drizzle-kit generate
```
- then migrate that to your local and remote.

> [!NOTE] 
> the type will auto-generated with kysely-codegen after your migrate.

> [!WARNING] 
> remove the better-auth_migrations after the setup.

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

