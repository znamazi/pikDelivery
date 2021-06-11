import React, { useState } from 'react'
import moment from 'moment'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import { useTranslation } from 'react-i18next'

const Vehicles = () => {
  const { t } = useTranslation()

  const { isShowing, toggle } = useModal()
  const [infoModal, setInfoModal] = useState()
  const vehicle = [
    {
      id: 3,
      make: 'toyota / prius',
      year: 2003,
      plate: 'da3513',
      status: 'Pending',
      actions: '',
      createdAt: '2020-10-05',
      color: 'green'
    },
    {
      id: 2,
      make: 'toyota / prius',
      year: 2005,
      plate: 'da3513',
      status: 'Active',
      actions: '',
      createdAt: '2020-10-05',
      color: 'red'
    }
  ]
  const rejectVehicle = () => {
    // TODO
  }
  const ActionVehicle = () => {
    return (
      <>
        <button className="btn btn-danger mr-5" onclick={rejectVehicle}>
          {t('pages.drivers.Reject')}
        </button>
        <button
          className={`btn btn-${
            infoModal.status === 'Pending' ? 'warning' : 'success'
          }`}
        >
          {t(`status.${infoModal.status}`)}
        </button>
      </>
    )
  }

  return (
    <div className="table-responsive col-12">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <td>{t('Table.columns.id')}</td>
            <td>{t('Table.columns.Make/model')}</td>
            <td>{t('Table.columns.Year')}</td>
            <td>{t('Table.columns.Plate')}</td>
            <td>{t('Table.columns.status')}</td>
            <td>{t('Table.columns.Action')}</td>
          </tr>
        </thead>
        <tbody>
          {vehicle.map((item, index) => (
            <tr
              key={index}
              onClick={() => {
                let info = vehicle.find((v) => item.id === v.id)
                setInfoModal(info)
                toggle()
              }}
            >
              <td>{item.id}</td>
              <td>{item.make}</td>
              <td>{item.year}</td>
              <td>{item.plate}</td>
              <td>{item.status}</td>
              <td>
                <i className="fa fa-eye"></i>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <BaseModal
        isShowing={isShowing}
        hide={toggle}
        headerLeftButtons={t('pages.drivers.vehicle_information')}
        HeaderRightButtons={ActionVehicle}
        theme="light"
      >
        {infoModal && (
          <>
            <div className="row">
              <div className="mb-6 col-lg-6">
                <p className="font-weight-bolder text-dark-75 font-size-lg">
                  {t('Table.columns.Make/model')}
                </p>
                <p className="font-size-lg">{infoModal.make}</p>
              </div>
              <div className="col-lg-6">
                <p className="font-weight-bolder text-dark-75 font-size-lg">
                  {t('Table.columns.Make/Plate')}
                </p>
                <p className="font-size-lg">{infoModal.plate}</p>
              </div>
              <div className="mb-6 col-lg-6">
                <p className="font-weight-bolder text-dark-75 font-size-lg">
                  {t('Table.columns.Year')}
                </p>
                <p className="font-size-lg">{infoModal.year}</p>
              </div>
              <div className="col-lg-6">
                <p className="font-weight-bolder text-dark-75 font-size-lg">
                  {t('pages.drivers.Color')}
                </p>
                <p className="font-size-lg">{infoModal.color}</p>
              </div>
              <div className="mb-6 col-lg-6">
                <p className="font-weight-bolder text-dark-75 font-size-lg">
                  {t('pages.drivers.vehicle_insurance')}
                </p>
                <p className="font-size-lg">
                  <a>{t('pages.drivers.view_document')}</a>
                </p>
              </div>
              <div className="col-lg-6">
                <p className="font-weight-bolder text-dark-75 font-size-lg">
                  {t('pages.drivers.date_registered')}
                </p>
                <p className="font-size-lg">
                  {moment(infoModal.createdAt).format('DD/MM/YYYY')}
                </p>
              </div>
            </div>
            <div className="row">
              <div className="col-12">
                <p>{t('pages.drivers.payment_method')}</p>
              </div>
            </div>
          </>
        )}
      </BaseModal>
    </div>
  )
}

export default Vehicles
