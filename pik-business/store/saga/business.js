import { takeLatest, put, call } from 'redux-saga/effects'
import actions from '../actions'
import axios from '../../utils/axios'

const businessWorker = function* (action) {
  try {
    const result = yield call(async () => {
      return await axios.get('business/setup/checkBusiness')
    })
    yield put({
      type: actions.BUSINESS_INIT_SUCCESS,
      payload: result.data.business
    })
  } catch (error) {
    yield put({ type: actions.BUSINESS_INIT_FAILED, payload: error })
  }
}
export const businessWatcher = function* () {
  yield takeLatest(actions.BUSINESS_INIT_REQUESTED, businessWorker)
}
