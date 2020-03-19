import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import _ from 'lodash';
import log from 'src/utils/log';
import { getParams } from 'src/utils/url';
import { message, Popconfirm, Button, Icon } from 'src/components';
import { getBatchEnsureAmount, batchEnsure } from 'src/services/stock/stockCheckedRecord';

import { formatFormValue } from './filter';

class BatchEnsureData extends Component {
  state = {
    showConfirm: false,
  };

  genTitle = () => {
    const { amount } = this.state;
    const { changeChineseTemplateToLocale } = this.context;
    return changeChineseTemplateToLocale('本次将会批量确认{amount}条数据，是否继续', { amount });
  };

  render() {
    const { showConfirm } = this.state;
    const { refetch } = this.props;
    const { changeChineseToLocale } = this.context;

    const { queryObj } = getParams();
    const { filter } = queryObj || {};
    const params = { ...(formatFormValue(filter) || {}) };

    const title = this.genTitle();

    if (showConfirm) {
      return (
        <Popconfirm
          visible
          title={title}
          onCancel={() => {
            this.setState({ showConfirm: false });
          }}
          onConfirm={async () => {
            try {
              await batchEnsure(params || {});
              if (typeof refetch === 'function') {
                await refetch();
              }
              message.success(changeChineseToLocale('批量确认数据成功'));
            } catch (e) {
              log.error(e);
            } finally {
              this.setState({ showConfirm: false });
            }
          }}
        >
          <Button style={{ marginLeft: 10, verticalAlign: 'bottom' }}>
            <Icon type={'check-square-o'} />
            <span>{changeChineseToLocale('批量确认无差异数据')}</span>
          </Button>
        </Popconfirm>
      );
    }

    if (!showConfirm) {
      return (
        <Button
          style={{ marginLeft: 10, verticalAlign: 'bottom' }}
          onClick={async () => {
            const res = await getBatchEnsureAmount(params || {});
            const amount = _.get(res, 'data.data');

            this.setState({ amount, showConfirm: true });
          }}
        >
          <Icon type={'check-square-o'} />
          <span>{changeChineseToLocale('批量确认无差异数据')}</span>
        </Button>
      );
    }
  }
}

BatchEnsureData.propTypes = {
  style: PropTypes.object,
  match: PropTypes.any,
  refetch: PropTypes.any,
};

BatchEnsureData.contextTypes = {
  changeChineseToLocale: PropTypes.any,
  changeChineseTemplateToLocale: PropTypes.any,
  intl: PropTypes.any,
};

export default withRouter(BatchEnsureData);
