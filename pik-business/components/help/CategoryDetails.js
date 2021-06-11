import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import axios from '../../utils/axios'
import Content from './Content'

const CategoryDetails = ({ categoryID }) => {
  const [faqs, setFaqs] = useState([])
  const [content, setContent] = useState(false)
  const [selectedFaq, setSelectedFaq] = useState('')
  const [category, setCategory] = useState('')
  useEffect(() => {
    axios
      .get(`business/help/faq/questions/${categoryID}`)
      .then(({ data }) => {
        if (data.success) {
          setFaqs(data.faqs)
          setCategory(data.faqs[0].category.category)
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          toast.error(errorMessage)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        toast.error(errorMessage)
      })
  }, [])

  const showContent = (e, id) => {
    setContent(true)
    setSelectedFaq(id)
  }
  return (
    <div className="row">
      <div className="col-lg-12 card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">
            <Link href="/help">
              <span className="text-dark mr-1">Help</span>
            </Link>
            {` > ${category}`}
          </h3>
        </div>
        <div className="card-body d-flex flex-column">
          {!content &&
            faqs.map((faq) => (
              <div className="m-4" key={faq._id}>
                <a onClick={(e) => showContent(e, faq._id)}> {faq.question}</a>
              </div>
            ))}
          {content && <Content faqs={faqs} selected={selectedFaq} />}
        </div>
      </div>
    </div>
  )
}

export default CategoryDetails
