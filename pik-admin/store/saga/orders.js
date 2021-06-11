import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const orderWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/order/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.ORDER_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.ORDER_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.ORDER_FAILED, payload: error })
  }
}
export const orderWatcher = function* () {
  yield takeLatest(actions.ORDER_REQUESTED, orderWorker)
}

const cancelOrderWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/order/cancel', action.payload)
    })
    yield put({
      type: actions.CANCEL_ORDER_SUCCESS,
      payload: { ids: action.payload, cancel: result.data.order.cancel }
    })
  } catch (error) {
    yield put({ type: actions.CANCEL_ORDER_FAILED, payload: error })
  }
}
export const cancelOrderWatcher = function* () {
  yield takeLatest(actions.CANCEL_ORDER_REQUESTED, cancelOrderWorker)
}
