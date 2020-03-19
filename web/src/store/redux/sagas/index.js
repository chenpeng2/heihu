import { all } from 'redux-saga/effects';
import admit from './cooperate/purchase/admit';

function* rootSaga() {
  yield all([
    admit(),
  ]);
}

export default rootSaga;