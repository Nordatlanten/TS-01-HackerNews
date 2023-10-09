import './style.scss'

import { setupNewsForm } from './news-form.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>Welcome to Nordatlanten's portal for Hacker News</h1>
    <form id="news-form"></form>
    <div id="search-results"></div>
    <div id="pagination">
      <div id="navigation">
      <button id="previous-button">Previous page</button><button id="next-button">Next Page</button>
      </div>
      <div id="page-counter"></div>
    </div>
  </div>
`
setupNewsForm(document.querySelector<HTMLFormElement>('#news-form')!)
