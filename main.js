const state = {}
const hnBaseUrl = 'https://hacker-news.firebaseio.com/v0'
const hnUrl = 'https://news.ycombinator.com'

fetchTopStories()

function fetchTopStories() {
  const topStoriesUrl = `${hnBaseUrl}/topstories.json`
  return fetch(topStoriesUrl)
    .then(response => response.json())
    .then((data) => fetchStories(data))
}

function fetchStories(data) {
  const topStories = data.slice(0, 29)
  const storyIds = topStories.map((storyId) => {
    const storyUrl = `${hnBaseUrl}/item/${storyId}.json`
    return fetch(storyUrl)
      .then((response) => response.json())
      .then((story) => story)
  })
  return Promise.all(storyIds).then((stories) => {
    state.stories = stories
    renderStories(stories)
  })
}

function renderStories(stories) {
  return stories.map((story) => {
    const userUrl = `${hnUrl}/user?id=${story.by}`
    const storyItemUrl = `${hnUrl}/item?id=${story.id}`
    const html = `
      <div class='story' id='${story.id}'>
        <h3 class='title'>
          ${story.url ? `<a href='${story.url}' target='_blank'>${story.title}</a>`
            : `<a href='' onclick="showText('${story.text}')" >${story.title}</a>`
          }
        </h3>
        <span class='score'> ${story.score} </span> points by
        <a href='${userUrl}' target='_blank' class='story-by'> ${story.by}</a>
        ${story.kids ? `
          <span
            onclick="fetchOrToggleComments('${story.kids}','${story.id}')"
            class='comments'
          > [toggle ${story.descendants} comments] </span>`
          : ''
        }
        <a href='${storyItemUrl}' target='_blank' class='hnLink'>[view on HN]</a>
        <div id='comments-${story.id}' style='display: block;'><div>

      </div>
    `
    document.getElementById('hn').insertAdjacentHTML('beforeend', html)
  })
}
function showText(storyText) {
  document.getElementById('hn').insertAdjacentHTML('beforeend', html)
}
function fetchComments(kids, storyId) {
  const commentIds = kids.split(',')
  const allComments = commentIds.map((commentId) => {
    const commentUrl = `${hnBaseUrl}/item/${commentId}.json`
    return fetch(commentUrl)
      .then((response) => response.json())
      .then((comment) => comment)
  })
  return Promise.all(allComments).then((comments) => {
    state[storyId] = comments
    renderComments(comments, storyId)
  })
}

function fetchOrToggleComments(kids, storyId) {
  function toggleAllComments(storyId) {
    const allComments = document.getElementById(`comments-${storyId}`)
    allComments.style.display = (allComments.style.display === 'block') ? 'none' : 'block'
  }

  if (state[storyId]) {
    toggleAllComments(storyId)
  } else {
    fetchComments(kids, storyId)
  }
}

function toggleComment(commentId) {
  const comment = document.getElementById(commentId)
  const toggle = document.getElementById(`toggle-${commentId}`)
  comment.style.display = (comment.style.display === 'block') ? 'none' : 'block'
  toggle.innerHTML = (toggle.innerHTML === '[ - ]') ? '[ + ]' : '[ - ]'
}

function renderComments(comments, storyId) {
  return comments.map((comment) => {
    const userUrl = `${hnUrl}/user?id=${comment.by}`
    const html = comment.deleted || comment.dead ? '' : `
      <div class='comment'>
        <span
          onclick='toggleComment("${comment.id}")'
          href='#'
          id='toggle-${comment.id}'
          class='toggle-comment'
        >[ - ]</span>
        <a href='${userUrl}' class='comment-by'> ${comment.by}</a>
        <div id=${comment.id} class='comment-text' style='display:block;'>
          ${comment.text}
        </div>
      </div>
    `
    if (comment.parent == storyId) {
      document.getElementById(`comments-${storyId}`).insertAdjacentHTML('beforeend', html)
    } else {
      document.getElementById(comment.parent).insertAdjacentHTML('beforeend', html)
    }
    if (comment.kids) return fetchComments(comment.kids.toString(), storyId)
  })
}
