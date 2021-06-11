import actions from '../actions'

const initialState = {
  faqCategories: [],
  totalCount: 0,
  success: false,
  message: '',
  deleteAction: false,
  queryParams: {
    filter: {},
    sortOrder: 'desc', // asc||desc
    sortField: 'createdAt',
    pageNumber: 0,
    pageSize: 10
  }
}
const faqCats = (state = initialState, action) => {
  let newState = state
  switch (action.type) {
    case actions.UPDATE_QUERY_PARAMS_FAQCATS:
      newState = { ...state, queryParams: action.payload }
      break
    case actions.FAQCAT_SUCCESS:
      newState = {
        ...state,
        faqCategories: [...action.payload.faqCategories],
        totalCount: action.payload.totalCount,
        success: true,
        message: ''
      }
      break
    case actions.FAQCAT_FAILED:
      newState = { ...state, success: false, message: action.payload.message }
      break
    case actions.FAQCAT_DELETE_SUCCESS:
      newState = {
        ...state,
        faqCategories: state.faqCategories.filter(
          (item) => item._id !== action.payload.id
        ),
        totalCount: state.totalCount - 1,
        success: true,
        deleteAction: true,
        message: ''
      }
      break
    case actions.FAQCAT_DELETE_FAILED:
      newState = {
        ...state,
        success: false,
        message: action.payload,
        deleteAction: true
      }
      break
    default:
      newState = state
      break
  }
  return newState
}
export default faqCats
