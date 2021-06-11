import actions from '../actions'

const initialState = {
  businessExist: ''
}
const business = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.BUSINESS_INIT_SUCCESS:
      newState = {
        ...state,
        businessExist: action.payload
      }
      break
    case actions.BUSINESS_INIT_FAILED:
      newState = { ...state, businessExist: undefined }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default business
