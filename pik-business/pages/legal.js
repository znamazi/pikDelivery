import React, { useEffect, useState } from 'react'
import axios from '../utils/axios'

const legal = () => {
  const [page, setPage] = useState('')

  useEffect(() => {
    axios
      .get('admin/auth/staticPage/Legal')
      .then(({ data }) => {
        if (data.success) {
          setPage(data.page)
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
          <h3 className="card-title font-weight-bolder ">{page?.title}</h3>
        </div>
        <div className="card-body d-flex flex-column">
          <p
            className="mt-3"
            dangerouslySetInnerHTML={{
              __html: page?.content
            }}
          ></p>
        </div>
      </div>
    </div>
  )
}

export default legal
