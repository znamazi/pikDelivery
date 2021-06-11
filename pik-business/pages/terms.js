import React, { useEffect, useState } from 'react'
import axios from '../utils/axios'
import { toast } from 'react-toastify'

const terms = () => {
  const [terms, setTerms] = useState('')
  useEffect(() => {
    axios
      .get('business/auth/terms')
      .then(({ data }) => {
        if (data.success) {
          setTerms(data.terms)
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
  return (
    <div className="col-lg-12">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">{terms.title}</h3>
        </div>
        <div className="card-body d-flex flex-column">
          <p
            className="mt-3"
            dangerouslySetInnerHTML={{
              __html: terms.answer
            }}
          ></p>
        </div>
      </div>
    </div>
  )
}

export default terms
