import React, { Component } from 'react';
import {
  DatePicker,
  withForm,
  Form,
  InputNumber,
  Radio,
  Select,
  Button,
  FormItem,
  Popover,
  Checkbox,
  Icon,
} from 'components';
import { amountValidator } from 'components/form';
import { getConfigCapacityConstraint } from 'utils/organizationConfig';
import StorageSelect from 'components/treeSelect/StorageTreeSelect';
import moment from 'utils/time';
import SearchSelect from 'components/select/searchSelect';

const Option = Select.Option;
const RadioGroup = Radio.Group;

function range(start, end) {
  const result = [];
  for (let i = start; i < end; i += 1) {
    result.push(i);
  }
  return result;
}

const baseFormItemStyle = { width: 370 };
const titleStyle = { fontSize: '14px', color: '#000' };
const contentStyle = { fontSize: '12px', color: 'rgba(0, 0, 0, 0.6)' };

class ScheduleLogicModal extends Component {
  props: {
    form: {},
    onOk: () => {},
    onCancel: () => {},
    initialValue: {},
  };
  state = {
    baseTime: moment()
      .hour(moment().hour() + 1)
      .minutes(0)
      .second(0),
  };

  componentDidMount() {
    this.setInitialValue();
  }

  setInitialValue = () => {
    const { form, initialValue } = this.props;
    const { baseTime } = this.state;
    const { getFieldDecorator, setFieldsValue } = form;
    getFieldDecorator('selectedStorage');
    // getFieldDecorator('groupDay', {});
    getFieldDecorator('deadline');
    getFieldDecorator('level');
    getFieldDecorator('sourceWarehouseCode');
    setFieldsValue({ baseTime, ...initialValue });
  };

  getDisabledTime = current => {
    if (current && current.isSame(moment(), 'day')) {
      return {
        disabledHours: () => range(0, moment().hour() + (moment().minute() ? 1 : 0)),
      };
    }
    return {};
  };

