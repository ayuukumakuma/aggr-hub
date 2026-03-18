import { Hono } from "hono";
import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { db } from "../db/index.js";
import { entries } from "../db/schema.js";

export const entryRoutes = new Hono()
  .get("/entries", async (c) => {
    const feedId = c.req.query("feedId");
    const isRead = c.req.query("isRead");
    const cursor = c.req.query("cursor");
    const limit = Math.min(Number(c.req.query("limit") ?? 30), 100);

    const conditions = [];

    if (feedId) {
      conditions.push(eq(entries.feedId, feedId));
    }
    if (isRead !== undefined && isRead !== "") {
      conditions.push(eq(entries.isRead, isRead === "true"));
    }
    if (cursor) {
      let publishedAt: string;
      let id: string;
      try {
        const decoded = Buffer.from(cursor, "base64").toString();
        const parts = decoded.split("|");
        if (parts.length !== 2 || !parts[1]) throw new Error("Invalid cursor format");
        [publishedAt, id] = parts;
      } catch {
        return c.json({ error: "Invalid cursor" }, 400);
      }
      conditions.push(sql`(${entries.publishedAt}, ${entries.id}) < (${publishedAt}, ${id})`);
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await db
      .select()
      .from(entries)
      .where(where)
      .orderBy(desc(entries.publishedAt), desc(entries.id))
      .limit(limit + 1);

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, limit) : results;

    let nextCursor: string | null = null;
    if (hasMore && data.length > 0) {
      const last = data[data.length - 1];
      nextCursor = Buffer.from(`${last.publishedAt?.toISOString() ?? ""}|${last.id}`).toString(
        "base64",
      );
    }

    return c.json({ data, nextCursor, hasMore });
  })

  .get("/entries/:id", async (c) => {
    const id = c.req.param("id");
    const [entry] = await db.select().from(entries).where(eq(entries.id, id));
    if (!entry) return c.json({ error: "Entry not found" }, 404);
    return c.json(entry);
  })

  .patch("/entries/:id", async (c) => {
    const id = c.req.param("id");
    const body = await c.req.json<{ isRead?: boolean }>();

    const [updated] = await db.update(entries).set(body).where(eq(entries.id, id)).returning();

    if (!updated) return c.json({ error: "Entry not found" }, 404);
    return c.json(updated);
  })

  .post("/entries/mark-read", async (c) => {
    const body = await c.req.json<{ entryIds: string[] }>();

    await db.update(entries).set({ isRead: true }).where(inArray(entries.id, body.entryIds));

    return c.json({ success: true });
  });
