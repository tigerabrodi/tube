import { Circle } from '../../icons/Circle'
import './Spinner.css'

type SpinnerProps = {
  label: string
}

export function Spinner(props: SpinnerProps) {
  return (
    <div class="spinner" role="alert" aria-label={props.label}>
      <Circle />
    </div>
  )
}
