import React from 'react';
import _ from 'lodash';
import { Tooltip, Link, openModal, Attachment } from 'src/components';
import { replaceSign } from 'src/constants';
import { error } from 'src/styles/color';
import { arrayIsEmpty } from 'utils/array';
import { ORGANIZATION_CONFIG, getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import { LOGIC } from 'src/views/qualityManagement/constants';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import styles from './styles.scss';

const AttachmentImageView = Attachment.ImageView;

// 此处展示分两种质检方式。每种方式四种情况

type Props = {
  data: any,
  customDefectText: String,
};

export const renderRemark = remark =>
  remark ? (
    <div style={{ marginTop: 5 }}>
      <span style={{ position: 'absolute' }}>“</span>
      <Tooltip containerStyle={{ marginLeft: 6 }} text={remark} width={120} />
      <span style={{ position: 'absolute' }}>”</span>
    </div>
  ) : null;

export const renderAttachment = attachmentIds => {
  if (!arrayIsEmpty(attachmentIds)) {
    const attachment = {
      files: attachmentIds.map(id => ({ id })),
    };
    return (
      <Link
        icon="paper-clip"
        onClick={() => {
          openModal({
            title: '附件',
            width: 830,
            footer: null,
            children: <AttachmentImageView attachment={attachment} />,
          });
        }}
      >
        {changeChineseToLocaleWithoutIntl('附件')}：{!arrayIsEmpty(attachmentIds) ? attachmentIds.length : 0}
      </Link>
    );
  }
  return null;
};

export const getDefectResult = (data, customDefectText) => {
  const { value, desc, logic } = data || {};
  let defectDisplay = replaceSign;
  switch (logic) {
    case LOGIC.YN:
      defectDisplay = customDefectText;
      break;
    case LOGIC.MANUAL:
      defectDisplay = desc || replaceSign;
      break;
    default:
      if (value || value === 0) {
        defectDisplay = value;
      }
  }
  return defectDisplay;
};

// 渲染记录方式为质检项记录或单体记录
export const DefectDetail = (props: Props) => {
  const { data, customDefectText } = props;
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';
  const haveComment = _.get(configs, `${ORGANIZATION_CONFIG.configQcCheckItemComment}.configValue`) === 'true';
  if (data && data.noCheckItem) return replaceSign;
  const { qcReportDefectValues, remark, attachmentIds } = data || {};
  const defectDisplay = getDefectResult(data, customDefectText);

  return (
    <div className={styles.normalDisplay}>
      {!arrayIsEmpty(qcReportDefectValues) &&
      !qcReportDefectValues.every(n => (!haveQcDefectRank || !n.qcDefectRank) && !n.qcDefectReason) ? (
        qcReportDefectValues.map((data, index) => {
          const { qcDefectReason, qcDefectRank } = data || {};
          if (haveQcDefectRank && qcDefectRank && qcDefectReason) {
            return (
              <div>
                {index === 0 ? <Tooltip width={110} containerStyle={{ color: error }} text={defectDisplay} /> : null}
                <div className={styles.defectDetailItem}>
                  <Tooltip text={qcDefectReason.name} width={40} />
                  &nbsp; {changeChineseToLocaleWithoutIntl('等级')}：
                  <Tooltip text={qcDefectRank.code} width={40} />
                </div>
              </div>
            );
          }
          if (haveQcDefectRank && qcDefectRank && !qcDefectReason) {
            return (
              <div className={styles.defectDetailItem}>
                <Tooltip width={40} containerStyle={{ marginRight: 5, color: error }} text={defectDisplay} />
                {changeChineseToLocaleWithoutIntl('等级')}：
                <Tooltip text={qcDefectRank.code} width={40} />
              </div>
            );
          }
          if ((!haveQcDefectRank || !qcDefectRank) && qcDefectReason) {
            return (
              <div>
                {index === 0 ? <Tooltip width={110} containerStyle={{ color: error }} text={defectDisplay} /> : null}
                <Tooltip text={qcDefectReason.name} width={110} />
              </div>
            );
          }
          return replaceSign;
        })
      ) : (
        <Tooltip width={110} containerStyle={{ color: error }} text={defectDisplay} />
      )}
      {haveComment ? renderRemark(remark) : null}
      {renderAttachment(attachmentIds)}
    </div>
  );
};

export const DefectDetailByOnlyRecordDefect = (props: Props) => {
  const { data } = props;
  const { qcReportDefectValues, defect } = data;
  const configs = getOrganizationConfigFromLocalStorage();
  const haveQcDefectRank = _.get(configs, `${ORGANIZATION_CONFIG.qcDefectRanked}.configValue`) === 'true';

  // 无次品数时不需要展示不良细分
  if (!defect || arrayIsEmpty(qcReportDefectValues)) {
    return replaceSign;
  }

  return (
    <div>
      {arrayIsEmpty(qcReportDefectValues)
        ? null
        : qcReportDefectValues.map(n => {
            const { defectCount, qcDefectReason, qcDefectRank } = n || {};
            if (haveQcDefectRank && qcDefectRank && qcDefectReason) {
              return (
                <div>
                  <div className={styles.defectDetailItem_onlyRecordDefect}>
                    <Tooltip text={qcDefectReason.name} width={60} />：
                    <span style={{ color: error, marginRight: 5 }}>{defectCount}</span>
                    <Tooltip text={`${changeChineseToLocaleWithoutIntl('等级')}：${qcDefectRank.code}`} width={60} />
                  </div>
                </div>
              );
            }
            if (haveQcDefectRank && qcDefectRank && !qcDefectReason) {
              return (
                <div className={styles.defectDetailItem_onlyRecordDefect}>
                  <span style={{ marginRight: 5, color: error }}>{defectCount}</span>
                  <Tooltip text={`${changeChineseToLocaleWithoutIntl('等级')}：${qcDefectRank.code}`} width={120} />
                </div>
              );
            }
            if ((!haveQcDefectRank || !qcDefectRank) && qcDefectReason) {
              return (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Tooltip text={qcDefectReason.name} width={120} />：<div style={{ color: error }}>{defectCount}</div>
                </div>
              );
            }
            if ((!haveQcDefectRank || !qcDefectRank) && !qcDefectReason) {
              return (
                <div>
                  <div>{defect || replaceSign}</div>
                </div>
              );
            }
            return replaceSign;
          })}
    </div>
  );
};
