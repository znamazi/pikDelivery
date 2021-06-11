import actions from '../actions'

const initialState = {
  invoices: [],
  totalCount: 0,
  success: false,
  message: '',
  queryParams: {
    filter: {},
    sortOrder: 'desc', // asc||desc
    sortField: 'createdAt',
    pageNumber: 0,
    pageSize: 10
  }
}
const invoices = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_INVOICES:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.INVOICE_SUCCESS:
      newState = {
        ...state,
        invoices: [...action.payload.invoices],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.INVOICE_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    case actions.INVOICE_UPDATE_REQUESTED:
      let index = state.invoices.findIndex(
        (item) => item._id == action.payload.id
      )
      state.invoices.splice(index, 1, action.payload.invoice)
      newState = { ...state }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default invoices
