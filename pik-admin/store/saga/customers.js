import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const customerWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/customer/list', action.payload)
    })
    console.log('rrrrrrrrrrrrrr', result.data)
    if (result.data.success) {
      yield put({
        type: actions.CUSTOMER_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.CUSTOMER_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.CUSTOMER_FAILED, payload: error })
  }
}
export const customerWatcher = function* () {
  yield takeLatest(actions.CUSTOMER_REQUESTED, customerWorker)
}
