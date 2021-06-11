import React, { useCallback, useState, useEffect } from 'react'
import { isEqual } from 'lodash'
import DatePicker from 'react-datepicker'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
const Filter = ({
  filter,
  Tools,
  changeStatus,
  changeTypeStatus,
  queryParams,
  updateQueryParams
}) => {
  const { t } = useTranslation()
  const [values, setValues] = useState({})

  useEffect(() => {
    if (changeStatus) {
      setValues({ ...values, status: '' })
    }
  }, [changeStatus])

  useEffect(() => {
    delayedQuery()

    // Cancel the debounce on useEffect cleanup.
    return delayedQuery.cancel
  }, [values, delayedQuery])

  const delayedQuery = useCallback(
    debounce(() => {
      applyFilter()
    }, 1000),
    [values]
  )

  // queryParams, setQueryParams,
  const applyFilter = () => {
    const newQueryParams = prepareFilter(queryParams, filter)

    if (!isEqual(newQueryParams, queryParams)) {
      newQueryParams.pageNumber = 0
      // update list by queryParams
      updateQueryParams(newQueryParams)
    }
  }

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
  // console.log({ values, queryParams })
  return (
    <div className="form-group row">
      {filter.map((item, index) => {
        if (item.type === 'input' && item.name == 'query') {
          return (
            <div className={`col-lg-${item.col} mb-2`} key={index}>
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
        } else if (item.type == 'input' && item.name !== 'query') {
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
                selected={
                  values[item.name]
                    ? new Date(values[item.name])
                    : values[item.name]
                }
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
      {Tools && React.cloneElement(Tools)}
    </div>
  )
}

const mapStateToProps = (state, ownProps) => {
  return { queryParams: state[ownProps.component].queryParams }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updateQueryParams: (queryParams) => {
      dispatch({
        type: ownProps.actionDisptachFilter,
        payload: queryParams
      })
    }
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(Filter)
