/**
 * @description: 排程批量创建转移申请
 *
 * @date: 2019/4/2 下午5:13
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';

import { black } from 'styles/color/index';
import { Spin, openModal, message, Button, withForm, FormItem, Radio } from 'components';
import moment, { diff } from 'utils/time';
import {
  getTransferApplyFromTask,
  getTransferApplyFromTaskAfterMerge,
  batchCreateTransferApply,
} from 'services/cooperate/materialRequest';
import log from 'utils/log';

import MaterialList from './materialList';
import {
  renderTooltip,
  formatFormValueForService,
  formatServiceDataToFormData,
  formatMaterialListValueToService,
} from './utils';

const RadioGroup = Radio.Group;

// 组件的三种状态
// 如果不需要合并那么是NOT_MERGE,合并第一步是MERGE_STEP_ONE,合并第二步是MERGE_STEP_TWO
const NOT_MERGE = 'notMerge';
const MERGE_STEP_ONE = 'mergeStepOne';
const MERGE_STEP_TWO = 'mergeStepTwo';

class CreateTransferApply extends Component {
  state = {
    mergeState: NOT_MERGE,
    loading: false,
    data: [],
    dataAfterMerge: [],
  };

  componentDidMount() {
    this.fetchAndSetDataForNoMerge();
    console.log(this.props);
  }

  // 拉取不合并的数据
  fetchAndSetDataForNoMerge = async () => {
    const taskCodes = _.get(this.props, 'match.location.query.taskCodes');
    this.setState({ loading: true });
    try {
      if (taskCodes) {
        const params = taskCodes.split(',');
        const res = await getTransferApplyFromTask(params);
        const data = _.get(res, 'data.data');
        this.setState({ data });
      }
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  // 拉取合并后的数据
  fetchAndSetDataForMerge = async (params, cb) => {
    this.setState({ loading: true });
    try {
      const res = await getTransferApplyFromTaskAfterMerge(params);
      const data = _.get(res, 'data.data');
      this.setState({ dataAfterMerge: data }, cb);
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  getFormValue = () => {
    const { form } = this.props;
    let res = null;
    form.validateFieldsAndScroll((err, value) => {
      if (!err) {
        if (!value || (!value.amount && !value.unitId)) {
          delete value.ratio;
        }
        res = value;
      }
    });

    return res;
  };

  renderButtons = () => {
    const { router } = this.context;
    const { mergeState } = this.state;
    const baseStyle = { width: 120 };

    // 不合并的时候是确定创建。需要合并的时候开始是去合并，然后是确定创建
    // 合并第二步的时候取消变回到上一步
    return (
      <div style={{ marginLeft: 120 }}>
        {mergeState === MERGE_STEP_TWO ? (
          <Button
            style={{ ...baseStyle }}
            type={'default'}
            onClick={() => {
              this.setState({ mergeState: MERGE_STEP_ONE });
            }}
          >
            上一步
          </Button>
        ) : (
          <Button
            style={{ ...baseStyle }}
            type={'default'}
            onClick={() => {
              router.history.go(-1);
            }}
          >
            取消
          </Button>
        )}
        {mergeState === MERGE_STEP_TWO || mergeState === NOT_MERGE ? (
          <Button
            type={'primary'}
            style={{ ...baseStyle, marginLeft: 10 }}
            onClick={async () => {
              const formValue = this.getFormValue();
              if (!formValue) return;
              console.log(formValue);
              const alertMaterialList = Array.isArray(formValue.materialList)
                ? formValue.materialList.filter(e => diff(e.requireTime, moment()) < 0)
                : [];

              if (alertMaterialList.length) {
                openModal({
                  children: (
                    <div>
                      <div style={{ padding: '40px 40px 20px', fontSize: 14 }}>
                        任务
                        {_(alertMaterialList)
                          .map(e => e.taskCodes)
                          .flatten()
                          .values()
                          .join(',')}
                        的需求时间早于当前时间，确认创建吗？{' '}
                      </div>
                    </div>
                  ),
                  width: '40%',
                  okText: '确定创建',
                  cancelText: '暂不创建',
                  onOk: () => {
                    this.batchCreateTransferApply(formValue);
                  },
                });
              } else {
                this.batchCreateTransferApply(formValue);
              }
            }}
          >
            确定创建
          </Button>
        ) : null}
        {mergeState === MERGE_STEP_ONE ? (
          <Button
            onClick={() => {
              const formValue = this.getFormValue();
              if (!formValue) return;
              const { materialList } = formValue;
              const valueAfterFormat = formatMaterialListValueToService(materialList);
              if (!valueAfterFormat) return;

              this.fetchAndSetDataForMerge(valueAfterFormat, () => {
                this.setState({ mergeState: MERGE_STEP_TWO });
              });
            }}
            type={'primary'}
            style={{ ...baseStyle, marginLeft: 10 }}
          >
            去合并
          </Button>
        ) : null}
      </div>
    );
  };

  batchCreateTransferApply = async formValue => {
    const { router } = this.context;
    this.setState({ loading: true });

    try {
      const formValueAfterFormat = formatFormValueForService(formValue);
      const res = await batchCreateTransferApply(formValueAfterFormat);
      const data = _.get(res, 'data.data');
      const { status, detail } = data || {};
      if (status === '成功') {
        message.success('创建转移申请成功');
        router.history.go(-1);
      }
      if (status === '失败' || status === '部分成功') {
        const text =
          Array.isArray(detail) && detail.length
            ? detail.map(i => <p>{`任务${i.taskCode}的物料${i.materialCode}因为${i.reason}创建转移申请失败`}</p>)
            : null;
        message.error(text ? <div style={{ display: 'inline-block', verticalAlign: 'top' }}>{text}</div> : '失败');
      }
    } catch (e) {
      log.error(e);
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { form } = this.props;
    const { mergeState, loading, data, dataAfterMerge } = this.state;
    const { getFieldDecorator } = form || {};

    return (
      <Spin spinning={loading}>
        <div style={{ padding: 20 }}>
          <div style={{ color: black, fontSize: 16, marginBottom: 20 }}>创建转移申请</div>
          <FormItem
            label={<span>{renderTooltip('需要合并', '按物料编号 + 目标仓位 + 发出仓库相同的规则进行合并')}</span>}
          >
            <RadioGroup
              value={!(this.state.mergeState === NOT_MERGE)}
              onChange={e => {
                const value = e.target.value;

                this.setState({
                  mergeState: value ? MERGE_STEP_ONE : NOT_MERGE, // 需要合并的时候要将合并的step切到one。不合并的时候置null
                });
              }}
            >
              <Radio value>是</Radio>
              <Radio value={false}>否</Radio>
            </RadioGroup>
          </FormItem>
          <FormItem
            label={
              <span>
                {renderTooltip(
                  '需要审批',
                  '需要审批选择「是」时创建的转移申请状态为「已创建」，选择「否」时创建的转移申请状态为「已下发」。',
                )}
              </span>
            }
          >
            {getFieldDecorator('approve', {
              initialValue: false,
            })(
              <RadioGroup>
                <Radio value>是</Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          <FormItem label={'物料列表'}>
            <MaterialList
              notMerge={mergeState === NOT_MERGE}
              isMergeStepOne={mergeState === MERGE_STEP_ONE}
              isMergeStepTwo={mergeState === MERGE_STEP_TWO}
              form={form}
              tableData={
                mergeState === MERGE_STEP_TWO
                  ? formatServiceDataToFormData(dataAfterMerge)
                  : formatServiceDataToFormData(data)
              }
            />
          </FormItem>
          {this.renderButtons()}
        </div>
      </Spin>
    );
  }
}

CreateTransferApply.propTypes = {
  style: PropTypes.object,
  match: PropTypes.any,
  form: PropTypes.any,
};

CreateTransferApply.contextTypes = {
  router: PropTypes.any,
};

export default withForm({}, withRouter(CreateTransferApply));
