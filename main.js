const hnBaseUrl = 'https://hacker-news.firebaseio.com/v0'

function fetchTopStories() {
  const topStoriesUrl = `${hnBaseUrl}/topstories.json`
  return fetch(topStoriesUrl)
    .then(response => response.json())
    .then((data) => fetchStories(data))
}

function fetchStories(data) {
  const topStories = data.slice(0, 24)
  const storyIds = topStories.map((storyId) => {
    const storyUrl = `${hnBaseUrl}/item/${storyId}.json`
    return fetch(storyUrl)
      .then((response) => response.json())
      .then((story) => story)
  })
  return Promise.all(storyIds).then((stories) => renderStories(stories))
}

function renderStories(stories) {
  return stories.map((story) => {
    const html = `
      <div class='story' id='${story.id}'>
        <h3 class='title'><a href='${story.url}'>${story.title}</a></h3>
        <span class='score'> ${story.score} </span> points by
        <span class='story-by'> ${story.by}</span>
        ${!story.kids ? '' : `
          --- <span onclick="fetchComments('${story.kids}')" class='comments'>
             Show ${story.descendants} comments
          </span>
        ` }
      </div>
    `
    document.getElementById('hn').insertAdjacentHTML('beforeend', html)
  })
}

// function toggleAllComments(storyId) {
//   const allComments = document.getElementById(commentId)
//   const toggle = document.getElementById(`toggle-${commentId}`)
//   comment.style.display = (comment.style.display === 'block') ? 'none' : 'block'
//   toggle.innerHTML = (toggle.innerHTML === '[ - ]') ? '[ + ]' : '[ - ]'
// }

function fetchComments(kids) {
  const commentIds = kids.split(',')
  const allComments = commentIds.map((commentId) => {
    const commentUrl = `${hnBaseUrl}/item/${commentId}.json`
    return fetch(commentUrl)
      .then((response) => response.json())
      .then((comment) => comment)
  })
  return Promise.all(allComments).then((comments) => renderComments(comments))
}

function toggleComment(commentId) {
  const comment = document.getElementById(commentId)
  const toggle = document.getElementById(`toggle-${commentId}`)
  comment.style.display = (comment.style.display === 'block') ? 'none' : 'block'
  toggle.innerHTML = (toggle.innerHTML === '[ - ]') ? '[ + ]' : '[ - ]'
}

function renderComments(comments) {
    return comments.map((comment) => {
      const html = comment.deleted || comment.dead ? '' : `
        <div class='comment'>
          <span
            onclick='toggleComment("${comment.id}")'
            href='#'
            id='toggle-${comment.id}'
            class='toggle-comment'
          >[ - ]</span>
          <span class='comment-by'>${comment.by}</span>
          <div id=${comment.id} class='comment-text' style='display:block;'>
            ${comment.text}
          </div>
        </div>
      `
      if (comment.parent) {
        document.getElementById(comment.parent).insertAdjacentHTML('beforeend', html)
      }
      if (comment.kids) return fetchComments(comment.kids.toString())
    }
  )
}

fetchTopStories()
