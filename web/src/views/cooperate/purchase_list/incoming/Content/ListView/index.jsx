import React, { useMemo } from 'react';
import { arrayIsEmpty } from 'utils/array';
import PurchaseMaterialIncomingListModel from '../../../../../../models/cooperate/purchaseOrder/viewModels/PurchaseIncomingListViewModel';
import PurchaseMaterialIncomingTable from './MaterialIncomingTable';
import styles from '../../styles.scss';

export const WRAPPER_TITLE = '采购清单';

type PurchaseMaterialIncomingListContainerProps = {
  form: any,
  materialList: [],
  purchaseOrderData: {},
};

export default function PurchaseMaterialIncomingListContainer(props: PurchaseMaterialIncomingListContainerProps) {
  const { materialList, purchaseOrderData, form } = props || {};
  const getMaterialList = materialList =>
    arrayIsEmpty(materialList)
      ? null
      : materialList.map(
          material => new PurchaseMaterialIncomingListModel({ materialData: material, purchaseOrderData }),
        );
  // const _materialList = getMaterialList(materialList);
  const _materialList = useMemo(() => getMaterialList(materialList), [materialList]);

  return (
    <div>
      {arrayIsEmpty(_materialList) ? (
        <p className={styles['data-not-found']}>暂无数据</p>
      ) : (
        <PurchaseMaterialIncomingTable form={form} data={_materialList} />
      )}
    </div>
  );
}
