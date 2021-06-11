import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import { useConfirmationDialog } from '../../../metronic/partials/modal/ConfirmationDialog'
import axios from '../../../utils/axios'
import { Alert } from '@material-ui/lab'
import { useTranslation } from 'react-i18next'
import PermissionDenied from '../../partials/PermissionDenied'

const AddFee = (props) => {
  const [error, setError] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)
  const { t } = useTranslation()

  const [newFee, setNewFee] = useState({
    cancelFee: '',
    returnFee: '',
    itbms: '',
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
  const router = useRouter()
  const { id } = router.query
  const { getConfirmation } = useConfirmationDialog()

  useEffect(() => {
    axios
      .get(`admin/setting/fee`)
      .then(({ data }) => {
        console.log('data', data)
        if (data.success) {
          setNewFee(data.fee.value)
        } else {
          if (data.message == 'Permission denied') setPermissionDenied(true)
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

  const handleData = (e) => {
    let fieldName = e.target.id
    setNewFee({ ...newFee, [fieldName]: e.target.value })
  }

  const cancelForm = () => {
    setNewFee({
      cancelFee: '',
      returnFee: '',
      pikCommission: '',
      itbms: '',
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
    const { cancelFee, pikCommission, prices, returnFee, itbms } = newFee
    setError('')
    axios
      .post('admin/setting/fee', {
        cancelFee,
        pikCommission,
        prices,
        returnFee,
        itbms
      })
      .then(({ data }) => {
        if (data.success) {
          toast.success(t('pages.setting.fee_created_successfuly'))
          router.push({ pathname: '/settings', query: { tab: 2 } })
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
        title: newFee.title
      })
    })

    if (confirmed) {
      axios
        .post(`admin/setting/fee/delete/${id}`)
        .then(({ data }) => {
          if (data.success) {
            toast.success(t('pages.setting.fee_deleted_successfuly'))
            router.push({ pathname: '/settings', query: { tab: 2 } })
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
  console.log({ permissionDenied })
  return permissionDenied ? (
    <PermissionDenied />
  ) : (
    <>
      <div className="col-lg-12">
        {error && <Alert severity="error">{error}</Alert>}
      </div>
      <div className="row">
        <div className="col-md-6">
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="user">{t('pages.setting.cancel_fee')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="cancelFee"*/}
          {/*    value={newFee['cancelFee']}*/}
          {/*    onChange={(e) => handleData(e)}*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="emial">{t('pages.setting.return_fee')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="returnFee"*/}
          {/*    value={newFee['returnFee']}*/}
          {/*    onChange={(e) => handleData(e)}*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="password">{t('pages.setting.pik_comission')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="pikCommission"*/}
          {/*    value={newFee['pikCommission']}*/}
          {/*    onChange={(e) => handleData(e)}*/}
          {/*  />*/}
          {/*</div>*/}
          <div className="form-group col-md-12">
            <label htmlFor="user">{t('pages.setting.tax')}</label>
            <input
              type="text"
              className="form-control"
              id="itbms"
              value={newFee['itbms']}
              onChange={(e) => handleData(e)}
            />
          </div>
        </div>
        <div className="col-md-6">
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="name">{t('pages.setting.moto_base_price')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="motoBasePrice"*/}
          {/*    value={newFee.prices?.Motorcycle?.basePrice}*/}
          {/*    onChange={(e) =>*/}
          {/*      setNewFee({*/}
          {/*        ...newFee,*/}
          {/*        prices: {*/}
          {/*          ...newFee.prices,*/}
          {/*          Motorcycle: {*/}
          {/*            ...newFee.prices?.Motorcycle,*/}
          {/*            basePrice: e.target.value*/}
          {/*          }*/}
          {/*        }*/}
          {/*      })*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="user">{t('pages.setting.moto_km_price')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="motoKMPrice"*/}
          {/*    value={newFee.prices?.Motorcycle?.kmPrice}*/}
          {/*    onChange={(e) =>*/}
          {/*      setNewFee({*/}
          {/*        ...newFee,*/}
          {/*        prices: {*/}
          {/*          ...newFee.prices,*/}
          {/*          Motorcycle: {*/}
          {/*            ...newFee.prices?.Motorcycle,*/}
          {/*            kmPrice: e.target.value*/}
          {/*          }*/}
          {/*        }*/}
          {/*      })*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="name">{t('pages.setting.car_base_price')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="carBasePrice"*/}
          {/*    value={newFee.prices?.Car?.basePrice}*/}
          {/*    onChange={(e) =>*/}
          {/*      setNewFee({*/}
          {/*        ...newFee,*/}
          {/*        prices: {*/}
          {/*          ...newFee.prices,*/}
          {/*          Car: {*/}
          {/*            ...newFee.prices?.Car,*/}
          {/*            basePrice: e.target.value*/}
          {/*          }*/}
          {/*        }*/}
          {/*      })*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="user">{t('pages.setting.car_km_price')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="carKMPrice"*/}
          {/*    value={newFee.prices?.Car?.kmPrice}*/}
          {/*    onChange={(e) =>*/}
          {/*      setNewFee({*/}
          {/*        ...newFee,*/}
          {/*        prices: {*/}
          {/*          ...newFee.prices,*/}
          {/*          Car: {*/}
          {/*            ...newFee.prices?.Car,*/}
          {/*            kmPrice: e.target.value*/}
          {/*          }*/}
          {/*        }*/}
          {/*      })*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="name">{t('pages.setting.pickup_base_price')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="pickupBasePrice"*/}
          {/*    value={newFee.prices?.Pickup?.basePrice}*/}
          {/*    onChange={(e) =>*/}
          {/*      setNewFee({*/}
          {/*        ...newFee,*/}
          {/*        prices: {*/}
          {/*          ...newFee.prices,*/}
          {/*          Pickup: {*/}
          {/*            ...newFee.prices?.Pickup,*/}
          {/*            basePrice: e.target.value*/}
          {/*          }*/}
          {/*        }*/}
          {/*      })*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
          {/*<div className="form-group col-md-12">*/}
          {/*  <label htmlFor="user">{t('pages.setting.pickup_km_price')}</label>*/}
          {/*  <input*/}
          {/*    type="text"*/}
          {/*    className="form-control"*/}
          {/*    id="pickupKMPrice"*/}
          {/*    value={newFee.prices?.Pickup?.kmPrice}*/}
          {/*    onChange={(e) =>*/}
          {/*      setNewFee({*/}
          {/*        ...newFee,*/}
          {/*        prices: {*/}
          {/*          ...newFee.prices,*/}
          {/*          Pickup: {*/}
          {/*            ...newFee.prices?.Pickup,*/}
          {/*            kmPrice: e.target.value*/}
          {/*          }*/}
          {/*        }*/}
          {/*      })*/}
          {/*    }*/}
          {/*  />*/}
          {/*</div>*/}
        </div>
      </div>

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
    </>
  )
}

export default AddFee
