/**
 * Simple key/value store backed by the AppSetting Prisma model.
 *
 * Used for site-wide admin data that doesn't fit the tissu-agent CMS (which
 * has a fixed page/section schema). Each value is stored as a JSON string.
 */
import { prisma } from "@/lib/prisma";

export async function getSetting<T = unknown>(key: string): Promise<T | null> {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key } });
    if (!row) return null;
    try { return JSON.parse(row.value) as T; } catch { return null; }
  } catch (err) {
    console.warn(`[app-settings] read failed for "${key}":`, err);
    return null;
  }
}

export async function setSetting(key: string, value: unknown): Promise<boolean> {
  try {
    const json = JSON.stringify(value);
    await prisma.appSetting.upsert({
      where:  { key },
      update: { value: json },
      create: { key, value: json },
    });
    return true;
  } catch (err) {
    console.error(`[app-settings] write failed for "${key}":`, err);
    return false;
  }
}
