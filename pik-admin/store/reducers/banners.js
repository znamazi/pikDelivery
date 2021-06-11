import actions from '../actions'

const initialState = {
  banners: [],
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
const banners = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_BANNERS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.BANNER_SUCCESS:
      newState = {
        ...state,
        banners: [...action.payload.banners],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.BANNER_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default banners
