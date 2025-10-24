// Placeholder Zod schemas and exports
import { z } from 'zod';

export const IdSchema = z.string().min(1);
export const UserSchema = z.object({ id: IdSchema, name: z.string().min(1) });
export type User = z.infer<typeof UserSchema>;

