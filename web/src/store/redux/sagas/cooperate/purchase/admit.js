import { put, takeEvery } from 'redux-saga/effects';
import { get_purchase_list_detail, filterProcureOrderDetail } from 'src/services/cooperate/purchase_list';
import AdmitModel from 'src/models/cooperate/purchase/admit/AdmitModel';
import { updateAdmitModelAction, updateAdmitRequestStatusAction } from '../../../actions/purchase';
import { FETCH_ADMIT_DATA, FILTER_PURCHASE_LIST } from '../../../types/cooperate/purchase';

// worker saga
function* fetchAdmitData({ payload }) {
  try {
    yield put(updateAdmitRequestStatusAction(true));
    const response = yield get_purchase_list_detail(payload);
    const { data } = response || {};
    const { data: realData } = data || {};
    const model = AdmitModel.from(realData);
    yield put(updateAdmitRequestStatusAction(false));
    yield put(updateAdmitModelAction(model));
  } catch (error) {
    yield put(updateAdmitRequestStatusAction(false));
  }
}

function* filterPurchaseList({ payload }) {
  try {
    const { id, code: materialCode, name: materialName, allInFactory } = payload || {};
    const { key = 0 } = allInFactory || {};
    const params = {
      id,
      materialCode,
      materialName,
      isAllInFactory: key,
    };
    yield put(updateAdmitRequestStatusAction(true));
    const response = yield filterProcureOrderDetail(params);
    const { data } = response || {};
    const { data: admitData } = data || {};
    const model = AdmitModel.from(admitData);
    yield put(updateAdmitRequestStatusAction(false));
    yield put(updateAdmitModelAction(model));
  } catch (error) {
    yield put(updateAdmitRequestStatusAction(false));
  }
}

// watcher saga
export default function* watcher() {
  yield takeEvery(FETCH_ADMIT_DATA, fetchAdmitData);
  yield takeEvery(FILTER_PURCHASE_LIST, filterPurchaseList);
}