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
      <div id='${story.id}'>
        <a href='${story.url}'>
          <h3 class='story'>
            ${story.title}  - <span class='user'>${story.by}</span>
          </h3>
        </a>
        Score: <span class='score'> ${story.score}   </span>
        Comments:
          <span onclick="showComments('${story.kids}')" class='comments'>
            ${story.descendants}
          </span>
      </div>
    `
    document.getElementById('hn').insertAdjacentHTML('beforeend', html)
  })
}

function showComments(kids) {
  const commentIds = kids.split(',')
  const allComments = commentIds.map((commentId) => {
    const commentUrl = `${hnBaseUrl}/item/${commentId}.json`
    return fetch(commentUrl)
      .then((response) => response.json())
      .then((comment) => comment)
  })
  return Promise.all(allComments).then((comments) => renderComments(comments))
}

function renderComments(comments) {
  return comments.map((comment) => {
    console.log(comment)
    const html = `
      <div id=${comment.id} class='comment'>
        <span class='user'>${comment.by} - </span>
        <p> ${comment.text}</p>
        ${ comment.kids ?
          `<span onclick="showComments('${comment.kids}')" class='comments'>
            show comments
          </span>` : ''
        }
      </div>
    `
    document.getElementById(comment.parent).insertAdjacentHTML('beforeend', html)
  })
}

fetchTopStories()
