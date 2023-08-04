import z from 'zod'

export const create = z.object({
    name: z.string().nonempty({ message: "Name is required" }),
    logoUrl: z.string().url(),
    visibility: z.enum(["public", "private"])
})