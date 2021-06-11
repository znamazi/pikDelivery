import { createStore, applyMiddleware } from 'redux'
import makeSagaMiddleware from 'redux-saga'
import { composeWithDevTools } from 'redux-devtools-extension'
import reducer from './reducers'
import sagaApi from './saga'

const sagaMiddleware = makeSagaMiddleware()

const store = createStore(
  reducer,
  composeWithDevTools(applyMiddleware(sagaMiddleware))
)

sagaMiddleware.run(sagaApi)

export default store
