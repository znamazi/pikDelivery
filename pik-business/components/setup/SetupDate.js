import React, { useState, useEffect } from 'react'
import { Alert } from '@material-ui/lab'
import moment from 'moment'
import DatePicker from 'react-datepicker'
import SelectHours from './SelectHours'
import { Checkbox, FormControlLabel, Button } from '@material-ui/core'
import { makeStyles, withStyles } from '@material-ui/core/styles'
import { PaginationLinks } from 'metronic/partials/controls'
import ButtonSearch from 'metronic/partials/ButtonSearch'
import { diffHours, diffDays } from 'utils/utils'
import { useSetupState } from './context'
import { hours } from './HourArray'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

const useStyles = makeStyles((theme) => ({
  submit: {
    margin: theme.spacing(3, 0, 2),
    float: 'right'
  }
}))
const PrimaryCheckbox = withStyles({
  root: {
    color: '#f1962b',
    '&$checked': {
      color: '#f1962b'
    }
  },
  checked: {}
})((props) => <Checkbox color="default" {...props} />)
const CustomInput = React.forwardRef((props, ref) => (
  <div
    style={{
      borderBottom: '1px solid gray',
      padding: '10px 9px 20px 9px'
    }}
    onClick={props.onClick}
  >
    {props.value}
    <i className="fa fa-calendar-alt float-right"></i>
  </div>
))
const CustomInputSearch = React.forwardRef((props, ref) => {
  const { t } = useTranslation()

  return (
    <div onClick={props.onClick}>
      <ButtonSearch />
      {t('pages.business.search_date')} {props.value}
    </div>
  )
})
const SetupDate = (props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  useEffect(() => {
    if (props.cleanError) setError('')
  }, [props.cleanError])

  const { state, dispatch } = useSetupState()
  const [error, setError] = useState('')

  const [customTimeFrames, setCustomTimeFrames] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchDate, setSearchDate] = useState('')
  const [searchResult, setSearchResult] = useState([])

  let paginationOptions = {
    totalSize:
      searchResult.length > 0
        ? searchResult.length
        : state.customTimeFrames.length,
    sizePerPage: 3,
    paginationSize: 3,
    page: currentPage - 1,
    onPageChange: (e) =>
      loadList(
        e,
        searchResult.length > 0 ? searchResult : state.customTimeFrames
      )
  }

  const loadList = (currentPage, data) => {
    setCurrentPage(currentPage)
    let begin = (currentPage - 1) * paginationOptions.sizePerPage
    let end = begin + paginationOptions.sizePerPage
    let contentPage = data.slice(begin, end)
    setCustomTimeFrames(contentPage)
  }

  useEffect(() => {
    loadList(1, searchResult.length > 0 ? searchResult : state.customTimeFrames)
  }, [state.customTimeFrames, searchResult])

  const handleSearchDate = (selectedDate) => {
    setSearchDate(selectedDate)
    const date = moment(selectedDate).format('YYYY-MM-DD')
    let searchResult = state.customTimeFrames.filter((item) =>
      date >= moment(item.from).format('YYYY-MM-DD') &&
      date <= new moment(item.to).format('YYYY-MM-DD')
        ? true
        : false
    )
    searchResult = searchResult.length > 0 ? searchResult : ['Not Found']
    setSearchResult(searchResult)
  }

  const handleChangeStart = (selectedDate) => {
    dispatch({
      type: 'UPDATE_DATE',
      payload: {
        fieldName: 'from',
        value: selectedDate
      }
    })
  }
  const handleChangeEnd = (selectedDate) => {
    dispatch({
      type: 'UPDATE_DATE',
      payload: {
        fieldName: 'to',
        value: selectedDate
      }
    })
  }

  const addCustomDate = (e) => {
    setError('')
    props.changeClearError()
    let from = moment(state.date.from).format('YYYY-MM-DD')
    let to = moment(state.date.to).format('YYYY-MM-DD')
    if (diffDays(state.date.to) < 0 || diffHours(state.date.from) < 0) {
      setError(t('errors.custom_date_not_valid'))
      return
    }
    if (to < from) {
      setError(t('errors.custom_date_not_valid'))
      return
    }
    if (
      !state.date.totallyClosed &&
      (state.date.open === '00:00' || state.date.close === '00:00')
    ) {
      setError(t('errors.set_open_close_hours'))
      return
    }
    let conflict = state.customTimeFrames.filter((item) => {
      let itemFrom = moment(item.from).format('YYYY-MM-DD')
      let itemTo = moment(item.to).format('YYYY-MM-DD')
      return (
        (moment(from).isSameOrAfter(itemFrom) &&
          moment(from).isSameOrBefore(itemTo)) ||
        (moment(to).isSameOrAfter(itemFrom) &&
          moment(to).isSameOrBefore(itemTo))
      )
    })
    if (conflict && conflict.length > 0) {
      setError(t('errors.custom_date_overlap'))
      return
    }
    dispatch({
      type: 'UPDATE_CUSTOM_TIME_FRAMES',
      payload: state.date
    })
  }
  const removeCustomDate = (indexRemove) => {
    let newData = state.customTimeFrames.filter(
      (item) => item.id != indexRemove
    )
    dispatch({
      type: 'REMOVE_CUSTOM_TIME_FRAMES',
      payload: { newData, deletedId: indexRemove }
    })
  }
  const changeTotally = (e) => {
    dispatch({
      type: 'UPDATE_DATE',
      payload: {
        fieldName: 'totallyClosed',
        value: e.target.checked
      }
    })
  }

  let liContent = customTimeFrames.map((item, index) => {
    let openAt = hours.find((elm) => elm.value == item.open)
    let closedAt = hours.find((elm) => elm.value == item.close)
    return item === 'Not Found' ? (
      <li className="list-unstyled" key={index}>
        <div className="row border-bottom mr-15 mt-2  pb-3">
          <div className="col-9 text-center font-weight-bold p-5"> {item}</div>
        </div>
      </li>
    ) : (
      <li
        className="list-unstyled"
        key={index}
        style={{
          opacity: diffDays(item.to) >= 0 ? 1 : 0.4
        }}
      >
        <div className="row border-bottom mr-15 mt-2  pb-3">
          <div className="col-lg-12">
            <div>
              <span>
                <strong>{t('information.from')}:</strong>{' '}
                {moment(item['from']).format('DD/MM/YYYY')}
              </span>
              <span className="ml-5">
                <strong>{t('information.to')}:</strong>{' '}
                {moment(item['to']).format('DD/MM/YYYY')}
              </span>
            </div>
            <div className="mt-3">
              {!item['totallyClosed'] && (
                <>
                  <span>
                    <strong>{t('information.open')}: </strong>
                    {openAt.label}
                  </span>
                  <span className="ml-5">
                    <strong>{t('information.close_at')}: </strong>
                    {closedAt.label}
                  </span>
                </>
              )}
              {item['totallyClosed'] && (
                <span>
                  <strong>{t('information.totally_closed')}</strong>
                </span>
              )}
            </div>
            {diffDays(item.to) >= 0 && (
              <span
                className="fa fa-times float-right text-danger "
                style={{ position: 'absolute', bottom: '5px', right: '10px' }}
                onClick={() => {
                  setSearchResult([])
                  setSearchDate('')
                  removeCustomDate(item.id)
                }}
              ></span>
            )}
          </div>
        </div>
      </li>
    )
  })

  return (
    <div className="col-lg-7">
      <div className="row">
        <div className="col-lg-12 mb-5">
          {error && <Alert severity="error">{error}</Alert>}
        </div>
      </div>
      <strong>{t('pages.business.special_dates')}</strong>
      <p className="pt-3">{t('pages.business.overwrite_schedule')}</p>
      <div className="row">
        <div className="col-lg-4">
          <DatePicker
            dateFormat="yyyy-MM-dd"
            selected={state.date.from}
            onChange={handleChangeStart}
            customInput={<CustomInput />}
          />
        </div>
        <div className="col-lg-4">
          <DatePicker
            dateFormat="yyyy-MM-dd"
            selected={state.date.to}
            onChange={handleChangeEnd}
            customInput={<CustomInput />}
          />
        </div>
        <div className="col-lg-4 d-flex">
          <FormControlLabel
            control={
              <PrimaryCheckbox
                checked={state.date.totallyClosed}
                value={state.date.totallyClosed}
                onChange={(event) => changeTotally(event)}
              />
            }
            label={t('information.closed')}
          />
        </div>
      </div>
      <div className="row mt-4">
        <SelectHours type="open" parent="date" defaultHour="08:00" />
        <SelectHours type="close" parent="date" defaultHour="18:00" />
        <div className="col-lg-4 d-flex justify-content-center mt-2">
          <button
            className="btn btn-primary float-right width-100-percent"
            onClick={(e) => {
              setSearchResult([])
              setSearchDate('')
              addCustomDate(e)
            }}
          >
            {t('information.add')}
          </button>
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-lg-12">
          <div className="quick-search" id="kt_quick_search_dropdown">
            <div className="quick-search-form">
              <div className="input-group-2">
                <DatePicker
                  dateFormat="yyyy-MM-dd"
                  selected={searchDate}
                  placeholderText={t('pages.business.search_date')}
                  onChange={handleSearchDate}
                  customInput={<CustomInputSearch />}
                  className="width-70-percent"
                />
                <div className="input-group-append">
                  <span className="input-group-text">
                    {searchDate && (
                      <i
                        className="fa fa-times"
                        onClick={() => {
                          setSearchResult([])
                          setSearchDate('')
                        }}
                      ></i>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <ul>{liContent}</ul>
          <PaginationLinks paginationProps={paginationOptions} />
        </div>
      </div>
    </div>
  )
}

export default SetupDate
