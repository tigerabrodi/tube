import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  email: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  subscribers: z.number(),
  subscribedToIds: z.array(z.string()),
  likedVideoIds: z.array(z.string()),
})

export type User = z.infer<typeof UserSchema>

export const TimestampSchema = z.object({
  seconds: z.number(),
  nanoseconds: z.number(),
})
export type Timestamp = z.infer<typeof TimestampSchema>

export const VideoSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnailUrl: z.string(),
  videoUrl: z.string(),
  likes: z.number(),
  views: z.number(),
  createdAt: TimestampSchema,
  author: z.object({
    id: z.string(),
    imageUrl: z.string(),
    fullname: z.string(),
    subscribers: z.number(),
  }),
})

export type Video = z.infer<typeof VideoSchema>

export const CommentSchema = z.object({
  id: z.string(),
  text: z.string(),
  createdAt: TimestampSchema,
  author: z.object({
    id: z.string(),
    imageUrl: z.string(),
    fullname: z.string(),
  }),
})

export type Comment = z.infer<typeof CommentSchema>

type FormElement<
  FormElements extends HTMLFormControlsCollection = HTMLFormControlsCollection
> = HTMLFormElement & {
  readonly elements: FormElements
}

export type FormEvent<
  FormElements extends HTMLFormControlsCollection = HTMLFormControlsCollection
> = Event & {
  submitter: HTMLElement
} & {
  currentTarget: FormElement<FormElements>
  target: Element
}

export type FileInputEvent = Event & {
  currentTarget: HTMLInputElement
  target: HTMLInputElement
}

export type Status = 'idle' | 'loading' | 'success' | 'error'
