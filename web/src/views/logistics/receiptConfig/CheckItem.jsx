import React from 'react';
import {
  FormItem,
  withForm,
  Input,
  Table,
  Radio,
  Icon,
  Link,
  Button,
  Select,
  message,
} from 'components';
import { InputCheckCategory, OutputCheckCategory } from 'constants';
import { createReceiptCheck, getReceiptCheck, editReceiptCheck } from 'services/shipment/receipt';
import { editSendCheck, createSendCheck, getSendCheck } from 'services/shipment/send';
import SearchSelect from 'components/select/searchSelect';
import styles from './checkItem.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;

const formItemStyle = {
  width: 300,
};

class CheckItem extends React.PureComponent<any> {
  state = {
    dataSource: [{ key: 0 }],
  };

  componentDidMount() {
    this.setInitialValue();
  }

  setInitialValue = async () => {
    const { match: { params: { type, id } }, form: { setFieldsValue } } = this.props;
    if (id) {
      const { data: { data: { checkItems, checkCategory, ioCategories } } } = await (type ===
      'receipt'
        ? getReceiptCheck(id)
        : getSendCheck(id));
      this.setState(
        {
          dataSource: checkItems.map((node, index) => ({ key: index })),
        },
        () => {
          setFieldsValue({
            ioCategoryIds:
              ioCategories &&
              ioCategories.map(({ name, id }) => ({
                key: id,
                label: name,
              })),
            checkCategory,
            checkItems: checkItems.map(({ name, qualifiedStandard }) => ({
              name,
              qualifiedStandard,
            })),
          });
        },
      );
    }
  };

  submit = () => {
    const { form, match: { params: { id, type } }, history: { push } } = this.props;
    form.validateFieldsAndScroll(async (err, value) => {
      const submitValue = {
        ...value,
        ioCategoryIds: value.ioCategoryIds.map(({ key }) => key),
        checkItems: value.checkItems.filter(i => i),
      };
      if (type === 'receipt') {
        if (id) {
          await editReceiptCheck(id, submitValue);
        } else {
          await createReceiptCheck(submitValue);
        }
      } else if (type === 'send') {
        if (id) {
          await editSendCheck(id, submitValue);
        } else {
          await createSendCheck(submitValue);
        }
      }
      message.success('操作成功！');
      push(`/logistics/${type}-config`);
    });
  };

  getColumns = () => {
    const { form: { getFieldDecorator, getFieldsValue } } = this.props;
    const { dataSource } = this.state;
    const { checkItems } = getFieldsValue();
    const selectedCheckItems = checkItems ? checkItems.map(({ name }) => name) : [];
    return [
      {
        title: '检查项',
        key: 'checkItem',
        width: 200,
        render: (text, record) => (
          <div>
            <Icon
              style={{ display: dataSource.length <= 1 ? 'none' : 'flex' }}
              type="minus-circle"
              className={styles.removeIcon}
              onClick={() => {
                this.setState(
                  {
                    dataSource: dataSource.filter(({ key }) => key !== record.key),
                  },
                  () => {
                    this.forceUpdate();
                  },
                );
              }}
            />
            <FormItem>
              {getFieldDecorator(`checkItems[${record.key}].name`, {
                rules: [
                  { required: true, message: '请输入检查项名称' },
                  { max: 30, message: '检查项名称长度30个字以内' },
                ],
              })(
                <Input
                  onChange={value => {
                    if (
                      selectedCheckItems.filter((item, n) => n !== record.key).indexOf(value) !== -1
                    ) {
                      message.error('检查项的名称不可重复');
                    }
                  }}
                />,
              )}
            </FormItem>
          </div>
        ),
      },
      {
        title: '取值类型',
        key: 'type',
        width: 200,
        render: (text, { key }) => (
          <div>
            <FormItem>
              {getFieldDecorator(`checkItems[${key}].category`, {
                initialValue: 0,
              })(
                <Select disabled>
                  <Option value={0}>是/否选择</Option>
                </Select>,
              )}
            </FormItem>
          </div>
        ),
      },
      {
        title: '合格标准',
        key: 'standard',
        width: 200,
        render: (text, { key }) => (
          <div>
            <FormItem>
              {getFieldDecorator(`checkItems[${key}].qualifiedStandard`, {
                rules: [{ required: true, message: '请选择合格标准' }],
              })(
                <RadioGroup>
                  <Radio value={1}>是</Radio>
                  <Radio value={0}>否</Radio>
                </RadioGroup>,
              )}
            </FormItem>
          </div>
        ),
      },
    ];
  };

  render() {
    const {
      breadcrumbName,
      form: { getFieldDecorator },
      match: { params: { type, id } },
      history: { push },
    } = this.props;
    const { dataSource } = this.state;
    const categories = type === 'receipt' ? InputCheckCategory : OutputCheckCategory;
    return (
      <div className={styles.wrapper}>
        <h3>{breadcrumbName}</h3>
        <div className={styles.form}>
          <FormItem label={`${type === 'receipt' ? '收货' : '发运'}类型`}>
            {getFieldDecorator('ioCategoryIds', {
              rules: [
                { required: true, message: `请选择${type === 'receipt' ? '收货' : '发运'}类型` },
              ],
            })(
              <SearchSelect
                mode="multiple"
                style={formItemStyle}
                type={`${type === 'receipt' ? 'receiptCategory' : 'sendCategory'}`}
              />,
            )}
          </FormItem>
          <FormItem label="检查类型">
            {getFieldDecorator('checkCategory', {
              rules: [{ required: true, message: '请选择检查类型' }],
            })(
              <Select style={formItemStyle} disabled={!!id}>
                {Object.keys(categories).map(key => (
                  <Option value={parseInt(key, 10)} key={parseInt(key, 10)}>
                    {categories[key]}
                  </Option>
                ))}
              </Select>,
            )}
          </FormItem>
          <FormItem label="质检项">
            <Table
              columns={this.getColumns()}
              style={{ width: 600, margin: 0 }}
              dataSource={dataSource}
              pagination={false}
              footer={() => (
                <Link
                  icon="plus-circle-o"
                  onClick={() => {
                    this.setState({
                      dataSource: [
                        ...dataSource,
                        { key: dataSource[dataSource.length - 1].key + 1 },
                      ],
                    });
                  }}
                >
                  添加一行
                </Link>
              )}
            />
          </FormItem>
          <div className={styles.footer}>
            <Button
              className={styles.cancel}
              type="ghost"
              onClick={() => {
                push(`/logistics/${type}-config`);
              }}
            >
              取消
            </Button>
            <Button type="primary" className={styles.ok} onClick={() => this.submit()}>
              保存
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default withForm({}, CheckItem);
