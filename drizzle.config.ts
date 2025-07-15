// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./drizzle/schema.ts",
// use this if pull schema from cloudflare
// comment again if want to generate and migrate local db
//   driver: "d1-http",
//   dbCredentials: {
//     accountId: "your cloudflare account id",
//     databaseId: "your cloudflare database id",
//     token: "your cloudflare token",
//   },
  dbCredentials: {
    // .sqlite that generated from wrangler in .wrangler/state/v3/d1/miniflare-D1DatabaseObject/{name}.sqlite
    url: "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/{name}.sqlite"
  },
  introspect: {
    casing: "preserve"
  }
});
