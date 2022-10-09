import type { Comment } from '../../lib'

import defaultAvatar from '../../assets/default-avatar.webp'
import { getDateWithTimestamp, getTimestamp } from '../../lib'
import './CommentItem.css'

type CommentItemProps = {
  comment: Comment
}

export function CommentItem(props: CommentItemProps) {
  return (
    <div class="comment">
      <img
        src={
          props.comment.author.imageUrl !== ''
            ? props.comment.author.imageUrl
            : defaultAvatar
        }
        alt=""
      />
      <p class="comment__info">
        <span>{props.comment.author.fullname}</span>
        <span>•</span>
        <span>
          {getDateWithTimestamp(getTimestamp(props.comment.createdAt))}
        </span>
      </p>
      <p class="comment__text">{props.comment.text}</p>
    </div>
  )
}
