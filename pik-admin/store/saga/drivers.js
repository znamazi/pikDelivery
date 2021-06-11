import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const driverWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/driver/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.DRIVER_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.DRIVER_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.DRIVER_FAILED, payload: error })
  }
}
export const driverWatcher = function* () {
  yield takeLatest(actions.DRIVER_REQUESTED, driverWorker)
}
