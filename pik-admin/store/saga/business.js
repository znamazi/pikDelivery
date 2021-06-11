import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const businessWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.post('admin/business/list', action.payload)
    })
    if (result.data.success) {
      yield put({
        type: actions.BUSINESS_SUCCESS,
        payload: result.data
      })
    } else {
      yield put({ type: actions.BUSINESS_FAILED, payload: result.data })
    }
  } catch (error) {
    console.log({ error })
    yield put({ type: actions.BUSINESS_FAILED, payload: error })
  }
}
export const businessWatcher = function* () {
  yield takeLatest(actions.BUSINESS_REQUESTED, businessWorker)
}
