import React, { useEffect, useState } from 'react'
import moment from 'moment'
import DatePicker from 'react-datepicker'
// import { useRouter } from 'next/router'

import { makeStyles, withStyles } from '@material-ui/core/styles'
import { green } from '@material-ui/core/colors'
import { toast } from 'react-toastify'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import DialogActions from '@material-ui/core/DialogActions'
import Button from '@material-ui/core/Button'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import { useConfirmationDialog } from '../../metronic/partials/modal/ConfirmationDialog'
import axios from '../../utils/axios'
import VehicleType from '../../../node-back/src/constants/VehicleTypes'
// import { uploadUrl } from '../../utils/utils'
import { useTranslation } from 'react-i18next'

const GreenCheckbox = withStyles({
  root: {
    color: green[400],
    '&$checked': {
      color: green[600]
    }
  },
  checked: {}
})((props) => <Checkbox color="default" {...props} />)

const PendingDriver = ({ driver, changeStatusSubHeader, updateVehicle }) => {
  const { t } = useTranslation()

  // const router = useRouter()
  const { isShowing, toggle } = useModal()
  const [isShowingReject, setIsShowingReject] = useState(false)
  const [driverInfo, setDriverInfo] = useState({
    vehicle: driver.vehicle,
    personalId: driver.personalId,
    drivingLicence: driver.drivingLicence,
    carInsurance: driver.carInsurance,
    status: driver.status,
    message: driver.message
  })
  useEffect(() => {
    setDriverInfo((prev) => ({ ...prev, status: driver.status }))
  }, [driver.status])

  const vehicle = driver.vehicle
  const [edit, setEdit] = useState(false)
  const [editDate, setEditDate] = useState(false)

  const updateInfo = (e, status = null) => {
    let data = status
      ? status === 'Approved'
        ? {
            ...driverInfo,
            personalId: { ...driverInfo.personalId, approved: true },
            drivingLicence: { ...driverInfo.drivingLicence, approved: true },
            vehicle: { ...driverInfo.vehicle, approved: true },
            carInsurance: { ...driverInfo.carInsurance, approved: true },
            status
          }
        : { ...driverInfo, status }
      : driverInfo
    if (!data.vehicle && !data.vehicle?.type && status === 'Approved') {
      toast.error('Vehicle type is require')
      return
    }

    axios
      .post(`admin/driver/update/${driver._id}`, { ...data })
      .then(({ data }) => {
        if (data.success) {
          toast.success(t('pages.drivers.driver_updated'))
          if (status) {
            changeStatusSubHeader(data.driver.status)
          }
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
  }
  const changeStatus = (status) => {
    if (
      !driverInfo.vehicle &&
      !driverInfo.vehicle?.type &&
      status === 'Approved'
    ) {
      toast.error('Vehicle type is require')
      return
    }
    setDriverInfo({ ...driverInfo, status })
    updateInfo(null, status)
  }
  const toggleReject = () => {
    setIsShowingReject(!isShowingReject)
  }
  const { getConfirmation } = useConfirmationDialog()
  const handleConfirmApprove = async () => {
    const confirmed = await getConfirmation({
      title: t('pages.setting.attention'),
      message: t('pages.drivers.message_approve_driver', {
        personalId: driverInfo.personalId?.id
      }),
      btnCancel: t('pages.setting.no'),
      btnConfirm: t('pages.setting.yes')
    })

    if (confirmed) {
      changeStatus('Approved')
    }
  }

  const handleVehicle = (event) => {
    // let vehicleSelect = event.target.name
    // let newVehicle = vehicle.find((v) => v.type === vehicleSelect)
    // let selectedDevices = driverInfo.vehicle.find(
    //   (vehicle) => vehicle.type == vehicleSelect
    // )
    //   ? driverInfo.vehicle.filter((d) => d.type !== vehicleSelect)
    //   : [
    //       ...driverInfo.vehicle,
    //       newVehicle ? newVehicle : { type: vehicleSelect }
    //     ]
    // setDriverInfo({
    //   ...driverInfo,
    //   vehicle: selectedDevices
    // })
    let vehicleSelect = event.target.name
    let newVehicle =
      vehicle?.type === vehicleSelect
        ? vehicle
        : { type: vehicleSelect, photos: [] }
    setDriverInfo({ ...driverInfo, vehicle: newVehicle })
    updateVehicle(newVehicle)
  }
  const actionModalReject = (confirm) => {
    if (confirm) {
      setDriverInfo({
        ...driverInfo,
        status: 'Rejected'
      })

      updateInfo(null, 'Rejected')
    }
  }

  const actionModalRecheck = (confirm) => {
    if (confirm) {
      setDriverInfo({
        ...driverInfo,
        status: 'Recheck'
      })
      updateInfo(null, 'Recheck')
    }
  }
  return (
    <div className="col-lg-8">
      <div className="card card-custom card-stretch gutter-b">
        <div className="card-header border-bottom pt-5">
          <h3 className="card-title font-weight-bolder ">
            {t('pages.drivers.application_details')}
          </h3>
        </div>
        <div className="card-body d-flex flex-column">
          {driverInfo.status === 'Documents Waiting' ? (
            <div>
              <p className="documentWaiting">
                {t('pages.drivers.awaiting_submission_documents')}
              </p>
            </div>
          ) : (
            <>
              <div className="row mb-5">
                <div className="float-left  p-3 pl-0 text-dark-75 font-weight-bolder font-size-lg">
                  {t('pages.drivers.VEHICLES')}
                </div>
                <div className="col-12">
                  {Object.keys(VehicleType).map((vehicle, index) => {
                    return (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={
                              driverInfo.vehicle
                                ? driverInfo.vehicle.type === vehicle
                                  ? true
                                  : false
                                : false
                            }
                            onChange={handleVehicle}
                            name={vehicle}
                            color="primary"
                          />
                        }
                        label={t(`pages.drivers.${vehicle}`)}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="row">
                <div className="col-12 text-dark-75 font-weight-bolder font-size-lg">
                  <span className="mr-2">
                    {t('pages.drivers.personal_id')}{' '}
                  </span>
                  <FormControlLabel
                    control={
                      <GreenCheckbox
                        checked={
                          driverInfo.personalId
                            ? driverInfo.personalId.approved
                            : false
                        }
                        onChange={(e) =>
                          setDriverInfo({
                            ...driverInfo,
                            personalId: {
                              ...driverInfo.personalId,
                              approved: e.target.checked
                            }
                          })
                        }
                        name="PersonalID"
                      />
                    }
                  />
                </div>
              </div>
              <div className="row">
                <div className="col-4 driver-personalID">
                  {edit ? (
                    <input
                      value={driverInfo.personalId?.id}
                      className="width-100"
                      onChange={(e) =>
                        setDriverInfo({
                          ...driverInfo,
                          personalId: {
                            ...driverInfo.personalId,
                            id: e.target.value
                          }
                        })
                      }
                      onBlur={() => setEdit(false)}
                    />
                  ) : (
                    <input
                      value={
                        driverInfo.personalId ? driverInfo.personalId.id : ''
                      }
                      className="input-edit"
                      readOnly={true}
                    />
                  )}
                  <a
                    className="fa fa-pen ml-3"
                    onClick={() => setEdit(true)}
                  ></a>
                </div>
                {driverInfo.personalId && (
                  <>
                    {driverInfo.personalId.frontPhoto && (
                      <div className="driver-photo col-3">
                        <img src={driverInfo.personalId.frontPhoto} />
                      </div>
                    )}
                    {driverInfo.personalId.rearPhoto && (
                      <div className="driver-photo col-3">
                        <img src={driverInfo.personalId.rearPhoto} />
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="row ">
                <div className="col-12 text-dark-75 font-weight-bolder font-size-lg">
                  <span className="mr-2">
                    {t('pages.drivers.driver_license')}
                  </span>
                  <FormControlLabel
                    control={
                      <GreenCheckbox
                        checked={
                          driverInfo.drivingLicence
                            ? driverInfo.drivingLicence.approved
                            : false
                        }
                        onChange={(e) =>
                          setDriverInfo({
                            ...driverInfo,
                            drivingLicence: {
                              ...driverInfo.drivingLicence,
                              approved: e.target.checked
                            }
                          })
                        }
                        name="Licence"
                      />
                    }
                  />
                </div>
                <div className="col-12">
                  <p className="pl-0 ">
                    {t('pages.drivers.expires_on')}{' '}
                    {editDate ? (
                      <DatePicker
                        dateFormat="yyyy-MM-dd"
                        onChange={(date) => {
                          setDriverInfo({
                            ...driverInfo,
                            drivingLicence: {
                              ...driverInfo.drivingLicence,
                              expire: date
                            }
                          })

                          setEditDate(false)
                        }}

                        // customInput={<CustomInput />}
                      />
                    ) : (
                      <input
                        value={
                          driverInfo.drivingLicence
                            ? moment(driverInfo.drivingLicence.expire).format(
                                'MMMM Do'
                              )
                            : ''
                        }
                        className="input-edit"
                        readOnly={true}
                      />
                    )}
                    <a
                      className="fa fa-pen ml-3"
                      onClick={() => setEditDate(true)}
                    ></a>
                  </p>
                  {driverInfo.drivingLicence && (
                    <img
                      className="driver-licence"
                      src={driverInfo.drivingLicence.frontPhoto}
                    />
                  )}
                </div>
              </div>

              <div className="row mt-3">
                <div className="col-12 text-dark-75 font-weight-bolder font-size-lg">
                  <span className="mr-2">
                    {t('pages.drivers.driver_vehicle')}
                  </span>
                  <FormControlLabel
                    control={
                      <GreenCheckbox
                        checked={
                          driverInfo.vehicle
                            ? driverInfo.vehicle.approved
                            : false
                        }
                        onChange={(e) =>
                          setDriverInfo({
                            ...driverInfo,
                            vehicle: {
                              ...driverInfo.vehicle,
                              approved: e.target.checked
                            }
                          })
                        }
                        name="vehicle"
                      />
                    }
                  />
                </div>
                <div className="mb-4 col-lg-6">
                  <p className="font-weight-bolder text-dark-75 font-size-lg">
                    {t('Table.columns.Make/model')}
                  </p>
                  <p className="font-size-lg">
                    {driverInfo.vehicle?.makeModel}
                  </p>
                </div>
                <div className="col-lg-6">
                  <p className="font-weight-bolder text-dark-75 font-size-lg">
                    {t('Table.columns.Plate')}
                  </p>
                  <p className="font-size-lg">{driverInfo.vehicle?.plate}</p>
                </div>
                <div className="mb-4 col-lg-6">
                  <p className="font-weight-bolder text-dark-75 font-size-lg">
                    {t('Table.columns.Year')}
                  </p>
                  <p className="font-size-lg">{driverInfo.vehicle?.year}</p>
                </div>
                <div className="col-lg-6">
                  <p className="font-weight-bolder text-dark-75 font-size-lg">
                    {t('pages.drivers.Color')}
                  </p>
                  <p className="font-size-lg">{driverInfo.vehicle?.color}</p>
                </div>
              </div>

              {driverInfo.vehicle?.photos?.length > 0 && (
                <div className="row">
                  {driverInfo.vehicle.photos.map((photo, index) => (
                    <div className="col-5 driver-vehicle-photo " key={index}>
                      <img src={photo} />
                    </div>
                  ))}
                </div>
              )}
              <div className="row mt-2 mb-5">
                <div className="col-12  text-dark-75 font-weight-bolder font-size-lg">
                  <span className="mr-2">
                    {t('pages.drivers.car_insurance')}
                  </span>
                  <FormControlLabel
                    control={
                      <GreenCheckbox
                        checked={
                          driverInfo.carInsurance
                            ? driverInfo.carInsurance.approved
                            : false
                        }
                        onChange={(e) =>
                          setDriverInfo({
                            ...driverInfo,
                            carInsurance: {
                              ...driverInfo.carInsurance,
                              approved: e.target.checked
                            }
                          })
                        }
                        name="Insurance"
                      />
                    }
                  />
                </div>
                {driverInfo.carInsurance && (
                  <a
                    className="col-12"
                    href={driverInfo.carInsurance.document}
                    target="_blank"
                  >
                    {t('pages.drivers.view_document')}
                  </a>
                )}
              </div>
              <div className="row mb-5 ">
                <DialogActions>
                  {driverInfo.status !== 'In Review' && (
                    <Button
                      color="primary"
                      variant="outlined"
                      onClick={() => changeStatus('In Review')}
                    >
                      {t('pages.drivers.set_in_review')}
                    </Button>
                  )}
                  <Button color="primary" variant="outlined" onClick={toggle}>
                    {t('pages.drivers.RECHECK')}
                  </Button>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={toggleReject}
                  >
                    {t('pages.drivers.REJECT')}
                  </Button>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={handleConfirmApprove}
                  >
                    {t('pages.drivers.APPROVE')}
                  </Button>
                  <Button
                    color="primary"
                    variant="outlined"
                    onClick={updateInfo}
                  >
                    {t('information.Update')}
                  </Button>
                </DialogActions>
                <BaseModal
                  isShowing={isShowingReject}
                  hide={toggleReject}
                  headerLeftButtons={t('pages.drivers.reject_driver')}
                  action={true}
                  btnCancel={t('information.Cancel')}
                  btnConfirm={t('information.Send')}
                  actionCallback={actionModalReject}
                >
                  <textarea
                    className="form-control"
                    rows="4"
                    cols="50"
                    placeholder={t('pages.drivers.reject_reason')}
                    onChange={(e) =>
                      setDriverInfo({
                        ...driverInfo,
                        message: {
                          ...driverInfo.message,
                          reject: e.target.value
                        }
                      })
                    }
                  ></textarea>
                </BaseModal>
                <BaseModal
                  isShowing={isShowing}
                  hide={toggle}
                  headerLeftButtons={t('pages.drivers.recheck_information')}
                  action={true}
                  btnCancel={t('information.Cancel')}
                  btnConfirm={t('information.Send')}
                  actionCallback={actionModalRecheck}
                >
                  <textarea
                    className="form-control"
                    rows="4"
                    cols="50"
                    placeholder={t(
                      'pages.drivers.enter_instructions_driver_resend_documents'
                    )}
                    onChange={(e) =>
                      setDriverInfo({
                        ...driverInfo,
                        message: {
                          ...driverInfo.message,
                          recheck: e.target.value
                        }
                      })
                    }
                  ></textarea>
                </BaseModal>
                {driverInfo.message && (
                  <div className="p-3">
                    {driverInfo.status === 'Rejected' &&
                      driverInfo.message.reject && (
                        <p>
                          <span className="font-weight-bold">
                            Reject Reason :{' '}
                          </span>
                          {driverInfo.message.reject}
                        </p>
                      )}
                    {driverInfo.status === 'Recheck' &&
                      driverInfo.message.recheck && (
                        <p>
                          <span className="font-weight-bold">Recheck : </span>
                          {driverInfo.message.recheck}
                        </p>
                      )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default PendingDriver
