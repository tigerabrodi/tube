import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  email: z.string(),
  description: z.string(),
  imageUrl: z.string().optional(),
  subscriberIds: z.array(z.string()),
  subscribingIds: z.array(z.string()),
  likedVideoIds: z.array(z.string()),
})

export type User = z.infer<typeof UserSchema>
