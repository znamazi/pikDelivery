import React, { useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import { makeStyles } from '@material-ui/core/styles'
import { toast } from 'react-toastify'

import TextField from '@material-ui/core/TextField'
import Radio from '@material-ui/core/Radio'
import FormControlLabel from '@material-ui/core/FormControlLabel'

import RadioGroup from '@material-ui/core/RadioGroup'
import axios from '../../utils/axios'
import { DTUIProvider } from '../../metronic/dataTable/DTUIContext'
import Table from '../../metronic/dataTable/Table'
import { sortCaret, headerSortingClasses } from '../../metronic/_helpers'
import DataTableContexts from '../../metronic/contexts/DataTableContexts'
import useModal from '../../metronic/partials/modal/useModal'
import BaseModal from '../../metronic/partials/modal/BaseModal'
import { useTranslation } from 'react-i18next'
import actions from 'store/actions'
import { connect } from 'react-redux'
const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      margin: theme.spacing(1),
      width: '25ch'
    }
  }
}))
const AmountColumnFormatter = (cellContent, row) => {
  return (
    <span>
      <strong>$ </strong> {row.amount ? row.amount.toFixed(2) : ''}
    </span>
  )
}
const DateColumnFormatter = (cellContent, row) => {
  return (
    <span>
      <strong>{row.date} </strong>
    </span>
  )
}

const ActionColumnFormatter = (cellContent, row) => {
  return <button className="btn btn-danger">Cancel</button>
}

const BalanceDetails = (props) => {
  const classes = useStyles()
  const { t } = useTranslation()

  const [customValue, setCustomValue] = useState([])
  const { isShowing, toggle } = useModal()
  const [values, setValues] = useState({
    description: '',
    amount: '',
    sign: ''
  })

  const cancelCustomValue = (id) => {
    axios
      .post(`admin/driver/deleteCustomValue/${id}`)
      .then(({ data }) => {
        if (data.success) {
          let newData = customValue.filter((item) => item._id != id)
          setCustomValue(newData)
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
  const handleChangeSign = (event) => {
    setValues({ ...values, sign: event.target.value })
  }
  const handleChange = (prop) => (event) => {
    setValues({ ...values, [prop]: event.target.value })
  }

  useEffect(() => {
    const date = moment(props.week).format('YYYY-MM-DD')
    axios
      .post(`admin/driver/customValue/${props.driverId}/${date}`)
      .then(({ data }) => {
        if (data.success) {
          setCustomValue(data.customValue)
          setTotalCount(data.totalCount)
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
  const columns = [
    {
      dataField: 'date',
      text: t('Table.columns.date'),
      sort: false,
      formatter: DateColumnFormatter
    },
    {
      dataField: 'countOrder',
      text: t('Table.columns.orders'),
      sort: false
    },
    {
      dataField: 'amount',
      text: t('Table.columns.Amount'),
      sort: false,
      formatter: AmountColumnFormatter
    }
  ]
  const columnsCustom = [
    {
      dataField: 'description',
      text: t('Table.columns.Description'),
      sort: false,
      headerStyle: (colum, colIndex) => {
        return { width: '200px' }
      }
    },
    {
      dataField: 'amount',
      text: t('Table.columns.Amount'),
      sort: false,
      formatter: (cellContent, row) => {
        return <span>{row.amount.toFixed(2)}</span>
      }
    },
    {
      dataField: 'admin.name',
      text: t('Table.columns.Added_By'),
      sort: false
    },
    {
      dataField: 'action',
      text: t('Table.columns.Action'),
      sort: false,
      formatter: ActionColumnFormatter,
      events: {
        onClick: (e, column, columnIndex, row, rowIndex) => {
          cancelCustomValue(row._id)
        }
      }
    }
  ]
  const addNewValue = (confirm) => {
    if (confirm) {
      if (values.amount == '' || isNaN(values.amount)) {
        return
      }
      const amount =
        values.sign === 'negative'
          ? -Math.abs(values.amount)
          : Math.abs(values.amount)

      const date = moment(props.week).format('YYYY-MM-DD')
      let data = {
        ...values,
        date,
        amount,
        driverId: props.driverId
      }
      axios
        .post(`admin/driver/customValue/add`, data)
        .then(({ data }) => {
          if (data.success) {
            setCustomValue([...customValue, data.customValue])
            setValues({ description: '', amount: '', sign: '' })
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
    } else {
      setValues({ description: '', amount: '', sign: '' })
    }
  }
  return (
    <>
      <div className="col-3 float-left mb-5 p-3 pl-0">
        <a onClick={props.backClick}>
          <i className="fa fa-angle-left mr-2"></i> {t('pages.common.Back')}
        </a>
      </div>
      <div className=" float-right mb-5">
        <button className="btn btn-primary" onClick={toggle}>
          {t('pages.drivers.add_value')}
        </button>
      </div>
      <DTUIProvider>
        <DataTableContexts.Provider
          value={{
            columns: columns,
            entities: props.data,
            showButtonFilter: false,
            showPagination: false,
            callBack: (value) => ''
          }}
        >
          <Table
            component="queryParams"
            actionDisptachFilter="UPDATE_QUERY_PARAMS"
          />
        </DataTableContexts.Provider>
      </DTUIProvider>
      <BaseModal
        isShowing={isShowing}
        hide={toggle}
        headerLeftButtons={t('pages.drivers.add_value')}
        action={true}
        actionCallback={(confirm) => addNewValue(confirm)}
      >
        <form className={classes.root}>
          <TextField
            id="description"
            label={t('Table.columns.Description')}
            fullWidth
            value={values.description}
            onChange={handleChange('description')}
          />
          <div className="space-between">
            <TextField
              id="amount"
              label={t('pages.drivers.Value')}
              value={values.amount}
              onChange={handleChange('amount')}
            />
            <RadioGroup
              aria-label="sign"
              name="sign"
              row
              value={values.sign}
              onChange={handleChangeSign}
            >
              <FormControlLabel
                value="negative"
                id="sign"
                control={<Radio />}
                label={t('pages.drivers.negative')}
              />
              <FormControlLabel
                value="positive"
                id="sign"
                control={<Radio />}
                label={t('pages.drivers.positive')}
              />
            </RadioGroup>
          </div>
        </form>
      </BaseModal>
      <div className="border-bottom p-5 m-4"></div>
      <div className="col-3 float-left  mt-5 mb-5 text-dark-75 font-weight-bolder font-size-lg">
        {t('pages.drivers.custom_values')}
      </div>
      <DTUIProvider>
        <DataTableContexts.Provider
          value={{
            columns: columnsCustom,
            entities: customValue,
            showButtonFilter: false,
            showPagination: false,
            callBack: (value) => ''
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
)(BalanceDetails)
