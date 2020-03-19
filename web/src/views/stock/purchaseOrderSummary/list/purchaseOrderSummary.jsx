import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { RestPagingTable, Spin, Button } from 'src/components';
import { thousandBitSeparator } from 'utils/number';
import Proptypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'src/utils/locale/utils';

const PurchaseOrderSummary = (props: {
  data: any,
  refetch: () => {},
  loading: boolean,
  onClickExport: () => {},
  columns: any,
  onChange: () => {},
  pagination: any,
  intl: any,
}) => {
  const { data, refetch, loading, onClickExport, columns, onChange, pagination, intl } = props;
  return (
    <Spin spinning={loading}>
      {!!data && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            padding: '19px 20px 0 20px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: 'row',
              paddingBottom: 10,
            }}
          >
            <div style={{ color: '#000' }}>{changeChineseToLocale('订单交货', intl)}</div>
            <Button icon="upload" onClick={onClickExport} disabled={!data}>
              数据导出
            </Button>
          </div>
          <RestPagingTable
            refetch={refetch}
            columns={columns}
            dataSource={data}
            style={{ margin: 0 }}
            loading={loading}
            pagination={pagination}
            scroll={{ x: 1000 }}
            onChange={onChange}
          />
        </div>
      )}
    </Spin>
  );
};

export default withRouter(injectIntl(PurchaseOrderSummary));
