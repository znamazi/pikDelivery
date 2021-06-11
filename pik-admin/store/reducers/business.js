import actions from '../actions'

const initialState = {
  business: [],
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
const business = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_BUSINESS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.BUSINESS_SUCCESS:
      newState = {
        ...state,
        business: [...action.payload.business],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.BUSINESS_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    case actions.BUSINESS_UPDATE_REQUESTED:
      let index = state.business.findIndex(
        (item) => item._id == action.payload.id
      )
      state.business.splice(index, 1, action.payload.business)
      newState = { ...state }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default business
