// Shared Zod schemas for contracts across apps
import { z } from 'zod';

// Basic id schema
export const IdSchema = z.string().min(1);

// Project payloads
export const ProjectCreateSchema = z.object({
  title: z.string().min(1, 'title required').max(200),
});
export type ProjectCreateInput = z.infer<typeof ProjectCreateSchema>;

export const ProjectSchema = z.object({
  id: IdSchema,
  title: z.string(),
  json: z.record(z.any()).optional().default({}),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});
export type Project = z.infer<typeof ProjectSchema>;

// Simple asset schema for uploads tracked in project.json
export const AssetSchema = z.object({
  key: z.string(),
  url: z.string().url(),
  contentType: z.string().min(1),
  size: z.number().int().nonnegative().optional(),
  name: z.string().optional(),
});
export type Asset = z.infer<typeof AssetSchema>;

export const ProjectPatchSchema = z.object({
  addAsset: AssetSchema.optional(),
});
export type ProjectPatchInput = z.infer<typeof ProjectPatchSchema>;
