import React, { Component } from 'react';
import { withForm } from 'components';
import Header from './Header';
import PurchaseMaterialIncomingCardsContainer from './CardView';
import PurchaseMaterialIncomingListContainer from './ListView';
import styles from '../styles.scss';
import { PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD } from '../../constants';

type ContentProps = {
  fetchData: () => void,
  form: any,
  viewType: Number,
  handleViewToggleChange: () => void,
  materialList: Array<Object>,
  purchaseOrderData: Array<Object>,
};

class Content extends Component<ContentProps, {}> {
  renderCardView = () => {
    const { fetchData, form, data, viewType, purchaseOrderData, materialList, ...restProps } = this.props;

    return (
      <PurchaseMaterialIncomingCardsContainer
        viewType={viewType}
        form={form}
        materialList={materialList}
        purchaseOrderData={purchaseOrderData}
      />
    );
  };

  renderListView = () => {
    const { fetchData, form, data, viewType, purchaseOrderData, materialList, ...restProps } = this.props;

    return (
      <PurchaseMaterialIncomingListContainer
        viewType={viewType}
        form={form}
        materialList={materialList}
        purchaseOrderData={purchaseOrderData}
      />
    );
  };

  render() {
    const { fetchData, form, viewType, handleViewToggleChange, ...restProps } = this.props;

    return (
      <div className={styles['purchase-material-incoming-content-container']} {...restProps}>
        <Header handleViewToggleChange={handleViewToggleChange} viewType={viewType} />
        <div className={styles['purchase-material-incoming-content']}>
          {viewType === PURCHASE_MATERIAL_INCOMING_VIEW_TYPE_CARD ? this.renderCardView() : this.renderListView()}
        </div>
      </div>
    );
  }
}

export default withForm({}, Content);
