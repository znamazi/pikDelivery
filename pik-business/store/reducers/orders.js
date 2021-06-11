import actions from '../actions'

const initialState = {
  orders: [],
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
const orders = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_ORDERS:
      newState = { ...state, queryParams: action.payload }
      break

    case actions.ORDER_SUCCESS:
      newState = {
        ...state,
        orders: [...action.payload.orders],
        totalCount: action.payload.totalCount,
        success: true
      }
      break
    case actions.ORDER_FAILED:
      newState = { ...state, message: action.payload.message }
      break
    case actions.CANCEL_ORDER_SUCCESS:
      newState = {
        ...state,
        orders: state.orders.map((order) =>
          action.payload.ids.includes(order._id)
            ? { ...order, status: 'Canceled', cancel: action.payload.cancel }
            : { ...order }
        )
      }

      break
    case actions.ORDER_UPDATE_REQUESTED:
      let index = state.orders.findIndex(
        (item) => item._id === action.payload.id
      )
      state.orders.splice(index, 1, action.payload.order)
      newState = { ...state }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default orders
