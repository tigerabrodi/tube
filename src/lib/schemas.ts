import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  fullname: z.string(),
  email: z.string(),
  description: z.string(),
  imageUrl: z.string(),
  subscriberIds: z.array(z.string()),
  subscribedToIds: z.array(z.string()),
  likedVideoIds: z.array(z.string()),
})

export type User = z.infer<typeof UserSchema>

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
