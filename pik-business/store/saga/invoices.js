import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const invoiceWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('business/invoice/list', action.payload)
    })
    console.log({ result })
    yield put({
      type: actions.INVOICE_SUCCESS,
      payload: result.data
    })
  } catch (error) {
    yield put({ type: actions.INVOICE_FAILED, payload: error })
  }
}
export const invoiceWatcher = function* () {
  yield takeLatest(actions.INVOICE_REQUESTED, invoiceWorker)
}
