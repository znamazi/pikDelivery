export const TypeColumnFormatter = (cellContent, row) => {
  return (
    <div className="d-flex align-items-center">
      {row.senderModel === 'business' ? 'Business' : 'Standard'}
    </div>
  )
}
