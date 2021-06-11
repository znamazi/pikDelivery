import moment from 'moment'
import { v4 as uuid } from 'uuid'

export const initState = {
  mode: '',
  tab: '',
  showDetails: true,
  urlAdd: 'business/setup/create',
  urlEdit: 'business/setup',
  error: '',
  name: '',
  phone: '',
  mobile: '',
  email: '',
  logo: '',
  website: '',
  about: '',
  coverageEnabled: false,
  address: '',
  location: { type: 'Point', coordinates: [] },
  timeFrames: [
    { open: '08:00', close: '18:00', totallyClosed: true },
    { open: '08:00', close: '18:00', totallyClosed: false },
    { open: '08:00', close: '18:00', totallyClosed: false },
    { open: '08:00', close: '18:00', totallyClosed: false },
    { open: '08:00', close: '18:00', totallyClosed: false },
    { open: '08:00', close: '18:00', totallyClosed: false },
    { open: '08:00', close: '18:00', totallyClosed: false }
  ],
  date: {
    from: new Date(),
    to: new Date(),
    totallyClosed: false,
    open: '08:00',
    close: '18:00'
  },
  customTimeFrames: [],
  deletedId: [],
  coverageMaxValue: '',
  card: {
    cardName: '',
    cardNumber: '',
    month: '',
    year: '',
    cvv: ''
  },
  creditCard: '',
  removedCreditCard: '',
  status: 'Active',
  sending: false,
  checkError: {},
  handleSubmit: ''
}

export const reducer = (state, action) => {
  let newState
  switch (action.type) {
    case 'UPDATE_MODE':
      newState = {
        ...state,
        mode: action.payload.mode,
        tab: action.payload.tab
      }
      break
    case 'CHANGE_CONTENT':
      newState = {
        ...state,
        showDetails: !state.showDetails,
        handleSubmit: 'baseInfo'
      }
      break
    case 'UPDATE_STATE':
      newState = {
        ...state,
        ...action.payload.business,
        customTimeFrames: action.payload.customTimeFrames
      }
      break
    case 'UPDATE_LOGO':
      newState = { ...state, logo: action.payload }
      break
    case 'UPDATE_DATA':
      newState = { ...state, [action.payload.fieldName]: action.payload.value }
      break
    case 'UPDATE_LOCATION':
      newState = {
        ...state,
        location: action.payload.location,
        address: action.payload.address
      }
      break
    case 'UPDATE_ENABLE':
      newState = { ...state, coverageEnabled: action.payload }
      break
    case 'UPDATE_ERROR':
      newState = { ...state, error: action.payload }
      break
    case 'UPDATE_CARD':
      newState = {
        ...state,
        card: {
          ...state.card,
          [action.payload.fieldName]: action.payload.value
        }
      }
      break
    case 'UPDATE_CREDIT_CARD':
      newState = {
        ...state,
        creditCard: action.payload
      }
      break
    case 'REMOVE_CARD':
      newState = {
        ...state,
        card: {
          cardName: '',
          cardNumber: '',
          month: '',
          year: '',
          cvv: ''
        },
        removedCreditCard: state.creditCard
          ? state.creditCard.customer_vault_id
          : '',
        creditCard: ''
      }
      break
    case 'CLEAN_CARD':
      newState = {
        ...state,
        card: {
          cardName: '',
          cardNumber: '',
          month: '',
          year: '',
          cvv: ''
        },
        removedCreditCard: ''
      }
      break

    case 'UPDATE_TIME_FRAMES':
      newState = {
        ...state,
        timeFrames: [...action.payload],
        handleSubmit: action.payload
      }
      break

    case 'UPDATE_DATE':
      newState = {
        ...state,
        date: {
          ...state.date,
          [action.payload.fieldName]: action.payload.value
        }
      }
      break
    case 'UPDATE_CUSTOM_TIME_FRAMES':
      newState = {
        ...state,
        customTimeFrames: [
          ...state.customTimeFrames,
          {
            id: uuid(),
            ...action.payload,
            from: moment(action.payload.from).format('YYYY-MM-DD'),
            to: moment(action.payload.to).format('YYYY-MM-DD'),
            type: 'add'
          }
        ],
        date: {
          from: new Date(),
          to: new Date(),
          totallyClosed: false,
          open: '08:00',
          close: '18:00'
        },
        handleSubmit: action.payload
      }
      break
    case 'REMOVE_CUSTOM_TIME_FRAMES':
      newState = {
        ...state,
        customTimeFrames: [...action.payload.newData],
        deletedId: [...state.deletedId, action.payload.deletedId],
        handleSubmit: action.payload
      }
      break
    case 'REMOVE_CUSTOM_TIME_FRAMES_CONFILICT':
      newState = {
        ...state,
        customTimeFrames: [...action.payload]
      }
      break
    case 'CLEAR_TYPE_CUSTOM_TIME_FRAMES':
      const customTimeFrames = state.customTimeFrames.map((item) => {
        delete item.type
        return item
      })
      newState = {
        ...state,
        customTimeFrames,
        deletedId: []
      }
      break
    case 'UPDATE_SENDING':
      newState = {
        ...state,
        sending: action.payload
      }
      break
    default:
      throw new Error(`${action.type} is not defined in this state!`)
      break
  }
  return newState
}
