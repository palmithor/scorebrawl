import z from 'zod'

export const create = z.object({
    leagueId: z.string().nonempty(),
    name: z.string().nonempty(),
    startDate: z.date().optional().default(new Date()),
    endDate: z.date().optional(),
    initialElo: z.number().int().min(100).default(1200),
    kFactor: z.number().int().min(10).max(50).default(32),
})