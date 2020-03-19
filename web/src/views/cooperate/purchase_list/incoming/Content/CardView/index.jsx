import React, { useMemo } from 'react';
import { DetailPageItemContainer, PlainText } from 'components';
import { arrayIsEmpty } from 'utils/array';
import PurchaseMaterialIncomingCardModel from 'models/cooperate/purchaseOrder/viewModels/PurchaseIncomingCardViewModel';
import PurchaseMaterialIncomingCard from './MaterialIncomingCard';
import styles from '../../styles.scss';

export const WRAPPER_TITLE = '采购清单';

type PurchaseMaterialListCardsContainerProps = {
  form: any,
  materialList: [],
  purchaseOrderData: {},
};

export default function PurchaseMaterialIncomingCardsContainer(props: PurchaseMaterialListCardsContainerProps) {
  const { materialList, purchaseOrderData, form } = props || {};
  const getMaterialList = materialList =>
    arrayIsEmpty(materialList)
      ? null
      : materialList.map(
          material => new PurchaseMaterialIncomingCardModel({ materialData: material, purchaseOrderData }),
        );
  // const _materialList = getMaterialList(materialList);
  const _materialList = useMemo(() => getMaterialList(materialList), [materialList]);

  const renderPurchaseMaterialIncomingCards = materialList => {
    return arrayIsEmpty(materialList) ? (
      <PlainText text="暂无数据" className={styles['data-not-found']} />
    ) : (
      <div className={styles['purchase-material-incoming-cards-container']}>
        {materialList.map((material: PurchaseMaterialIncomingCardModel, index: Number) => (
          <PurchaseMaterialIncomingCard form={form} data={material} index={index} />
        ))}
      </div>
    );
  };

  return renderPurchaseMaterialIncomingCards(_materialList);
}
