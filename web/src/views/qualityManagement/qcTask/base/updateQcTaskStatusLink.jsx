import React from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import {
  Link,
  message,
  authorityWrapper,
  Popconfirm,
  withForm,
  FormItem,
  Textarea,
  openModal,
  SendNotification,
} from 'components';
import { changeChineseTemplateToLocale, changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { sendMessage } from 'src/services/account/message';
import { updateQcTaskStatus } from 'src/services/qualityManagement/qcTask';
import log from 'src/utils/log';
import { replaceSign, NOTICE_CATEGORY } from 'src/constants';
import { getNeedRemark, getNeedTransferNotice, getCheckTypeDisplay } from '../utils';
import styles from './styles.scss';

const LinkWithAuth = authorityWrapper(Link);

const UpdateQcTaskStatusLink = props => {
  const {
    taskCode,
    status,
    children,
    onSuccess,
    onFail,
    form,
    actionType,
    customRuleList,
    taskData,
    extraFunc,
    intl,
    ...rest
  } = props || {};
  const { material, qcConfig, qcTaskClassification, operatorId } = taskData || {};
  const { code: materialCode, name: materialName } = material || {};
  const { checkType, name: qcConfigName } = qcConfig || {};
  const { getFieldDecorator, getFieldValue } = form;
  const needRemark = getNeedRemark(customRuleList);
  const needTransferNotice = getNeedTransferNotice(customRuleList);
  const checkTypeDisplay = changeChineseToLocaleWithoutIntl(getCheckTypeDisplay(qcTaskClassification, checkType));

  const passFunc = description => {
    if (taskCode) {
      updateQcTaskStatus(taskCode, status, description)
        .then(res => {
          const statusCode = _.get(res, 'data.statusCode');
          if (statusCode === 200) {
            if (typeof onSuccess === 'function') {
              onSuccess();
            }
          } else if (typeof onFail === 'function') {
            onFail();
          }
          const messageInfo = {
            category: NOTICE_CATEGORY.qcReportAuditAuto.key,
            userIds: [operatorId],
            body: {
              title: changeChineseTemplateToLocale(
                '质检审核{actionType}',
                {
                  actionType: changeChineseToLocaleWithoutIntl(actionType === 'pass' ? '通过' : '拒绝'),
                },
                intl,
              ),
              content: changeChineseTemplateToLocale(
                '物料[{materialCode}|{materialName}]，{checkTypeDisplay} {qcConfigName} 审核{actionType}，点击查看',
                {
                  materialCode,
                  materialName,
                  qcConfigName,
                  checkTypeDisplay,
                  actionType: changeChineseToLocaleWithoutIntl(actionType === 'pass' ? '通过' : '拒绝'),
                },
                intl,
              ),
              meta: {
                category: NOTICE_CATEGORY.qcReportAuditAuto.key,
                entityCode: taskCode,
              },
            },
          };
          sendMessage(messageInfo)
            .then(() => {
              message.success('已发送给对应的接收人');
              if (needTransferNotice && actionType === 'pass') {
                const noticeInfo = {
                  noticeCategory: NOTICE_CATEGORY.qcReportAuditManual.key,
                  noticeTitle: changeChineseTemplateToLocale(
                    '{checkTypeDisplay} {qcConfigName} 审核通过',
                    {
                      checkTypeDisplay,
                      qcConfigName,
                    },
                    intl,
                  ),
                  noticeContent: changeChineseTemplateToLocale(
                    '物料[{materialCode}|{materialName}]，{checkTypeDisplay} {qcConfigName} 审核通过，可以进行库存转移了',
                    { materialCode, materialName, checkTypeDisplay, qcConfigName },
                    intl,
                  ),
                  noticeMeta: {
                    category: NOTICE_CATEGORY.qcReportAuditManual.key,
                    entityCode: taskCode,
                  },
                };
                openModal({
                  title: '物料转移通知',
                  footer: null,
                  children: <SendNotification noticeInfo={noticeInfo} onSend={extraFunc} />,
                  width: '58%',
                  onCancel: () => {
                    extraFunc();
                  },
                });
              } else {
                extraFunc();
              }
            })
            .catch(e => {
              log.error(e);
            });
        })
        .catch(err => console.log(err));
    }
  };

  return (
    <div className={styles.qcReportAuditList}>
      {needRemark ? (
        <Popconfirm
          title={
            <div>
              <div>
                {changeChineseTemplateToLocale(
                  '确定{actionType}该项质检报告吗？',
                  {
                    actionType: actionType === 'pass' ? '通过' : '拒绝',
                  },
                  intl,
                )}
              </div>
              <FormItem label="备注">
                {getFieldDecorator('remark')(
                  <Textarea maxLength={200} style={{ width: 180, height: 48 }} placeholder="最多输入200字" />,
                )}
              </FormItem>
            </div>
          }
          onConfirm={() => {
            const description = getFieldValue('remark');
            passFunc(description);
          }}
          getPopupContainer={() => document.getElementsByClassName(styles.qcReportAuditList)[0]}
          okText={changeChineseToLocaleWithoutIntl(actionType === 'pass' ? '通过' : '拒绝')}
          okType={actionType === 'pass' ? 'primary' : 'danger'}
          cancelText={changeChineseToLocaleWithoutIntl('取消')}
        >
          <LinkWithAuth {...rest}>{children || replaceSign}</LinkWithAuth>
        </Popconfirm>
      ) : (
        <LinkWithAuth
          onClick={() => {
            passFunc();
          }}
          {...rest}
        >
          {children || replaceSign}
        </LinkWithAuth>
      )}
    </div>
  );
};

UpdateQcTaskStatusLink.propTypes = {
  taskCode: PropTypes.string.required,
  status: PropTypes.number.required,
  children: PropTypes.any,
  onSuccess: PropTypes.func,
  onFail: PropTypes.func,
  extraFunc: PropTypes.func,
  customRuleList: PropTypes.array,
  taskData: PropTypes.object,
  changeChineseTemplateToLocale: PropTypes.any,
};

const mapStateToProps = ({ organizationConfig }) => ({
  customRuleList: organizationConfig && organizationConfig.customRuleList,
});

export default connect(mapStateToProps)(withRouter(withForm({}, injectIntl(UpdateQcTaskStatusLink))));
