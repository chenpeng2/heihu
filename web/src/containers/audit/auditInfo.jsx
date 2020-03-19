import React, { Component, Fragment } from 'react';
import { Steps } from 'components';
import { formatUnix } from 'utils/time';
import { replaceSign } from 'constants';
import { arrayIsEmpty } from 'utils/array';
import styles from './styles.scss';

const Step = Steps.Step;
// const AUDIT_INFO_TEST = {
//   auditors: [
//     {
//       id: 11628,
//       name: '小1',
//       audited: true,
//       remark: '第一个人审批通过',
//       remarkDate: 1553686554757,
//     },
//     {
//       id: 11627,
//       name: '管理员',
//       audited: true,
//       remark: null,
//       remarkDate: 1553687465677,
//     },
//     {
//       id: 11629,
//       name: '小2',
//       audited: true,
//       remark: '第三个人审批通过',
//       remarkDate: 1553688448579,
//     },
//   ],
// };

const formatAuditInfo = auditInfo => {
  const { auditors } = auditInfo;
  return {
    ...auditInfo,
    auditors: auditors
      .filter(e => e.audited)
      .map(auditor => {
        return {
          status: 'finish',
          result: '已通过',
          ...auditor,
        };
      }),
  };
};

type props = {
  auditInfo: {},
};

// 展示审批历史（只包含已通过的部分）
class AuditInfo extends Component<props> {
  state = {};

  render() {
    const { auditInfo: _auditInfo } = this.props;
    const auditInfo = _auditInfo;
    if (auditInfo && auditInfo.auditors && auditInfo.auditors.length > 0) {
      const { auditors, currPos } = formatAuditInfo(auditInfo);
      if (arrayIsEmpty(auditors)) {
        return <span>暂无数据</span>;
      }
      return (
        <Steps
          className={styles.auditProcess}
          style={{ paddingTop: 10 }}
          direction="vertical"
          size="small"
          current={currPos}
        >
          {auditors.map((auditor, i) => {
            const { status, result, name, remark, remarkDate } = auditor;
            const title = (
              <Fragment>
                <div>
                  {name}
                  <span className="auditPageTip">{result}</span>
                  {formatUnix(remarkDate)}
                </div>
                <div className="remark">{remark || replaceSign}</div>
              </Fragment>
            );
            return <Step status={status} title={title} />;
          })}
        </Steps>
      );
    }
    return replaceSign;
  }
}

export default AuditInfo;
