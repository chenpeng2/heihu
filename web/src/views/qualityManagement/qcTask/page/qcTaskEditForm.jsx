import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Select } from 'antd';
import { replaceSign } from 'src/constants';
import { withForm, Form, FormItem, DatePicker } from 'components';
import { changeChineseToLocaleWithoutIntl } from 'src/utils/locale/utils';
import { updateQcTask, queryQcMembersByWorkstation } from 'src/services/qualityManagement/qcTask';
import { formatToUnix, formatUnixMoment } from 'utils/time';
import SearchSelect from 'src/components/select/searchSelect';
import SecondStorageSelect from './secondStorageSelect';
import { getCheckTypeDisplay } from '../utils';
import styles from './styles.scss';

const Option = Select.Option;

type Props = {
  form: {
    getFieldDecorator: () => {},
    setFieldsValue: () => {},
    getFieldValue: () => {},
  },
  data: {},
  onOk: () => {},
  onSuccess: () => {},
  data: {},
};

class EditQcTask extends Component {
  props: Props;

  state = {
    workstationId: null,
    operators: [],
  };

  componentDidMount() {
    const { data } = this.props;
    this.setState(
      {
        workstationId: _.get(data, 'workstationId', undefined),
      },
      () => {
        const { workstationId } = this.state;
        if (workstationId) {
          this.fetchOperators(workstationId);
        }
      },
    );
  }

  formatData = values => {
    const { storageId } = values;
    values.operatorId = _.get(values, 'operatorId.key', undefined);
    values.workstationId = _.get(values, 'workstationId.key', undefined);
    values.storageId = storageId ? storageId.value.split('-')[1] : undefined;
    values.plannedStartTime = _.toNumber(formatToUnix(values.plannedStartTime));
    values = _.omitBy(values, _.isNaN);
    return _.omitBy(values, _.isUndefined);
  };

  fetchOperators = async id => {
    await queryQcMembersByWorkstation(id)
      .then(({ data: { data } }) => {
        this.setState({
          operators: data,
        });
      })
      .catch(e => console.log(e));
  };

