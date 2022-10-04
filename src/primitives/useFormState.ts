import { createSignal } from 'solid-js'

type InputORTextarea = HTMLInputElement | HTMLTextAreaElement

export function useFormState<
  InitialState extends Record<string, string | File>
>(initialState: InitialState) {
  const [formState, setFormState] = createSignal<InitialState>(initialState)

  function handleFormStateChange(
    event: InputEvent & {
      currentTarget: InputORTextarea
      target: Element
    }
  ) {
    // @ts-ignore
    setFormState({
      ...formState(),
      [(event.target as InputORTextarea).name]: (
        event.target as InputORTextarea
      ).value,
    })
  }

  return { formState, setFormState, handleFormStateChange }
}
