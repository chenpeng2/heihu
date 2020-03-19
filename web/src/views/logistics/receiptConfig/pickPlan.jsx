import React from 'react';
import {
  FormItem,
  withForm,
  Input,
  SimpleTable,
  Select,
  Radio,
  Popconfirm,
  Button,
  message,
} from 'components';
import SearchSelect from 'components/select/searchSelect';
import { createSortPlan, getSortPlan, editSortPlan } from 'services/shipment/receipt';
import { amountValidator } from 'components/form';
import styles from './checkItem.scss';

const Option = Select.Option;
const RadioGroup = Radio.Group;

const formItemStyle = {
  width: 300,
};

class PickPlan extends React.PureComponent<any> {
  state = {
    dataSource: [{ key: 0 }],
  };

  componentDidMount() {
    this.setInitValue();
  }

  setInitValue = async () => {
    const { match: { params: { id } }, form: { setFieldsValue } } = this.props;
    if (id) {
      const { data: { data: { ioCategories, name, planItems }, data } } = await getSortPlan(id);
      this.setState(
        {
          dataSource: planItems.map((node, index) => ({ key: index })),
        },
        () => {
          setFieldsValue({
            name,
            ioCategoryIds:
              ioCategories &&
              ioCategories.map(({ id, name }) => ({
                key: id,
                label: name,
              })),
            planItems: planItems.map(({ qcConfig, min, base, logic, max }) => ({
              qcConfigId: {
                key: qcConfig.id,
                label: qcConfig.name,
              },
              logic,
              min: logic === 6 ? min : base,
              max,
            })),
          });
        },
      );
    }
  };

  submit = () => {
    const { form, match: { params: { id } }, history: { push } } = this.props;
    form.validateFieldsAndScroll(async (err, value) => {
      if (!err) {
        const { planItems, name, ioCategoryIds } = value;
        const submitValue = {
          name,
          ioCategoryIds: ioCategoryIds && ioCategoryIds.map(({ key }) => key),
          planItems: planItems.map(({ qcConfigId, logic, max, min }, index) => {
            return {
              qcConfigId: qcConfigId.key,
              seq: index + 1,
              base: parseFloat(min, 10),
              followUp: index === planItems.length - 1 ? 0 : 1,
              logic,
              min: parseFloat(min, 10),
              max: parseFloat(max, 10),
            };
          }),
        };
        if (id) {
          await editSortPlan(id, submitValue);
        } else {
          await createSortPlan(submitValue);
        }
        message.success('操作成功！');
        push('/logistics/receipt-config');
      }
    });
  };

  handleNextPlan = (record, hasNext) => {
    const { dataSource } = this.state;
    if (hasNext) {
      this.setState({ dataSource: [...dataSource, { key: record.key + 1 }] });
    } else {
      this.setState({ dataSource: dataSource.filter(({ key }) => key <= record.key) });
    }
  };

  getColumns = () => {
    const { form: { getFieldDecorator, getFieldValue, validateFields } } = this.props;
    const { dataSource } = this.state;
    return [
      { title: '序号', width: 100, render: (text, record, index) => index + 1 },
      {
        title: '质检方案',
        width: 250,
        render: (text, { key }) => (
          <div>
            <FormItem>
              {getFieldDecorator(`planItems[${key}].qcConfigId`, {
                rules: [{ required: true, message: '质检方案不能为空' }],
              })(<SearchSelect type="qcConfig" style={{ width: 250 }} />)}
            </FormItem>
          </div>
        ),
      },
      {
        title: '是否有后续方案',
        key: 'hasNext',
        width: 200,
        render: (text, record, index) => (
          <div>
            <FormItem>
              <RadioGroup
                value={dataSource.length - 1 !== index}
                style={{ width: 120 }}
                onChange={e => {
                  if (e.target.value) {
                    this.handleNextPlan(record, true);
                  }
                }}
              >
                <Radio value>是</Radio>
                <Popconfirm
                  title="改为“否”后将会删除全部后续方案，确定修改吗？"
                  okText="确定"
                  cancelText="暂不修改"
                  onConfirm={() => this.handleNextPlan(record, false)}
                >
                  <Radio value={false}>否</Radio>
                </Popconfirm>
              </RadioGroup>
            </FormItem>
          </div>
        ),
      },
      {
        title: '后续触发逻辑',
        width: 500,
        render: (text, { key }, index) => {
          const isLast = dataSource.length - 1 !== index;
          if (!isLast) {
            return null;
          }
          return (
            <div style={{ display: 'flex' }} className="child-gap">
              <span style={{ lineHeight: '40px', width: 80, display: 'inline-block' }}>
                抽样不合格率
              </span>
              <FormItem>
                {getFieldDecorator(`planItems[${key}].logic`, {
                  initialValue: 6,
                })(
                  <Select style={{ width: 90 }}>
                    <Option value={1}>＝</Option>
                    <Option value={5}>＜</Option>
                    <Option value={4}>＜＝</Option>
                    <Option value={2}>＞</Option>
                    <Option value={3}>＞＝</Option>
                    <Option value={6}>区间</Option>
                  </Select>,
                )}
              </FormItem>
              <FormItem>
                {getFieldDecorator(`planItems[${key}].min`, {
                  rules: [
                    { required: true, message: '请填写数值' },
                    { validator: amountValidator(100, 0) },
                  ],
                })(<Input style={{ width: 70 }} />)}
              </FormItem>
              <span style={{ lineHeight: '40px' }}>%</span>
              {getFieldValue(`planItems[${key}].logic`) === 6 && (
                <React.Fragment>
                  <span style={{ lineHeight: '40px' }}>~</span>
                  <FormItem>
                    {getFieldDecorator(`planItems[${key}].max`, {
                      rules: [
                        { required: true, message: '请填写数值' },
                        {
                          validator: amountValidator(100, 0),
                        },
                      ],
                    })(<Input style={{ width: 70 }} />)}
                  </FormItem>
                  <span style={{ lineHeight: '40px' }}>%</span>
                </React.Fragment>
              )}
            </div>
          );
        },
      },
    ];
  };
  render() {
    const { breadcrumbName, form: { getFieldDecorator }, history: { push } } = this.props;
    const { dataSource } = this.state;
    return (
      <div style={{ margin: 20 }}>
        <h3>{breadcrumbName}</h3>
        <div>
          <FormItem label="收货类型">
            {getFieldDecorator('ioCategoryIds', {
              rules: [{ required: true, message: '收货类型不能为空' }],
            })(<SearchSelect style={formItemStyle} type="receiptCategory" mode="multiple" />)}
          </FormItem>
          <FormItem label="名称">
            {getFieldDecorator('name', {
              rules: [
                { required: true, message: '名称不能为空' },
                {
                  max: 20,
                  message: '不超过20个字符',
                },
              ],
            })(<Input style={formItemStyle} />)}
          </FormItem>
          <FormItem label="方案列表">
            <SimpleTable
              columns={this.getColumns()}
              style={{ margin: 0, width: 950 }}
              dataSource={dataSource}
              pagination={false}
            />
          </FormItem>
          <FormItem label=" ">
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => push('/logistics/receipt-config')}
            >
              取消
            </Button>
            <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
              保存
            </Button>
          </FormItem>
        </div>
      </div>
    );
  }
}

export default withForm({}, PickPlan);
