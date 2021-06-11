import actions from '../actions'

const initialState = {
  groups: [],
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
const groups = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_GROUPS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.GROUP_SUCCESS:
      newState = {
        ...state,
        groups: [...action.payload.groups],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.GROUP_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default groups