  render() {
    const { onOk, form, onCancel } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const isCheckStorage = getFieldValue('isCheckStorage');
    const processStrategy = getFieldValue('processStrategy');
    const workstationStrategy = getFieldValue('workstationStrategy');
    const groupDayItem = (
      <FormItem label="计划开始时间约整天数">
        {getFieldDecorator('groupDay', {
          rules: [
            { required: processStrategy === 1, message: '计划开始时间约整天数必填' },
            { validator: amountValidator(100000, 1, 'integer', null, '约整天数') },
          ],
          validateTrigger: 'onChange',
        })(<InputNumber />)}
        天
      </FormItem>
    );

    return (
      <React.Fragment>
        <Form>
          <FormItem label="基准时间">
            {getFieldDecorator('baseTime', {
              rules: [{ required: true, message: '时间不能为空' }],
            })(
              <DatePicker
                disabledDate={current => {
                  return current && current.valueOf() < moment().startOf('day');
                }}
                style={baseFormItemStyle}
                disabledTime={this.getDisabledTime}
                showToday={false}
                showTime={getConfigCapacityConstraint() ? undefined : { format: 'HH:mm' }}
                format={getConfigCapacityConstraint() ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm'}
              />,
            )}
          </FormItem>
          <FormItem
            label={
              <span>
                占用库存
                <Popover
                  content={
                    <div>
                      <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4)'} style={{ margin: '0 5px' }} />
                      勾选校验库存后，会依次校验指定仓库库存中的数量是否满足该工序的需求，不满足的工序不会进行排程
                    </div>
                  }
                >
                  <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4'} style={{ margin: '0 5px' }} />
                </Popover>
              </span>
            }
          >
            {getFieldDecorator('isCheckStorage', {
              rules: [{ required: true, message: '校验库存不能为空' }],
              initialValue: false,
            })(
              <RadioGroup style={baseFormItemStyle}>
                <Radio value style={{ marginRight: 100 }}>
                  是
                </Radio>
                <Radio value={false}>否</Radio>
              </RadioGroup>,
            )}
          </FormItem>
          {isCheckStorage && (
            <FormItem
              label={
                <span>
                  占用仓库
                  <Popover
                    content={
                      <div>
                        <Icon type="exclamation-circle" color={'rgba(0, 0, 0, 0.4)'} style={{ margin: '0 5px' }} />
                        优先占用物料上配置的默认存储仓库，如果没有配置则占用此次选择的仓库
                      </div>
                    }
                  >
                    <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4'} style={{ margin: '0 5px' }} />
                  </Popover>
                </span>
              }
            >
              {/* <StorageSelect
                value={form.getFieldValue('selectedStorage')}
                labelInValue
                placeholder="请选择"
                style={baseFormItemStyle}
                disabled={!isCheckStorage}
                onChange={(value, label, extra) => {
                  getFieldDecorator('level');
                  form.setFieldsValue({ selectedStorage: value, level: extra.triggerNode.props.level });
                }}
              /> */}
              {getFieldDecorator('sourceWarehouseCode', {
                rules: [{ required: true, message: '占用仓库必填' }],
              })(<SearchSelect type="wareHouseWithCode" style={baseFormItemStyle} />)}
            </FormItem>
          )}
          <FormItem
            label={
              <span>
                工序排序方案
                <Popover
                  content={
                    <div>
                      <div style={titleStyle}>常规方案：</div>
                      <div style={contentStyle}>1. 将相同工单的待排程工序分为一组。</div>
                      <div style={contentStyle}>2. 分组之间按工单优先级（相同时按计划开始时间）降序排列。</div>
                      <div style={contentStyle}>3. 分组内按照工艺路线的顺序排列。</div>
                      <div style={titleStyle}>最小换型时间方案：</div>
                      <div style={contentStyle}>
                        1.
                        取待排程工序中工单计划开始时间最早的时间为开始，每「约整天数」内计划开始的工单的待排程工序分为一大组。
                      </div>
                      <div style={contentStyle}>2. 大组之间按计划时间升序排列。</div>
                      <div style={contentStyle}>3. 大组内将相同工序产出物料的待排程工序分为一小组。</div>
                      <div style={contentStyle}>4. 小组之间按照组内工序所在工单优先级均值降序排列。</div>
                      <div style={contentStyle}>5. 小组内按照待排程工序所在工单优先级降序排列。</div>
                    </div>
                  }
                >
                  <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4'} style={{ margin: '0 5px' }} />
                </Popover>
              </span>
            }
          >
            {getFieldDecorator('processStrategy', {
              initialValue: 0,
              onChange: value => {
                if (value === 0) {
                  form.setFieldsValue({ workstationStrategy: 0 });
                } else if (value === 1) {
                  form.setFieldsValue({ workstationStrategy: 1 });
                }
              },
            })(
              <Select disabled={getConfigCapacityConstraint()} style={baseFormItemStyle}>
                <Option value={0}>常规方案</Option>
                <Option value={1}>最小换型时间</Option>
              </Select>,
            )}
          </FormItem>
          {processStrategy === 1 ? (
            <div style={{ color: '#FAAD14', marginTop: -10, paddingLeft: 170 }}>
              保证选择相同工序且配置了相同工位才可以使用最小换型时间方案
            </div>
          ) : null}
          {processStrategy === 1 ? groupDayItem : null}
        </Form>
        <FormItem
          label={
            <span>
              工位排序方案
              <Popover
                content={
                  <div>
                    <div style={titleStyle}>N型排产：</div>
                    <div style={contentStyle}>1. 每次将待排程工序放在结束时间最早的工位上。</div>
                    <div style={titleStyle}>Z型排产：</div>
                    <div style={contentStyle}>1. 将待排程工位按照首个待排程工序的结束时间升序排列。</div>
                    <div style={contentStyle}>2. 将待排程工序依次放入工位队列中的第一个直至超出截止时间。</div>
                    <div style={contentStyle}>
                      3. 将超出截止时间的待排程工序放入工位队列中的下一个直至工位队列为空。
                    </div>
                    <div style={contentStyle}>4. 剩下的待排程工序排程失败。</div>
                  </div>
                }
              >
                <Icon type="exclamation-circle-o" color={'rgba(0, 0, 0, 0.4'} style={{ margin: '0 5px' }} />
              </Popover>
            </span>
          }
        >
          {getFieldDecorator('workstationStrategy', {
            initialValue: 0,
          })(
            <RadioGroup disabled style={baseFormItemStyle}>
              <Radio value={1} style={{ marginRight: 100 }}>
                Z型排产
              </Radio>
              <Radio value={0}>N型排产</Radio>
            </RadioGroup>,
          )}
        </FormItem>
        {workstationStrategy === 1 ? (
          <FormItem label="截止时间">
            {getFieldDecorator('deadline', {
              rules: [{ required: true, message: '时间不能为空' }],
            })(
              <DatePicker
                disabledDate={current => {
                  return current && current.valueOf() < moment().startOf('day');
                }}
                style={baseFormItemStyle}
                disabledTime={this.getDisabledTime}
                showToday={false}
                showTime={{ format: 'HH:mm' }}
                format="YYYY-MM-DD HH:mm"
              />,
            )}
          </FormItem>
        ) : null}
        <div style={{ position: 'absolute', left: 220, padding: 20 }}>
          <Button style={{ width: 100 }} type="ghost" onClick={() => onCancel()}>
            取消
          </Button>
          <Button
            style={{ width: 100, marginLeft: 60 }}
            onClick={() => {
              form.validateFieldsAndScroll((err, values) => {
                if (!err) {
                  onOk(values);
                }
              });
            }}
          >
            确定
          </Button>
        </div>
      </React.Fragment>
    );
  }
}

export default withForm({}, ScheduleLogicModal);
