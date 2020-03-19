import React, { Component } from 'react';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router-dom';

import { Icon, Button, Checkbox, message, PlainText } from 'components';
import {
  changeChineseToLocale,
  changeChineseTemplateToLocale,
  changeChineseToLocaleWithoutIntl,
} from 'utils/locale/utils';
import { fontSub } from 'styles/color';

type Props = {
  history: any,
  bulkExport: Boolean,
  tableParams: {},
  onSelectChange: () => {},
  onBulkExportChange: () => {},
  intl: any,
};

class WeighingTaskActions extends Component {
  props: Props;
  state = {};

  render() {
    const { bulkExport, tableParams, intl } = this.props;
    const { selectedRowKeys, total, allSelected } = tableParams || {};
    if (bulkExport) {
      return (
        <div style={{ marginBottom: 10, padding: '0 20px' }}>
          <Checkbox
            style={{ display: 'inline-block' }}
            onClick={e => {
              this.props.onSelectChange({
                allSelected: e.target.checked,
                selectedRowKeys: [],
                selectedRows: [],
              });
            }}
          >
            全选
          </Checkbox>
          <Button
            style={{ margin: '0 5px 10px' }}
            onClick={() => {
              if (allSelected && total > 100) {
                message.error(changeChineseTemplateToLocale('单次导出不可超过', { maxNum: 100 }, intl));
              } else if (!allSelected && _.isEmpty(selectedRowKeys)) {
                message.error(changeChineseToLocaleWithoutIntl('请勾选任务'));
              } else if (!allSelected && selectedRowKeys && selectedRowKeys.length > 100) {
                message.error(changeChineseTemplateToLocale('单次导出不可超过{maxNum}个任务', { maxNum: 100 }, intl));
              } else {
                this.props.exportData();
                this.props.onBulkExportChange();
              }
            }}
          >
            确定
          </Button>
          <Button type="ghost" style={{ margin: '0 5px 10px' }} onClick={this.props.onBulkExportChange}>
            取消
          </Button>
          <PlainText
            style={{ margin: '0 5px', color: fontSub }}
            text="单次导出不可超过{maxNum}个任务，已选{selectedNum}个结果"
            intlParams={{ maxNum: 100, selectedNum: allSelected ? total : _.get(selectedRowKeys, 'length', 0) }}
          />
        </div>
      );
    }
    return (
      <div style={{ marginBottom: 20, padding: '0 20px' }}>
        <Button
          icon="plus-circle-o"
          style={{ marginRight: '20px' }}
          onClick={() => this.props.history.push('/weighingManagement/weighingTask/create')}
        >
          创建称量任务
        </Button>
        <Button iconType="gc" icon="piliangcaozuo" disabled={!total} onClick={this.props.onBulkExportChange}>
          批量导出称量记录
        </Button>
      </div>
    );
  }
}

export default withRouter(injectIntl(WeighingTaskActions));
