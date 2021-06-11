/* eslint-disable no-unused-vars */
import React from 'react'
import { PaginationTotalStandalone } from 'react-bootstrap-table2-paginator'

export function PaginationToolbar(props) {
  const { isLoading, paginationProps } = props
  let dataPaginationProps = { ...paginationProps }
  dataPaginationProps.page = dataPaginationProps.page + 1
  const {
    sizePerPageList,
    sizePerPage,
    totalSize,
    onSizePerPageChange = [
      { text: '10', value: 10 },
      { text: '25', value: 25 },
      { text: '50', value: 50 },
      { text: '100', value: 100 }
    ]
  } = paginationProps
  const style = {
    width: '75px'
  }

  const onSizeChange = (event) => {
    const newSize = +event.target.value
    onSizePerPageChange(newSize)
  }

  return (
    <div className="d-flex align-items-center py-3">
      {isLoading && (
        <div className="d-flex align-items-center">
          <div className="mr-2 text-muted">Loading...</div>
          <div className="spinner spinner-primary mr-10"></div>
        </div>
      )}
      <select
        disabled={totalSize === 0}
        className={`form-control form-control-sm font-weight-bold mr-4 border-0 bg-light ${
          totalSize === 0 && 'disabled'
        }`}
        onChange={onSizeChange}
        value={sizePerPage}
        style={style}
      >
        {sizePerPageList.map((option) => {
          const isSelect = sizePerPage === `${option.page}`
          return (
            <option
              key={option.text}
              value={option.page}
              className={`btn ${isSelect ? 'active' : ''}`}
            >
              {option.text}
            </option>
          )
        })}
      </select>
      <PaginationTotalStandalone
        className="text-muted"
        {...dataPaginationProps}
      />
    </div>
  )
}
