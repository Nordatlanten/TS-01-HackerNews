import './style.scss'
import axios from "axios"

type ResultType = {
  data: DataType
}

type DataType = {
  hits: HitType[],
  nbPages: number
}

type HitType = {
  title: string,
  url: string,
  author: string,
  points: number,
  story_text: string,
  comment_text: string,
  _highlightResult: {
    title: 
    {
        value: string,
        matchLevel: string,
        matchedWords: string[]
    },
    url: 
    {
        value: string,
        matchLevel: string,
        matchedWords: string[]
    },
    author: 
    {
        value: string,
        matchLevel: string,
        matchedWords: string[]
    }
  },
  num_comments: number,
  objectID: string,
  _tags: string[],
  page: number,
  nbHits: number,
  nbPages: number,
  hitsPerPage: number,
  processingTimeMS: number,
  query: string,
  params: string
  created_at: string,
  created_at_i: number
}

export function setupNewsForm(element: HTMLFormElement) {
  const pagination = document.getElementById("pagination")
  const nextButton = document.getElementById("next-button")
  const previousButton = document.getElementById("previous-button")
  const pageCounter = document.getElementById("page-counter")
  let pageNumber = 1
  let amountOfPages: number

  //This function truncates long strings (only used for URLs right now)
  const truncate = (source: string, size: number) : string => {
    if (source) return source.length > size ? source.slice(0, size - 1) + "…" : source;
    else return "No URL found."
  }

  //To convert date string to a clean format
  const convertDate = (source: string) : string => {

      let dateInMS = Date.parse(source) 
      console.log(dateInMS)
      const slices: string[] = []
  
      const msInHour = 1000 * 60 * 60
      const hours = Math.trunc(dateInMS / msInHour)
      if (hours > 0) {
        slices.push(hours + 'h')
        dateInMS = dateInMS - (hours * msInHour)
      }
      const msInMinute = 1000 * 60
      const minutes = Math.trunc(dateInMS / msInMinute)
      if (minutes > 0) {
        slices.push(minutes + 'm')
      }
      return slices.join(' ')
    
  }


  //This method will do things when history state is changed
  addEventListener("popstate", (_e) => {
    grabURLParameters()
    renderResults(history.state.query, history.state.pageNumber.toString())
    if(pageCounter) pageCounter.innerHTML = `Page: ${history.state.pageNumber}`
  });

  const regexSearch = /(\?query=)([a-z]*)/g
  const regexPage = /(&pageNumber=)[0-9]{1,2}/g
  let currentURL = window.location.href
  let foundSearch
  let foundPage
  
  let searchParameter: string[] | undefined
  let pageParameter: string[] | undefined


  const grabURLParameters = async () => {
  //grabs the query form the url
    currentURL = window.location.href
    foundSearch = currentURL.match(regexSearch)
    foundPage = currentURL.match(regexPage)
    if (foundSearch) searchParameter = foundSearch[0].split('=')
    if (foundPage) pageParameter = foundPage[0].split('=')
  }

  //Grab the parameters on reload
  grabURLParameters()

  const renderResults = async (query: string, page: string) => {
    let response = await axios.get(`http://hn.algolia.com/api/v1/search?query=${query}&page=${page}`).then((res) => res).catch(err => console.error(err)) as ResultType

    amountOfPages = response.data.nbPages

    if (element.nextElementSibling) element.nextElementSibling.innerHTML = ''
    response.data.hits.forEach((item, _index) => {
      let author = 'Author: ' + item.author
      let title = item.title
      let points = 'Points: ' + item.points
      let link = item.url
      let convertedTimeStamp = convertDate(item.created_at)
      let createdAt = 'Created at: ' + convertedTimeStamp

      //create card elements
      let newsCard = document.createElement('div')
      let newsCardTopSection = document.createElement('div')
      let newsCardBottomSection = document.createElement('div')
      let newsTitle = document.createElement('h2')
      let newsDateStamp = document.createElement('p')
      let newsURL = document.createElement('a')
      let pointsDisplay = document.createElement('p')
      let authorDisplay = document.createElement('p')

      //add card element attributes
      newsCard.classList.add('card')
      newsCardTopSection.classList.add('card__top-section')
      newsCardBottomSection.classList.add('card__bottom-section')
      newsTitle.classList.add('card__title')
      newsDateStamp.classList.add('card__date-stamp')
      newsURL.classList.add('card__news-url')
      pointsDisplay.classList.add('card__points')
      authorDisplay.classList.add('card__author')

      //bind data to elements
      newsTitle.innerText = title
      newsDateStamp.innerText = createdAt
      newsURL.innerText = truncate(link, 60)
      newsURL.href = link
      pointsDisplay.innerText = points.toString()
      authorDisplay.innerText = author

      //append children to parent
      newsCardTopSection.appendChild(newsTitle)
      newsCardTopSection.appendChild(newsURL)
      newsCardBottomSection.appendChild(authorDisplay)
      newsCardBottomSection.appendChild(pointsDisplay)
      newsCardBottomSection.appendChild(newsDateStamp)
      newsCard.appendChild(newsCardTopSection)
      newsCard.appendChild(newsCardBottomSection)
      element.nextElementSibling?.appendChild(newsCard)
      
      if (pagination) {
        pagination.style.visibility= 'visible'
      }
      if(nextButton && pageNumber === amountOfPages - 1) {
        nextButton.style.visibility = 'hidden'
      } else if (nextButton && pageNumber < amountOfPages) {
        nextButton.style.visibility = 'visible'
      }
      if (previousButton && pageNumber > 1) {
        previousButton.style.visibility = 'visible'
      } else if (previousButton && pageNumber <= 1){
        previousButton.style.visibility = 'hidden'
      }
  }
  )}

  const fetchResults = async (query: string, page: string) => {
    try {
      await renderResults(query, page)
      if(pageCounter) pageCounter.innerHTML = `Page: ${pageNumber}`
    } catch (error) {
      console.error(error)
    }
  }

  grabURLParameters()
  //render stuff if parameters exist on reload
  if (searchParameter && pageParameter) {
    pageNumber = parseInt(pageParameter[1])
    history.pushState({query: searchParameter[1], pageNumber: parseInt(pageParameter[1])}, `Searching: ${searchParameter[1]} - Page: ${pageParameter[1]}`, `?query=${searchParameter[1]}&pageNumber=${pageParameter[1]}`)
    grabURLParameters()
    fetchResults(searchParameter[1], pageParameter[1])
  }

  nextButton?.addEventListener("click", async (_e) => {
    pageNumber++
    history.pushState({query: history.state.query, pageNumber: pageNumber}, `Searching: ${history.state.query} - Page: ${pageNumber}`, `?query=${history.state.query}&pageNumber=${pageNumber}`)
    grabURLParameters()
    if (searchParameter && pageParameter) await fetchResults(searchParameter[1], pageParameter[1].toString())

  })

  previousButton?.addEventListener("click", async (_e) => {
    pageNumber-- 
    history.pushState({query: history.state.query, pageNumber: pageNumber}, `Searching: ${history.state.query} - Page: ${pageNumber}`, `?query=${history.state.query}&pageNumber=${pageNumber}`)
    grabURLParameters() 
    if (searchParameter && pageParameter) await fetchResults(searchParameter[1], pageParameter[1].toString())
  })

  const getNewsData = (e: SubmitEvent) =>  {
    e.preventDefault()
    pageNumber = 1
    if (e.target) {
      let query
      let page
      const data = new FormData(e.target as HTMLFormElement)
      const dataObject = Object.fromEntries(data.entries());
      query = dataObject.query
      page = pageNumber
      history.pushState({query: dataObject.query, pageNumber: pageNumber}, `Searching: ${dataObject.query} - Page: ${pageNumber}`, `?query=${dataObject.query}&pageNumber=${pageNumber}`)
      grabURLParameters()  
      fetchResults(query as string, page.toString())
    }
  }


  //create form elements
  const searchElement = document.createElement('input')
  const submitElement = document.createElement('button')
  searchElement.setAttribute("name", "query")
  searchElement.setAttribute("type", "search")
  searchElement.setAttribute("placeholder", "search news here...")
  submitElement.setAttribute("type", "submit")
  submitElement.innerText = "Search"
  element.appendChild(searchElement)
  element.appendChild(submitElement)

  element.addEventListener('submit', (e) => getNewsData(e))
}
