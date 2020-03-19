import React, { Fragment } from 'react';
import _ from 'lodash';
import { FormItem, Searchselect, Radio, Input, Select, Attachment } from 'components';
import { error } from 'styles/color/index';
import PropTypes from 'prop-types';

import { RECORD_TYPE, CHECKCOUNT_TYPE, TASK_CREATE_TYPE } from '../../constants';

type Props = {
  qcConfigData: {},
  itemList: Array,
  form: any,
  edit: Boolean,
};

const Option = Select.Option;

const QcPlanQcConfigPanel = (props: Props, context) => {
  const {
    qcConfigData,
    itemList,
    form: { getFieldDecorator, getFieldValue, getFieldError },
  } = props;
  if (_.isEmpty(qcConfigData)) return null;

  const {
    name,
    workStationId,
    autoCreateQcTask,
    taskCreateType,
    operatorId,
    checkCountType,
    checkCount,
    recordType,
    scrapInspection,
    attachmentFiles,
  } = qcConfigData;
  const { changeChineseToLocale } = context;

  const QcConfigName = (
    <FormItem label={changeChineseToLocale('名称')}>
      {getFieldDecorator('qcConfigName', {
        initialValue: name,
      })(<Fragment>{name}</Fragment>)}
    </FormItem>
  );

  const QcWorkstation = (
    <FormItem label={changeChineseToLocale('工位')}>
      {getFieldDecorator('workStationId', {
        initialValue: workStationId,
      })(<Searchselect type="workstation" />)}
    </FormItem>
  );

  const QcTaskOperator = (
    <FormItem label={changeChineseToLocale('质检执行人')}>
      {getFieldDecorator('operatorId', {
        initialValue: operatorId,
      })(<Searchselect type="qualityMembers" />)}
    </FormItem>
  );

  const QcTaskCreateType = (
    <FormItem label={changeChineseToLocale('质检频次')}>
      {getFieldDecorator('taskCreateType', {
        initialValue: taskCreateType,
      })(
        <Select>
          {Object.keys(TASK_CREATE_TYPE).map(key => (
            <Option value={Number(key)}>{TASK_CREATE_TYPE[key]}</Option>
          ))}
        </Select>,
      )}
    </FormItem>
  );

  const AutoCreateQcTask = (
    <FormItem label={changeChineseToLocale('自动创建质检任务')}>
      {getFieldDecorator('autoCreateQcTask', {
        initialValue: autoCreateQcTask,
        rules: [{ required: true, message: changeChineseToLocale('自动创建质检任务必填') }],
      })(
        <Radio.Group
          options={[
            { label: changeChineseToLocale('是'), value: true },
            { label: changeChineseToLocale('否'), value: false },
          ]}
        />,
      )}
    </FormItem>
  );

  const CheckCountType = (
    <FormItem label={changeChineseToLocale('质检方式')}>
      {getFieldDecorator('checkCountType', {
        initialValue: checkCountType,
      })(
        <Select>
          {Object.keys(CHECKCOUNT_TYPE).map(key => (
            <Option value={Number(key)}>{CHECKCOUNT_TYPE[key]}</Option>
          ))}
        </Select>,
      )}
    </FormItem>
  );

  const CheckCount = (
    <FormItem label={changeChineseToLocale('质检数量')}>
      {getFieldDecorator('checkCount', {
        initialValue: checkCount,
      })(<Input />)}
    </FormItem>
  );

  const RecordType = (
    <FormItem label={changeChineseToLocale('记录方式')}>
      {getFieldDecorator('recordType', {
        initialValue: recordType,
      })(
        <Select>
          {Object.keys(RECORD_TYPE).map(key => (
            <Option value={Number(key)}>{RECORD_TYPE[key]}</Option>
          ))}
        </Select>,
      )}
    </FormItem>
  );

  const ScrapInspection = (
    <FormItem label={changeChineseToLocale('报废性检查')}>
      {getFieldDecorator('scrapInspection', {
        initialValue: scrapInspection,
        rules: [{ required: true, message: changeChineseToLocale('报废性检查必填') }],
      })(
        <Radio.Group
          options={[
            { label: changeChineseToLocale('是'), value: true },
            { label: changeChineseToLocale('否'), value: false },
          ]}
        />,
      )}
    </FormItem>
  );

  const Attachments = (
    <FormItem label={changeChineseToLocale('附件')}>
      {getFieldDecorator('attachments', {
        initialValue: attachmentFiles,
      })(<Attachment />)}
    </FormItem>
  );

  const CheckItemsList = () => {
    return (
      <FormItem label={changeChineseToLocale('质检项列表')}>
        {getFieldDecorator('attachments', {
          initialValue: attachmentFiles,
        })(<Attachment />)}
      </FormItem>
    );
    // return <Table pagination={false} columns={columns} dataSource={dataSource} style={{ margin: 0, width: '80%' }} />;
  };

  const renderQcTaskCreateInterval = createType => {
    switch (createType) {
      case 1:
        break;
      default:
        break;
    }
  };

  const renderAutoCreateQcTaskSettings = () => {
    console.log(typeof getFieldValue('taskCreateType'));
    if (!getFieldValue('autoCreateQcTask')) {
      return AutoCreateQcTask;
    }
    return (
      <Fragment>
        {AutoCreateQcTask}
        <div>
          {QcTaskCreateType}
          <FormItem style={{ display: 'inline-block' }}>
            {getFieldError('taskCreateIntervalValue') || getFieldError('taskCreateCount') ? (
              <div style={{ color: error }}>
                {getFieldError('taskCreateIntervalValue') || getFieldError('taskCreateCount')}
              </div>
            ) : null}
          </FormItem>
        </div>
      </Fragment>
    );
  };

  const renderFormItems = item => {
    switch (item) {
      case 'qcConfigName':
        return QcConfigName;
      case 'qcWorkstation':
        return QcWorkstation;
      case 'autoCreateQcTask':
        return renderAutoCreateQcTaskSettings();
      case 'qcTaskCreateType':
        return QcTaskCreateType;
      case 'qcTaskOperator':
        return QcTaskOperator;
      case 'checkCountType':
        return CheckCountType;
      case 'checkCount':
        return CheckCount;
      case 'recordType':
        return RecordType;
      case 'scrapInspection':
        return ScrapInspection;
      case 'attachments':
        return Attachments;
      case 'checkItemsList':
        return CheckItemsList;
      default:
        break;
    }
  };

  return <div>{itemList.map(name => renderFormItems(name))}</div>;
};

QcPlanQcConfigPanel.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default QcPlanQcConfigPanel;
