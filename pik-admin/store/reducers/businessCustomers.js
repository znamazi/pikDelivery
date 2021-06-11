import actions from '../actions'

const initialState = {
  queryParams: {
    filter: {},
    sortOrder: 'desc', // asc||desc
    sortField: 'createdAt',
    pageNumber: 0,
    pageSize: 10
  }
}
const businessCustomers = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_BUSINESS_CUSTOMERS:
      newState = { ...state, queryParams: action.payload }
      break

    default:
      newState = state
      break
  }
  return newState
}
export default businessCustomers
