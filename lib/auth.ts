import { betterAuth } from "better-auth";
import Database from "better-sqlite3";
import { db } from "@/lib/db";

export const auth = betterAuth({
    database: {
        db,
        type: "sqlite",
    },
    // database: new Database("./db/sqlite.db"),
    emailAndPassword: { enabled: true },
    // socialProviders: {
    //     github: {
    //         clientId: process.env.GITHUB_CLIENT_ID as string, 
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    //     }
    // }
})

// export default auth