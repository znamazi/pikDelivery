import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const userWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/user/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.USER_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.USER_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.USER_FAILED, payload: error })
  }
}
export const userWatcher = function* () {
  yield takeLatest(actions.USER_REQUESTED, userWorker)
}
