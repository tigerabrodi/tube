import type { Comment } from '../../lib'

import { Link } from '@solidjs/router'

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
      <div class="comment__info">
        <Link href={`/profiles/${props.comment.author.id}`}>
          {props.comment.author.fullname}
        </Link>
        <span>•</span>
        <span>
          {getDateWithTimestamp(getTimestamp(props.comment.createdAt))}
        </span>
      </div>
      <p class="comment__text">{props.comment.text}</p>
    </div>
  )
}
