import actions from '../actions'

const initialState = {
  transactions: [],
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
const transactions = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_TRANSACTIONS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.PAYMENT_SUCCESS:
      newState = {
        ...state,
        transactions: [...action.payload.payments],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.PAYMENT_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    case actions.PAYMENT_UPDATE_REQUESTED:
      let index = state.transactions.findIndex(
        (item) => item._id == action.payload.id
      )
      state.transactions.splice(index, 1, action.payload.transaction)
      newState = { ...state }
      break

    default:
      newState = state
      break
  }
  return newState
}
export default transactions
