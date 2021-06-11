import actions from '../actions'

const initialState = {
  customers: [],
  orders: [],
  totalCount: 0,
  ordersCount: 0,
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
const customers = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_CUSTOMERS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.CUSTOMER_SUCCESS:
      newState = {
        ...state,
        customers: [...action.payload.customers],
        totalCount: action.payload.totalCount,
        success: true
      }
      break
    case actions.CUSTOMER_FAILED:
      newState = { ...state, message: action.payload.message }
      break
    case actions.CUSTOMER_ORDER_SUCCESS:
      newState = {
        ...state,
        orders: [...action.payload.orders],
        ordersCount: action.payload.totalCount,
        success: true
      }
      break
    case actions.CUSTOMER_ORDER_FAILED:
      newState = { ...state, message: action.payload.message }
      break

    case actions.CUSTOMER_UPDATE_REQUESTED:
      let index = state.customers.findIndex(
        (item) => item._id === action.payload.id
      )
      state.customers.splice(index, 1, action.payload.customer)
      newState = { ...state }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default customers
