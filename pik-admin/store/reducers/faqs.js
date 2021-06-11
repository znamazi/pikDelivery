import actions from '../actions'

const initialState = {
  faqsList: [],
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
const faqs = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_FAQS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.FAQ_SUCCESS:
      newState = {
        ...state,
        faqsList: [...action.payload.faqs],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.FAQ_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    case actions.FAQ_DELETE_SUCCESS:
      newState = {
        ...state,
        faqsList: state.faqsList.filter(
          (item) => item._id !== action.payload.id
        ),
        totalCount: state.totalCount - 1,
        success: true,
        message: action.payload.message
      }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default faqs
