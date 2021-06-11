import React, { useMemo, useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { useDTUIContext } from './DTUIContext'
import { useTranslation } from 'react-i18next'

const Filter = ({
  listLoading,
  filter,
  showButtonFilter,
  Tools,
  changeStatus,
  changeTypeStatus
}) => {
  const { t } = useTranslation()

  useEffect(() => {
    if (changeStatus) {
      setValues({ ...values, status: '' })
    }
  }, [changeStatus])

  let initialValues = {}
  filter.forEach((item) => {
    initialValues = { ...initialValues, [item.name]: '' }
  })
  const [values, setValues] = useState(initialValues)

  // DT UI Context
  const DTUIContext = useDTUIContext()
  const DTUIProps = useMemo(() => {
    return {
      queryParams: DTUIContext.queryParams,
      setQueryParams: DTUIContext.setQueryParams
    }
  }, [DTUIContext])

  const prepareFilter = (queryParams, filterData) => {
    let newQueryParams = { ...queryParams }
    const filter = {}
    filterData.forEach((item) => {
      if (item.type == 'date') {
        filter[item.name] = values[item.name]
          ? moment(values[item.name]).format('YYYY-MM-DD')
          : ''
      } else {
        if (item.name === 'status' && !values[item.name]) {
          filter[item.name] = newQueryParams.filter.status
        } else if (item.name === 'status' && values[item.name] === 'All') {
          filter[item.name] = ''
        } else filter[item.name] = values[item.name]
      }
    })
    newQueryParams = {
      ...newQueryParams,
      filter: { ...newQueryParams.filter, ...filter }
    }
    return newQueryParams
  }

  // queryParams, setQueryParams,
  const applyFilter = () => {
    const newQueryParams = prepareFilter(DTUIProps.queryParams, filter)
    if (!isEqual(newQueryParams, DTUIProps.queryParams)) {
      newQueryParams.pageNumber = 0
      // update list by queryParams
      DTUIProps.setQueryParams(newQueryParams)
    }
  }

  return (
    <div className="form-group row">
      {filter.map((item, index) => {
        if (item.type === 'input' && item.name == 'query') {
          return (
            <div className={`col-lg-${item.col}`} key={index}>
              <input
                type="text"
                className="form-control"
                name={item.name}
                placeholder={t(`filterTable.${item.placeholder}`)}
                // onBlur={handleBlur}
                value={values[item.name]}
                onChange={(e) => {
                  setValues({ ...values, [item.name]: e.target.value })
                }}
                onKeyUp={(e) => {
                  if (e.keyCode == 13 || e.target.value === '') applyFilter()
                }}
              />
              {item.textMuted && (
                <small className="form-text text-muted">
                  <span
                    dangerouslySetInnerHTML={{
                      __html: t(`filterTable.${item.textMuted}`)
                    }}
                  ></span>
                </small>
              )}
            </div>
          )
        } else if (item.type == 'input' && name !== 'query') {
          return (
            <div className={`col-lg-${item.col}`} key={index}>
              <input
                type="text"
                className="form-control"
                name={item.name}
                placeholder={t(`filterTable.${item.placeholder}`)}
                // onBlur={handleBlur}
                value={values[item.name]}
                onChange={(e) => {
                  setValues({ ...values, [item.name]: e.target.value })
                }}
              />
              <small className="form-text text-muted">
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(`filterTable.${item.textMuted}`)
                  }}
                ></span>
              </small>
            </div>
          )
        } else if (item.type == 'select') {
          return (
            <div className={`col-lg-${item.col}`} key={index}>
              <select
                className="form-control"
                name={item.name}
                onChange={(e) => {
                  if (changeStatus) changeTypeStatus()
                  setValues({ ...values, [item.name]: e.target.value })
                }}
                value={values[item.name]}
              >
                {item.options}
              </select>
              <small className="form-text text-muted">
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(`filterTable.${item.textMuted}`)
                  }}
                ></span>
              </small>
            </div>
          )
        } else if (item.type == 'date') {
          return (
            <div className={`col-lg-${item.col}`} key={index}>
              <DatePicker
                className="form-control"
                dateFormat="yyyy-MM-dd"
                selected={values[item.name]}
                onChange={(date) => {
                  setValues({ ...values, [item.name]: date })
                }}
              />
              <small className="form-text text-muted">
                <span
                  dangerouslySetInnerHTML={{
                    __html: t(`filterTable.${item.textMuted}`)
                  }}
                ></span>
              </small>
            </div>
          )
        }
      })}
      {showButtonFilter && (
        <div className="col-2">
          <button className="btn btn-success" onClick={() => applyFilter()}>
            {t(`filterTable.apply_filter`)}
          </button>
        </div>
      )}
      {Tools && React.cloneElement(Tools)}
    </div>
  )
}

export default Filter
