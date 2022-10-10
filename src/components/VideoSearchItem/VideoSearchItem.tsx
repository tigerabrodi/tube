import type { Video } from '../../lib'

import { Link } from '@solidjs/router'

import { getDateWithTimestamp, getTimestamp } from '../../lib'

import './VideoSearchItem.css'

type VideoSearchItemProps = {
  video: Video
}

export function VideoSearchItem(props: VideoSearchItemProps) {
  return (
    <Link
      href={`/videos/${props.video.id}`}
      class="video-search"
      aria-label={props.video.title}
    >
      <img
        src={props.video.thumbnailUrl}
        alt=""
        class="video-search__thumbnail"
      />

      <h2 class="video-search__title">{props.video.title}</h2>

      <p class="video-search__views">
        <span>{props.video.views} views</span>
        <span>•</span>
        <span>{getDateWithTimestamp(getTimestamp(props.video.createdAt))}</span>
      </p>

      <img
        src={props.video.author.imageUrl}
        alt=""
        class="video-search__author-image"
      />
      <p class="video-search__author-fullname">{props.video.author.fullname}</p>

      <p class="video-search__description">{props.video.description}</p>
    </Link>
  )
}
