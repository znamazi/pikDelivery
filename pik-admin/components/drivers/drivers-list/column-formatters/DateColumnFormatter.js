import moment from 'moment'

export const DateColumnFormatter = (cellContent, row) => {
  return (
    <div className="d-flex align-items-center">
      {moment(row.createdAt).format('LLL')}
    </div>
  )
}
