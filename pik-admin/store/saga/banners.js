import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const bannerWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/setting/banner/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.BANNER_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.BANNER_FAILED, payload: result.data })
    }
  } catch (error) {
    yield put({ type: actions.BANNER_FAILED, payload: error })
  }
}
export const bannerWatcher = function* () {
  yield takeLatest(actions.BANNER_REQUESTED, bannerWorker)
}
