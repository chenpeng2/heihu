import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import { withRouter } from 'react-router-dom';
import { arrayIsEmpty } from 'src/utils/array';
import PropTypes from 'prop-types';
import { haveAuthority, Button, buttonAuthorityWrapper, Checkbox } from 'src/components';
import MyStore from 'store';
import { setBatchOperation, setAllChecked, setSelectedRows } from 'src/store/redux/actions/qualityManagement/qcTask';
import { border } from 'src/styles/color';
import { isOrganizationUseQrCode } from 'utils/organizationConfig';
import auth from 'src/utils/auth';
import { getCreateQcTaskUrl } from '../utils';
import { exportQcTaskDetail } from '../export/exportQcTaskDetail';
import ExportQcTask from '../export/exportQcTask';

const ButtonWithAuth = buttonAuthorityWrapper(Button);

type Props = {
  match: any,
  history: any,
  form: any,
  qcTaskState: {
    batchOperation: Boolean,
    allChecked: Boolean,
    selectedRows: Array,
    mutiExportVisible: Boolean,
  },
  total: Number,
};

const PageOperation = (props: Props, context) => {
  const { match, form, total, qcTaskState, history, intl } = props;
  const { changeChineseTemplateToLocale } = context;
  const { batchOperation, allChecked, selectedRows, mutiExportVisible } = qcTaskState;

  const renderExport = () => {
    const selectedAmount = !arrayIsEmpty(selectedRows) ? selectedRows.length : 0;

    return (
      <div style={{ marginLeft: 20 }}>
        {batchOperation ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 20 }}>
            <Checkbox
              style={{ marginRight: 23 }}
              checked={allChecked}
              onChange={e => {
                const checked = e.target.checked;
                MyStore.dispatch(setSelectedRows([]));
                MyStore.dispatch(setAllChecked(checked));
              }}
            >
              全选
            </Checkbox>
            <Button
              disabled={selectedAmount === 0 && !allChecked}
              style={{ width: 80, height: 28 }}
              onClick={() => {
                exportQcTaskDetail({ match, total, allChecked, selectedRows, intl, changeChineseTemplateToLocale });
              }}
            >
              确定
            </Button>
            <Button
              style={{ width: 80, height: 28, margin: '0 20px' }}
              type={'default'}
              onClick={() => {
                MyStore.dispatch(setBatchOperation(false));
                MyStore.dispatch(setAllChecked(false));
                MyStore.dispatch(setSelectedRows([]));
              }}
            >
              取消
            </Button>
            <span>
              {changeChineseTemplateToLocale('已选{amount}个', { amount: allChecked ? total : selectedAmount })}
            </span>
          </div>
        ) : (
          <Button
            icon="upload"
            onClick={() => {
              MyStore.dispatch(setBatchOperation(true));
            }}
            disabled={total === 0}
          >
            批量导出
          </Button>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        fontSize: 14,
        padding: 20,
        borderTop: `1px solid ${border}`,
        display: 'flex',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex' }}>
        {haveAuthority(auth.WEB_CREATE_QUALITY_TESTING_TASK) && isOrganizationUseQrCode() ? (
          <ButtonWithAuth
            auth={auth.WEB_CREATE_QUALITY_TESTING_TASK}
            icon="plus-circle-o"
            onClick={() => history.push(getCreateQcTaskUrl())}
          >
            创建质检任务
          </ButtonWithAuth>
        ) : (
          '质检任务列表'
        )}
        {mutiExportVisible ? renderExport() : null}
      </div>
      <ExportQcTask match={match} form={form} total={total} />
    </div>
  );
};

PageOperation.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.func,
};

const mapStateToProps = ({ qualityManagement }) => ({ qcTaskState: qualityManagement });

export default connect(mapStateToProps)(withRouter(injectIntl(PageOperation)));
