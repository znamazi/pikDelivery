import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import Checkbox from '@material-ui/core/Checkbox'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Table from '../../metronic/dataTable/Table'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import VehicleType from '../../../node-back/src/constants/VehicleTypes'
import { useTranslation } from 'react-i18next'
import actions from 'store/actions'
import { connect } from 'react-redux'
import moment from 'moment'

const DateColumnFormatter = (cellContent, row) => {
  return <span>{moment(row.date).format('LL')}</span>
}
const Others = (props) => {
  const { t } = useTranslation()

  const [document, setDocuments] = useState([])
  const [showModalDoc, setShowModalDoc] = useState(false)
  const [infoModal, setInfoModal] = useState()
  const [showFront, setShowFront] = useState(true)
  const toggleShowModalDoc = () => {
    setShowModalDoc(!showModalDoc)
  }

  useEffect(() => {
    setDocuments([
      {
        ...props.driver.personalId,
        id: `personalId_${props.driver._id}`,
        value: props.driver.personalId.id,
        src: props.driver.personalId.frontPhoto,
        src2: props.driver.personalId.rearPhoto,
        type: 'Personal ID',
        date: props.driver.personalId.createdAt,
        uploaded: 'Recruitment Form'
      },
      {
        ...props.driver.drivingLicence,
        id: `drivingLicence_${props.driver._id}`,
        src: props.driver.drivingLicence.frontPhoto,
        value: `Expire: ${moment(props.driver.drivingLicence.expire).format(
          'DD/MM/YYYY'
        )}`,
        type: 'Driving Licence',
        date: props.driver.drivingLicence.createdAt,
        uploaded: 'Recruitment Form'
      },
      {
        ...props.driver.carInsurance,
        id: `carInsurance_${props.driver._id}`,
        src: props.driver.carInsurance.document,
        type: 'Car Insurance',
        date: props.driver.carInsurance.createdAt,
        uploaded: 'Recruitment Form'
      }
    ])
  }, [])

  const columns = [
    {
      dataField: 'type',
      text: t('Table.columns.type'),
      sort: false
    },
    {
      dataField: 'date',
      text: t('Table.columns.date'),
      sort: false,
      formatter: DateColumnFormatter
    },
    {
      dataField: 'uploaded',
      text: t('Table.columns.Uploaded_By'),
      sort: false
    }
  ]
  const columnsBankAccount = [
    {
      dataField: 'accountBank',
      text: t('Table.columns.Bank'),
      sort: false
    },
    {
      dataField: 'accountNumber',
      text: t('Table.columns.Account'),
      sort: false,
      headerStyle: () => {
        return { width: '150px' }
      }
    },
    {
      dataField: 'accountType',
      text: t('Table.columns.type'),
      sort: false
    },
    {
      dataField: 'accountName',
      text: t('Table.columns.name'),
      sort: false
    },
    {
      dataField: 'updatedAt',
      text: t('Table.columns.last_edit'),
      sort: false,
      formatter: (cellContent, row) => {
        return (
          <div className="d-flex align-items-center">
            {moment(row.updatedAt).format('DD/MM/YYYY')}
          </div>
        )
      }
    }
  ]

  const onClickRow = (row) => {
    let info = document.find((v) => row.id === v.id)
    setInfoModal(info)
    toggleShowModalDoc()
  }
  return (
    <>
      <div className="row mb-10">
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
                      props.driver.vehicle &&
                      props.driver.vehicle.type === vehicle
                        ? true
                        : false
                    }
                    // onChange={handleVehicle}
                    name={vehicle}
                    color="primary"
                    disabled
                  />
                }
                label={t(`pages.drivers.${vehicle}`)}
              />
            )
          })}
        </div>
      </div>

      <div className=" float-left mb-5  text-dark-75 font-weight-bolder font-size-lg">
        {t('pages.drivers.Documents')}
      </div>
      <DTUIProvider>
        <DataTableContexts.Provider
          value={{
            columns: columns,
            entities: document,
            showButtonFilter: false,
            showPagination: false,
            onClickRow: (row) => onClickRow(row),
            callBack: (value) =>
              !isEqual(value, props.queryParams)
                ? props.updateQueryParams(value)
                : ''
          }}
        >
          <Table
            component="queryParams"
            actionDisptachFilter="UPDATE_QUERY_PARAMS"
          />
        </DataTableContexts.Provider>
      </DTUIProvider>
      <BaseModal
        isShowing={showModalDoc}
        hide={toggleShowModalDoc}
        headerLeftButtons={t('pages.drivers.document')}
      >
        {infoModal && (
          <div>
            <p>
              {infoModal.type}
              <span className="ml-2 font-weight-bolder">{infoModal.value}</span>
            </p>
            {infoModal.type !== 'Personal ID' && <img src={infoModal.src} />}
            {infoModal.type == 'Personal ID' && (
              <div className="d-flex justify-content-center align-items-center">
                {!showFront && (
                  <i
                    className="fa fa-arrow-alt-circle-left"
                    onClick={() => setShowFront(!showFront)}
                  ></i>
                )}
                {showFront && <img src={infoModal.src} />}
                {!showFront && <img src={infoModal.src2} />}
                {showFront && (
                  <i
                    className="fa fa-arrow-alt-circle-right"
                    onClick={() => setShowFront(!showFront)}
                  ></i>
                )}
              </div>
            )}
          </div>
        )}
      </BaseModal>

      <div className="border-bottom p-5 m-4"></div>
      <div className=" float-left  mt-5 mb-5 text-dark-75 font-weight-bolder font-size-lg">
        {t('pages.drivers.banck_account')}
      </div>
      <DTUIProvider>
        <DataTableContexts.Provider
          value={{
            columns: columnsBankAccount,
            entities: props.driver.bankAccount,
            showButtonFilter: false,
            showPagination: false,
            callBack: (value) =>
              !isEqual(value, props.queryParams)
                ? props.updateQueryParams(value)
                : ''
          }}
        >
          <Table
            component="queryParams"
            actionDisptachFilter="UPDATE_QUERY_PARAMS"
          />
        </DataTableContexts.Provider>
      </DTUIProvider>
    </>
  )
}

export default connect(
  (state) => ({
    queryParams: state.queryParams.queryParams
  }),
  (dispatch) => ({
    updateQueryParams: (queryParams) => {
      dispatch({
        type: actions.UPDATE_QUERY_PARAMS,
        payload: queryParams
      })
    }
  })
)(Others)
