import actions from '../actions'

const initialState = {
  drivers: [],
  totalCount: 0,
  pendingDriver: 0,
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
const drivers = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_DRIVERS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.DRIVER_SUCCESS:
      newState = {
        ...state,
        drivers: [...action.payload.drivers],
        totalCount: action.payload.totalCount,
        pendingDriver: action.payload.drivers.reduce((pending, driver) => {
          driver.status == 'Pending' ? pending++ : ''
          return pending
        }, 0),
        success: true,
        message: ''
      }
      break
    case actions.DRIVER_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    case actions.DRIVER_UPDATE_REQUESTED:
      let index = state.drivers.findIndex(
        (item) => item._id == action.payload.id
      )
      state.drivers.splice(index, 1, action.payload.driver)
      newState = { ...state }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default drivers
