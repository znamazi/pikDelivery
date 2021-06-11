import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { connect } from 'react-redux'
import { toast } from 'react-toastify'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import HeaderContent from '../../layouts/HeaderContent'
import axios from '../../../utils/axios'
import { Alert, AlertTitle } from '@material-ui/lab'
import { useTranslation } from 'react-i18next'

const AddGroup = (props) => {
  const [error, setError] = useState('')
  const { t } = useTranslation()

  const [newGroup, setNewGroup] = useState({
    active: true,
    credit: false,
    title: '',
    cancelFee: '',
    returnFee: '',
    pikCommission: '',
    prices: {
      Motorcycle: {
        basePrice: 0,
        kmPrice: 0
      },
      Car: {
        basePrice: 0,
        kmPrice: 0
      },
      Pickup: {
        basePrice: 0,
        kmPrice: 0
      }
    },
    kmPrice: 0
  })
  const router = useRouter()
  const { id } = router.query
  const { getConfirmation } = useConfirmationDialog()
  if (props.mode === 'edit') {
    useEffect(() => {
      let group = props.groups.find((item) => item._id === id)
      if (group) setNewGroup(group)
      else
        axios
          .get(`admin/setting/group/retrieve/${id}`)
          .then(({ data }) => {
            if (data.success) {
              setNewGroup(data.group)
            } else {
              const errorMessage = data.errorCode
                ? t(`server_errors.${data.errorCode}`)
                : data.message
              setError(errorMessage)
            }
          })
          .catch((error) => {
            const errorMessage = error?.response?.data?.errorCode
              ? t(`server_errors.${error?.response?.data?.errorCode}`)
              : error?.response?.data?.message
            setError(errorMessage)
          })
    }, [])
  }
  const handleData = (e) => {
    let fieldName = e.target.id
    setNewGroup({ ...newGroup, [fieldName]: e.target.value })
  }
  const handleCheck = (e) => {
    setNewGroup({ ...newGroup, [e.target.id]: e.target.checked })
  }
  const cancelForm = () => {
    setNewGroup({
      kmPrice: 0,
      active: true,
      credit: false,
      title: '',
      cancelFee: '',
      returnFee: '',
      pikCommission: '',
      prices: {
        Motorcycle: {
          basePrice: 0,
          kmPrice: 0
        },
        Car: {
          basePrice: 0,
          kmPrice: 0
        },
        Pickup: {
          basePrice: 0,
          kmPrice: 0
        }
      }
    })
    router.push({ pathname: '/settings', query: { tab: 1 } })
  }
  const submitForm = () => {
    const {
      title,
      active,
      credit,
      kmPrice,
      cancelFee,
      pikCommission,
      prices,
      returnFee
    } = newGroup
    setError('')

    if (!!!title) {
      setError(t('errors.enter_title'))
      return
    }

    const url =
      props.mode === 'edit'
        ? `admin/setting/group/${id}`
        : 'admin/setting/group/create'
    let message =
      props.mode === 'edit'
        ? t('pages.setting.group_updated_successfuly')
        : t('pages.setting.group_created_successfuly')
    axios
      .post(url, {
        title,
        kmPrice,
        active,
        credit,
        cancelFee,
        pikCommission,
        prices,
        returnFee
      })
      .then(({ data }) => {
        if (data.success) {
          toast.success(message)
          router.push({ pathname: '/settings', query: { tab: 1 } })
        } else {
          const errorMessage = data.errorCode
            ? t(`server_errors.${data.errorCode}`)
            : data.message
          setError(errorMessage)
        }
      })
      .catch((error) => {
        const errorMessage = error?.response?.data?.errorCode
          ? t(`server_errors.${error?.response?.data?.errorCode}`)
          : error?.response?.data?.message
        setError(errorMessage)
      })
  }
  const deleteGroup = async (e) => {
    e.preventDefault()
    const confirmed = await getConfirmation({
      title: t('pages.settinng.Attention'),
      message: t('pages.setting.message_delete_group', {
        title: newGroup.title
      })
    })

    if (confirmed) {
      axios
        .post(`admin/setting/group/delete/${id}`)
        .then(({ data }) => {
          if (data.success) {
            toast.success(t('pages.setting.group_deleted_successfuly'))
            router.push({ pathname: '/settings', query: { tab: 1 } })
          } else {
            const errorMessage = data.errorCode
              ? t(`server_errors.${data.errorCode}`)
              : data.message
            setError(errorMessage)
          }
        })
        .catch((error) => {
          const errorMessage = error?.response?.data?.errorCode
            ? t(`server_errors.${error?.response?.data?.errorCode}`)
            : error?.response?.data?.message
          setError(errorMessage)
        })
    }
  }
  return (
    <>
      <HeaderContent>
        <li
          onClick={() => router.push('/settings')}
          className="menu-item menu-item-open menu-item-here menu-item-submenu menu-item-rel menu-item-open menu-item-here menu-item-active"
          data-menu-toggle="click"
          aria-haspopup="true"
        >
          <a className="menu-link menu-toggle">
            <span className="menu-text">{t('header_content.settings')}</span>
            <i className="menu-arrow"></i>
          </a>
        </li>
      </HeaderContent>
      <div className="col-lg-12">
        <div className="card card-custom card-stretch gutter-b p-15">
          {error && <Alert severity="error">{error}</Alert>}

          <div className="p-5">
            <h3 className="card-title font-weight-bolder d-inline ">
              {props.mode === 'edit' ? 'Edit Group' : 'Add Group'}
            </h3>
          </div>
          <div className="card-body d-flex flex-column border-gray">
            <div className="row">
              {/* <div className="col-12"> */}
              <div className="form-group col-md-6">
                <label htmlFor="name">{t('information.Title')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={newGroup['title']}
                  onChange={(e) => handleData(e)}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="user">{t('pages.setting.km_price')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="kmPrice"
                  value={newGroup.kmPrice}
                  onChange={(e) => handleData(e)}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="user">{t('pages.setting.cancel_fee')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="cancelFee"
                  value={newGroup['cancelFee']}
                  onChange={(e) => handleData(e)}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="emial">{t('pages.setting.return_fee')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="returnFee"
                  value={newGroup['returnFee']}
                  onChange={(e) => handleData(e)}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="password">
                  {t('pages.setting.pik_comission')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="pikCommission"
                  value={newGroup['pikCommission']}
                  onChange={(e) => handleData(e)}
                />
              </div>
            </div>
            <div className="row">
              <div className="form-group col-md-6">
                <label htmlFor="name">
                  {t('pages.setting.moto_base_price')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="motoBasePrice"
                  value={newGroup.prices?.Motorcycle?.basePrice}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      prices: {
                        ...newGroup.prices,
                        Motorcycle: {
                          ...newGroup.prices?.Motorcycle,
                          basePrice: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="user">{t('pages.setting.moto_km_price')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="motoKMPrice"
                  value={newGroup.prices?.Motorcycle?.kmPrice}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      prices: {
                        ...newGroup.prices,
                        Motorcycle: {
                          ...newGroup.prices?.Motorcycle,
                          kmPrice: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="name">
                  {t('pages.setting.car_base_price')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="carBasePrice"
                  value={newGroup.prices?.Car?.basePrice}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      prices: {
                        ...newGroup.prices,
                        Car: {
                          ...newGroup.prices?.Car,
                          basePrice: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="user">{t('pages.setting.car_km_price')}</label>
                <input
                  type="text"
                  className="form-control"
                  id="carKMPrice"
                  value={newGroup.prices?.Car?.kmPrice}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      prices: {
                        ...newGroup.prices,
                        Car: {
                          ...newGroup.prices?.Car,
                          kmPrice: e.target.value
                        }
                      }
                    })
                  }
                />
              </div>
              {/* <div className="form-group col-md-6">
                <label htmlFor="name">
                  {t('pages.setting.pickup_base_price')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="pickupBasePrice"
                  value={newGroup.prices?.Pickup?.basePrice}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      prices: {
                        ...newGroup.prices,
                        Pickup: {
                          ...newGroup.prices?.Pickup,
                          basePrice: e.target.value
                        }
                      }
                    })
                  }
                />
              </div> */}
              {/* <div className="form-group col-md-6">
                <label htmlFor="user">
                  {t('pages.setting.pickup_km_price')}
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="pickupKMPrice"
                  value={newGroup.prices?.Pickup?.kmPrice}
                  onChange={(e) =>
                    setNewGroup({
                      ...newGroup,
                      prices: {
                        ...newGroup.prices,
                        Pickup: {
                          ...newGroup.prices?.Pickup,
                          kmPrice: e.target.value
                        }
                      }
                    })
                  }
                />
              </div> */}

              <div className="form-group form-check col-md-2 ml-5">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="active"
                  checked={newGroup['active']}
                  onChange={(e) => handleCheck(e)}
                />
                <label className="form-check-label" htmlFor="active">
                  {t('pages.common.active')}
                </label>
              </div>
              <div className="form-group form-check col-md-2 ml-5">
                <input
                  type="checkbox"
                  className="form-check-input"
                  id="credit"
                  checked={newGroup['credit']}
                  onChange={(e) => handleCheck(e)}
                />
                <label className="form-check-label" htmlFor="credit">
                  {t('pages.setting.credit')}
                </label>
              </div>
            </div>
            {props.mode === 'edit' && newGroup.title !== 'Standard' && (
              <div className="row mb-2">
                <div className="col-lg-3">
                  <button
                    className="btn btn-danger width-100-percent"
                    onClick={(e) => deleteGroup(e)}
                  >
                    {t('pages.setting.delete_group')}
                  </button>
                </div>
              </div>
            )}
            <div className="row ">
              <div className="col-lg-12 d-flex justify-content-end">
                <button className="btn btn-light mr-2" onClick={cancelForm}>
                  {t('information.Cancel')}
                </button>

                <button className="btn btn-success" onClick={submitForm}>
                  <i className="fa fa-save mr-2"></i> {t('information.Save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default connect((state) => ({
  groups: state.groups.groups
}))(AddGroup)
