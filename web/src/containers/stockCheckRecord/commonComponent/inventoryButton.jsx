// 盘点记录过账，或者确认按钮
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'src/utils/time';
import { FormattedMessage, message, openModal, Icon, Button } from 'src/components';
import { confirmStockCheckRecord } from 'src/services/stock/stockCheckedRecord';
import { findQcStatus } from 'src/containers/storageAdjustRecord/util';
import { primary, error, border, white, grey } from 'src/styles/color';
import { replaceSign } from 'src/constants';
import styles from './styles.scss';

import { stockCheckRecordStatus } from '../utils';

class InventoryButton extends Component {
  state = {};

  renderConfirm = id => {
    const { data, refetch } = this.props;
    const {
      amountBefore,
      amountAfter,
      unit,
      qrcode,
      warehouse,
      firstStorage,
      secondStorage,
      materialCode,
      materialName,
      inventoryCode,
      qcStatus,
      mfgBatches,
      supplierInfo,
      operatorName,
      trallyingAt,
      inspectionTime,
      validationPeriod,
    } = data || {};
    const { changeChineseToLocale } = this.context;

    const qcStatusObj = findQcStatus(qcStatus) || {};
    const trallyingResult = amountBefore - amountAfter < 0;
    return (
      <div>
        <div style={{ margin: '0 55px' }}>
          <div style={{ margin: '15px 0', display: 'flex', alignItems: 'center' }}>
            <Icon style={{ fontSize: 24, marginRight: 5 }} type={'qrcode'} />
            <div style={{ fontSize: 24, marginRight: 5 }}>{qrcode}</div>
            <div
              style={{
                fontSize: 12,
                padding: '1px 3px',
                backgroundColor: (qcStatusObj && qcStatusObj.color) || primary,
                borderRadius: 4,
                color: white,
              }}
            >
              {qcStatusObj && qcStatusObj.name ? changeChineseToLocale(qcStatusObj.name) : replaceSign}
            </div>
          </div>
          <div style={{ margin: '5px 0' }}>
            <FormattedMessage defaultMessage={'存储位置'} className={styles.title} />
            <span>：</span>
            <span>
              {`${(warehouse && warehouse.name) || replaceSign}/${(firstStorage && firstStorage.name) ||
                replaceSign}/${(secondStorage && secondStorage.name) || replaceSign}`}
            </span>
          </div>
          <div style={{ margin: '5px 0' }}>
            <FormattedMessage defaultMessage={'物料名称/编码'} className={styles.title} />
            <span>：</span>
            <span>{(materialName && `${materialName}/${materialCode}`) || replaceSign}</span>
          </div>
          <div style={{ margin: '5px 0' }}>
            <FormattedMessage defaultMessage={'供应商'} className={styles.title} />
            <span>：</span>
            <span>{(supplierInfo && supplierInfo.name) || replaceSign}</span>
          </div>
          <div style={{ margin: '5px 0' }}>
            <FormattedMessage defaultMessage={'供应商批次'} className={styles.title} />
            <span>：</span>
            <span>
              {(mfgBatches && Array.isArray(mfgBatches) && mfgBatches.map(n => n.mfgBatchNo).join('，')) || replaceSign}
            </span>
          </div>
          <div style={{ margin: '5px 0' }}>
            <FormattedMessage defaultMessage={'入厂批次'} className={styles.title} />
            <span>：</span>
            <span>{inventoryCode || replaceSign}</span>
          </div>
          <div style={{ margin: '5px 0' }}>
            <FormattedMessage defaultMessage={'有效期'} className={styles.title} />
            <span>：</span>
            <span>{validationPeriod ? moment(validationPeriod).format('YYYY/MM/DD HH:mm') : replaceSign}</span>
          </div>
          <div style={{ margin: '5px 0' }}>
            <FormattedMessage defaultMessage={'质检时间'} className={styles.title} />
            <span>：</span>
            <span>{inspectionTime ? moment(inspectionTime).format('YYYY/MM/DD HH:mm') : replaceSign}</span>
          </div>
          <div
            style={{ width: 550, height: 198, border: `1px solid ${border}`, backgroundColor: grey, margin: '25px 0' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ marginTop: 30 }}>
                {`${amountBefore}${unit}`}
                <Icon type={'caret-right'} style={{ color: primary, margin: '0 5px', fontSize: 12 }} />
                {`${amountAfter}${unit}`}
                <span style={{ color: trallyingResult ? primary : error, marginLeft: 5 }}>
                  {`${changeChineseToLocale(trallyingResult ? '盘盈' : '盘亏')}，${
                    trallyingResult ? '+' : ''
                  }${Math.round((amountAfter - amountBefore) * 10 ** 6) / 10 ** 6}`}
                </span>
              </div>
              <div style={{ marginTop: 20, display: 'flex' }}>
                <div style={{ width: 146 }}>
                  <div className={styles.processDotLine} />
                  <div style={{ color: primary, marginLeft: -18 }}>{changeChineseToLocale('现场盘点')} </div>
                </div>
                <div style={{ width: 146 }}>
                  <div className={styles.processDot} />
                  <div style={{ color: primary, marginLeft: -6 }}>{changeChineseToLocale('过账')}</div>
                </div>
                <div>
                  <div className={styles.processDotLine_grey} />
                  <div style={{ color: border, marginLeft: -6 }}>{changeChineseToLocale('完成')}</div>
                </div>
              </div>
              <div style={{ marginTop: 10, width: '64%' }}>
                <div>{operatorName || replaceSign}</div>
                <div>{trallyingAt ? moment(trallyingAt).format('YYYY/MM/DD HH:mm') : replaceSign}</div>
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            style={{ width: 114, height: 32, marginBottom: 30 }}
            type="primary"
            onClick={async () => {
              await confirmStockCheckRecord({ confirmRequestIds: [id] });
              message.success(changeChineseToLocale('过账成功'));
              if (typeof refetch === 'function') await refetch();
            }}
          >
            确认过账
          </Button>
        </div>
      </div>
    );
  };

  render() {
    const { data, style, refetch } = this.props;
    const { changeChineseToLocale } = this.context;
    const { amountBefore, amountAfter, status, id } = data || {};

    // 当状态是已经盘点过的时候按钮disabled
    const isDisabled = status === stockCheckRecordStatus.post.value;

    const baseStyle = {
      color: isDisabled ? border : primary,
      cursor: 'pointer',
    };

    // 如果原数量和盘点数量不一致那么显示过账按钮。如果一致那么显示确认按钮。
    const type = amountBefore !== amountAfter ? '过账' : '确认';

    const clickCb = async () => {
      if (isDisabled) return;
      if (!id) return;

      if (type === '过账') {
        openModal(
          {
            title: '过账确认',
            footer: null,
            children: this.renderConfirm(id),
            width: 660,
          },
          this.context,
        );
      } else {
        await confirmStockCheckRecord({ confirmRequestIds: [id] });
        message.success(`${type}成功`);
        if (typeof refetch === 'function') await refetch();
      }
    };

    return (
      <div>
        <span style={{ ...baseStyle, ...style }} onClick={clickCb}>
          {changeChineseToLocale(type)}
        </span>
      </div>
    );
  }
}

InventoryButton.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any, // 相关盘点记录的数据
  refetch: PropTypes.any, // 盘点，确认成功后重新拉取数据
};

InventoryButton.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default InventoryButton;
