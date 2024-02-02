import z from "zod";

export const pageQuerySchema = z
  .object({
    cursor: z.string().optional(),
    limit: z.number().int().optional().default(30),
  })
  .optional()
  .default({ cursor: undefined, limit: 30 });

export const getCursor = ({ cursor }: { cursor?: string }) => (cursor ? { id: cursor } : undefined);