  submit = value => {
    const { onSuccess, form, data, onOk } = this.props;
    const code = _.get(data, 'code', undefined);
    if (code) {
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const _format = this.formatData(values);
          return updateQcTask(code, _format).then(res => {
            onOk();
            if (onSuccess) {
              onSuccess();
            }
          });
        }
        return null;
      });
    }
  };

  renderProdCheckType = data => {
    const {
      form: { getFieldDecorator, setFieldsValue },
    } = this.props;
    const { qcTaskClassification, checkType } = data;
    const { operators, workstationId } = this.state;
    const type = getCheckTypeDisplay(qcTaskClassification, checkType);

    return (
      <div className={styles.editQcTaskForm}>
        <FormItem label="编号">
          {getFieldDecorator('code')(<p className={styles.onlyReadText}>{data.code}</p>)}
        </FormItem>
        <FormItem label="类型">
          {getFieldDecorator('checkType')(
            <p className={styles.onlyReadText}>{changeChineseToLocaleWithoutIntl(type)}</p>,
          )}
        </FormItem>
        <FormItem label="工序序号">
          {getFieldDecorator('processSeq')(
            <p className={styles.onlyReadText}>{_.get(data, 'task.processSeq', replaceSign)}</p>,
          )}
        </FormItem>
        <FormItem label="工序名称">
          {getFieldDecorator('processName')(
            <p className={styles.onlyReadText}>{_.get(data, 'task.processName', replaceSign)}</p>,
          )}
        </FormItem>
        <FormItem label="工位">
          {getFieldDecorator('workstationId', {
            rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择工位') }],
            initialValue: _.get(data, 'workstation', undefined)
              ? { key: _.get(data, 'workstation.id', undefined), label: _.get(data, 'workstation.name', undefined) }
              : undefined,
          })(
            <SearchSelect
              type="workstation"
              placeholder={changeChineseToLocaleWithoutIntl('请选择工位')}
              style={{ width: 200 }}
              onSelect={value => {
                this.setState(
                  {
                    workstationId: value && value.key,
                  },
                  () => {
                    const { workstationId } = this.state;
                    this.fetchOperators(workstationId);
                    setFieldsValue({
                      operatorId: { key: undefined, label: undefined },
                    });
                  },
                );
              }}
              onChange={value => {
                if (!value) {
                  setFieldsValue({
                    operatorId: { key: undefined, label: undefined },
                  });
                }
              }}
            />,
          )}
        </FormItem>
        {workstationId ? (
          <FormItem id="operator" label="执行人" required>
            {getFieldDecorator('operatorId', {
              rules: [
                {
                  validator: (rule, value, cb) => {
                    if (value && !value.key) {
                      cb(changeChineseToLocaleWithoutIntl('请选择执行人'));
                    }
                    cb();
                  },
                },
              ],
              initialValue: _.get(data, 'operatorId', undefined)
                ? { key: _.get(data, 'operatorId'), label: _.get(data, 'operatorName') }
                : undefined,
            })(
              <Select
                allowClear
                labelInValue
                showSearch
                placeholder={changeChineseToLocaleWithoutIntl('请选择执行人')}
                style={{ width: 200 }}
              >
                {operators.map(({ id, name }) => (
                  <Option value={id}>{name}</Option>
                ))}
              </Select>,
            )}
          </FormItem>
        ) : (
          <FormItem label="执行人">
            {getFieldDecorator('operatorId', {
              rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择执行人') }],
              initialValue: _.get(data, 'operatorId', undefined)
                ? { key: _.get(data, 'operatorId', undefined), label: _.get(data, 'operatorName', undefined) }
                : undefined,
            })(
              <SearchSelect
                type="qcMembers"
                placeholder={changeChineseToLocaleWithoutIntl('请选择执行人')}
                style={{ width: 200 }}
              />,
            )}
          </FormItem>
        )}
        <FormItem label="计划开始时间">
          {getFieldDecorator('plannedStartTime', {
            initialValue: data.plannedStartTime ? formatUnixMoment(data.plannedStartTime) : undefined,
          })(
            <DatePicker
              style={{ width: 200 }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={changeChineseToLocaleWithoutIntl('请选择计划开始时间')}
              allowClear={false}
            />,
          )}
        </FormItem>
      </div>
    );
  };

  renderOtherCheckType = data => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { qcTaskClassification, checkType } = data;
    const type = getCheckTypeDisplay(qcTaskClassification, checkType);

    return (
      <div className={styles.editQcTaskForm}>
        <FormItem label="编号">
          {getFieldDecorator('code')(<p className={styles.onlyReadText}>{data.code}</p>)}
        </FormItem>
        <FormItem label="类型">
          {getFieldDecorator('checkType')(
            <p className={styles.onlyReadText}>{changeChineseToLocaleWithoutIntl(type)}</p>,
          )}
        </FormItem>
        <FormItem label="物料编号/名称">
          {getFieldDecorator('material')(
            <p className={styles.onlyReadText}>
              {_.get(data, 'materialCode')
                ? `${_.get(data, 'materialCode')}/${_.get(data, 'material.name', replaceSign)}`
                : replaceSign}
            </p>,
          )}
        </FormItem>
        <FormItem label="仓位">
          {getFieldDecorator('storageId', {
            rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择仓位') }],
            initialValue: _.get(data, 'storage', undefined)
              ? { value: `3-${_.get(data, 'storage.id', undefined)}`, label: _.get(data, 'storage.name', undefined) }
              : undefined,
          })(<SecondStorageSelect style={{ width: 200 }} />)}
        </FormItem>
        <FormItem label="执行人">
          {getFieldDecorator('operatorId', {
            rules: [{ required: true, message: changeChineseToLocaleWithoutIntl('请选择执行人') }],
            initialValue: _.get(data, 'operatorId', undefined)
              ? { key: _.get(data, 'operatorId', undefined), label: _.get(data, 'operatorName', undefined) }
              : undefined,
          })(<SearchSelect type="qcMembers" placeholder="请选择执行人" style={{ width: 200 }} />)}
        </FormItem>
        <FormItem label="计划开始时间">
          {getFieldDecorator('plannedStartTime', {
            initialValue: data.plannedStartTime ? formatUnixMoment(data.plannedStartTime) : undefined,
          })(
            <DatePicker
              style={{ width: 200 }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={changeChineseToLocaleWithoutIntl('请选择计划开始时间')}
              allowClear={false}
            />,
          )}
        </FormItem>
      </div>
    );
  };

  render() {
    const { data } = this.props;
    return _.indexOf([2, 3], data.checkType) !== -1 ? this.renderProdCheckType(data) : this.renderOtherCheckType(data);
  }
}

const QcTaskEditForm = withForm({ showFooter: true }, EditQcTask);

export default QcTaskEditForm;
