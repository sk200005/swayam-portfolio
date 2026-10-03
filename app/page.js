'use client'

import Script from 'next/script'
import { MARKUP } from './portfolioMarkup'

const App = () => {
  return (
    <>
      <div id="portfolio-root" dangerouslySetInnerHTML={{ __html: MARKUP }} />
      <Script src="/portfolio.js" strategy="afterInteractive" />
    </>
  )
}

export default App
