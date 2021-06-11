import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const groupWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/setting/group/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.GROUP_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.GROUP_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.GROUP_FAILED, payload: error })
  }
}
export const groupWatcher = function* () {
  yield takeLatest(actions.GROUP_REQUESTED, groupWorker)
}
