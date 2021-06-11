import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const paymentWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/payment/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.PAYMENT_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.PAYMENT_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.PAYMENT_FAILED, payload: error })
  }
}
export const paymentWatcher = function* () {
  yield takeLatest(actions.PAYMENT_REQUESTED, paymentWorker)
}
