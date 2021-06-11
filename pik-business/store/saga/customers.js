import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const customerWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('business/customer/list', action.payload)
    })
    yield put({
      type: actions.CUSTOMER_SUCCESS,
      payload: result.data
    })
  } catch (error) {
    yield put({ type: actions.CUSTOMER_FAILED, payload: error })
  }
}
export const customerWatcher = function* () {
  yield takeLatest(actions.CUSTOMER_REQUESTED, customerWorker)
}

const customerOrderWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post(
        `business/customer/orders/${action.payload.customerId}`,
        action.payload.queryParams
      )
    })
    yield put({
      type: actions.CUSTOMER_ORDER_SUCCESS,
      payload: result.data
    })
  } catch (error) {
    yield put({ type: actions.CUSTOMER_ORDER_FAILED, payload: error })
  }
}
export const customerOrderWatcher = function* () {
  yield takeLatest(actions.CUSTOMER_ORDER_REQUESTED, customerOrderWorker)
}
