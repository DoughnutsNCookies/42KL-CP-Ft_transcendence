import React from 'react'

function YoutubeEmbed() {
  return (
    <div className='pointer-events-none '>
      <iframe
        width="100%"
        height="800"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0?version=3&autoplay=1&controls=0&&showinfo=0&loop=1&list=PLq8kPn_CxA2hEb7qPC9IbBPTT21JJF_C-&index=1"
        allow=" autoplay;picture-in-picture;loop;"
        title="Embedded youtube"
      />
    </div>
  )
}

export default YoutubeEmbed