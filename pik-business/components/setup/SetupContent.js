import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Alert } from '@material-ui/lab'
import BusinessDetails from './BusinessDetails'
import Hours from './Hours'
import { useSetupState } from './context'
import axios from '../../utils/axios'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'



const SetupContent = (props) => {
  const router = useRouter()
  const { t } = useTranslation()

  const [error, setError] = useState('')
  const { state, dispatch } = useSetupState()
  const [dataBusiness, setDataBusiness] = useState()

  useEffect(() => {
    dispatch({
      type: 'UPDATE_MODE',
      payload: {
        mode: props.mode,
        tab: props.type
      }
    })
    if (props.mode === 'edit')
      axios
        .get('business/setup')
        .then(({ data }) => {
          //
          if (data.success) {
            dispatch({
              type: 'UPDATE_STATE',
              payload: {
                business: data.business,
                customTimeFrames: data.customTimeFrames
              }
            })
            setDataBusiness(data.business)
            // setBusiness({ ...newData })
            // setBusinessNotFound(false)
          } else {
            setDataBusiness('empty')
            dispatch({
              type: 'UPDATE_MODE',
              payload: {
                mode: 'add',
                tab: props.type
              }
            })
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          toast.error(errorMessage)
        })
  }, [props.type])

  const changeContent = () => {
    dispatch({
      type: 'CHANGE_CONTENT'
    })
  }

  let content =
    props.mode === 'edit' ? (
      dataBusiness &&
      (props.type === 'business' ? <BusinessDetails /> : <Hours />)
    ) : state.showDetails ? (
      <BusinessDetails />
    ) : (
      <Hours />
    )
  return (
    <div className="col-12">
      <div className="card card-custom card-stretch gutter-b">
        {props.mode !== 'edit' && (
          <div className="card-header border-bottom pt-5 ">
            {!state.showDetails && (
              <span className="float-left card-title" onClick={changeContent}>
                <i className=" mr-2 fa fa-long-arrow-alt-left"></i>
                {t('pages.common.back')}
              </span>
            )}
            <h3 className="card-title font-weight-bolder ">
              {t('pages.setup.setup_business_details')}
            </h3>
            <span
              className="float-right card-title"
              onClick={() => {
                state.showDetails ? changeContent() : router.push('/')
              }}
            >
              {t('information.skip')}{' '}
              <i className=" ml-2 fa fa-long-arrow-alt-right"></i>
            </span>
          </div>
        )}
        <div className="card-body d-flex flex-column">
          <div className="row">
            <div className="col-12 mb-5">
              {error && <Alert severity="error">{error}</Alert>}
            </div>
          </div>
          <div className="row">{content}</div>
        </div>
      </div>
    </div>
  )
}

export default SetupContent
