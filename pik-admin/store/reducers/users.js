import actions from '../actions'

const initialState = {
  users: [],
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
const users = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_USERS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.USER_SUCCESS:
      newState = {
        ...state,
        users: [...action.payload.users],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.USER_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default users
