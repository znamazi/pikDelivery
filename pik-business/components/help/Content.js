import React, { useState, useEffect } from 'react'

const Content = ({ faqs, selected }) => {
  const [selectedFaq, setSelectedFaq] = useState(selected)
  const [content, setContent] = useState('')
  useEffect(() => {
    const content = faqs.find((item) => item._id === selectedFaq)
    setContent(content)
  }, [selectedFaq])
  const showContent = (e, id) => {
    setSelectedFaq(id)
  }
  return (
    <div className="row">
      <div className="col-lg-4 question-box">
        {faqs.map((faq) => (
          <div className="m-4" key={faq._id}>
            <a
              onClick={(e) => showContent(e, faq._id)}
              className={faq._id === selectedFaq ? 'text-primary' : ''}
            >
              {faq.question}
            </a>
          </div>
        ))}
      </div>
      <div className="col-lg-8">
        <p
          dangerouslySetInnerHTML={{
            __html: content.answer
          }}
        ></p>
      </div>
    </div>
  )
}

export default Content
