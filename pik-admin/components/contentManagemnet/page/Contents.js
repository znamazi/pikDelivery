import React, { useState, useEffect } from 'react'
import axios from '../../../utils/axios'
import ActionButtons from './ActionButtons'
import { useRouter } from 'next/router'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const Contents = () => {
  const { t } = useTranslation()

  const [pages, setPages] = useState([])
  const router = useRouter()

  useEffect(() => {
    axios
      .get('/admin/content/page/list')
      .then(({ data }) => {
        if (data.success) {
          setPages(data.pages)
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
  const handelDeletePage = (id) => {
    let newPage = pages.filter((page) => page._id !== id)
    setPages(newPage)
  }
  return (
    <div className="col-lg-12">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5 d-block">
          <button
            className="btn btn-primary float-right"
            onClick={() => router.push('/contentManagement/page/add')}
          >
            <span>
              <i className="fa fa-plus mr-2"></i>
              {t('pages.content.new_page')}
            </span>
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive col-12">
            <table className="table table-hover table-striped position-relative">
              <thead>
                <tr>
                  <td>{t('pages.content.Page')}</td>
                  <td>{t('pages.common.Action')}</td>
                </tr>
              </thead>
              <tbody>
                {pages.map((page, index) => (
                  <tr key={index}>
                    <td>{page.title}</td>
                    <td>
                      <ActionButtons
                        id={page._id}
                        title={page.title}
                        onDelete={(id) => handelDeletePage(id)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contents
