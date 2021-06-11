export const CostColumnFormatter = (cellContent, row) => {
  return (
    <div className="d-flex align-items-center">
      {row.cost ? row.cost.total.toFixed(2) : ''}
    </div>
  )
}
