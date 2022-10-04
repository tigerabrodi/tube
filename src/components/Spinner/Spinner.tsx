import { Circle } from '../../icons/Circle'
import './Spinner.css'

type SpinnerProps = {
  label: string
  class: string
}

export function Spinner(props: SpinnerProps) {
  return (
    <div class={props.class} role="alert" aria-label={props.label}>
      <Circle />
    </div>
  )
}
