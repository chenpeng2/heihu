import React from 'react';
import _ from 'lodash';
import { injectIntl } from 'react-intl';
import { Spin, DetailPageItemContainer, Link } from 'src/components';
import { useFetch } from 'src/utils/hookUtils/fetchHooks';
import { arrayIsEmpty } from 'src/utils/array';
import { getQcTaskListByMaterialLotId } from 'src/services/qualityManagement/qcTask';
import { QcReportDetailContent, NoContentConfirm } from 'src/views/qualityManagement/qcTask/detail/qcReportDetail';
import { getCheckSingleNum } from 'src/views/qualityManagement/qcTask/utils';
import { ONLY_RESULT_DEFECT, BY_ENTITY, BY_CHECK_ITEM } from 'src/views/qualityManagement/constants';
import { toQcTaskDetail } from 'src/views/qualityManagement/navigation';
import ViewQcMaterial from 'src/views/qualityManagement/qcTask/detail/viewQcMaterial';
import { borderGrey } from 'src/styles/color';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { itemContainerStyle } from './index';
import styles from './style.scss';

type Props = {
  history: any,
  materialLotId: String,
  intl: any,
};

const QcReport = (props: Props) => {
  const { materialLotId, history, intl } = props;
  const [{ data, isLoading }] = useFetch(async () => getQcTaskListByMaterialLotId(materialLotId)) || {};
  const qcTaskData = _.get(data, 'data.data');
  const noQcTaskReport = data => {
    const { recordType, reports } = data;
    const singleNum = getCheckSingleNum(data);
    const haveQcReportValues = !arrayIsEmpty(reports) && reports.some(n => !arrayIsEmpty(n.qcReportValues));
    return (
      (recordType === ONLY_RESULT_DEFECT && arrayIsEmpty(reports)) ||
      (recordType !== ONLY_RESULT_DEFECT && (!haveQcReportValues || !singleNum))
    );
  };
  const qcTaskReports = !arrayIsEmpty(qcTaskData) && qcTaskData.filter(n => !noQcTaskReport(n));

  return (
    <Spin spinning={isLoading}>
      <div className={styles.qcReport} style={itemContainerStyle}>
        <DetailPageItemContainer
          contentStyle={{ width: '100%', padding: '10px 0 10px 0' }}
          itemHeaderTitle={changeChineseToLocale('质检报告明细', intl)}
        >
          {!arrayIsEmpty(qcTaskReports)
            ? qcTaskReports.map((node, index) => {
                const { code, reports, recordType } = node || {};
                const materialName = _.get(node, 'material.name', '');
                const singleNum = getCheckSingleNum(node);
                const isLast = index === qcTaskReports.length - 1;
                let havePagination = false;
                if (recordType === ONLY_RESULT_DEFECT || recordType === BY_ENTITY) {
                  havePagination = !arrayIsEmpty(reports) && reports.length > 10;
                } else if (recordType === BY_CHECK_ITEM) {
                  havePagination = singleNum > 10;
                }
                return (
                  <div style={{ maxHeight: 1200, overflow: 'scroll' }}>
                    <div style={{ marginBottom: havePagination ? 60 : 10 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: 10,
                          padding: '0 20px',
                        }}
                      >
                        <span>
                          {changeChineseToLocale('质检任务编号')}：{code}
                        </span>
                        <Link
                          onClick={() => {
                            history.push(toQcTaskDetail({ code }));
                          }}
                        >
                          {changeChineseToLocale('详情')}
                        </Link>
                      </div>
                      {QcReportDetailContent(node)}
                    </div>
                    <div style={{ marginBottom: !isLast ? 20 : 'unset' }}>
                      <ViewQcMaterial data={node} materialName={materialName} type={'sample'} />
                      {!isLast ? (
                        <div style={{ borderBottom: `1px solid ${borderGrey}`, margin: '10px 20px' }} />
                      ) : null}
                    </div>
                  </div>
                );
              })
            : NoContentConfirm(changeChineseToLocale('暂无数据', intl))}
        </DetailPageItemContainer>
      </div>
    </Spin>
  );
};

export default injectIntl(QcReport);
