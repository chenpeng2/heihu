import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import {
  Select,
  Popover,
  Icon,
  withForm,
  FormItem,
  Attachment,
  Textarea,
  Input,
  Form,
  Searchselect,
  Button,
  Spin,
  message,
  FormattedMessage,
} from 'src/components';
import { orderNumberFormat, qrCodeFormat } from 'components/form';
import { createStoreHouse, editStoreHouse, getStoreHouse } from 'src/services/knowledgeBase/storeHouse';
import { blacklakeGreen } from 'src/styles/color';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { formatFormValueToSubmit, formatDetailValueToForm } from 'src/containers/storeHouse/utils';
import { getStorageDetailPageUrl } from 'src/views/knowledgeManagement/storeHouseModeling/storeHouse/utils';

import styles from './styles.scss';
import StorageCapacity from './storageCapacity/index';

const Option = Select.Option;

type Props = {
  form: any,
  type: string,
  taskCode: string,
  query: {},
};

const normalButtonStyle = {
  width: 114,
  height: 32,
};
const RadioGroup = Radio.Group;
const inputWidth = 300;

class Base extends Component {
  props: Props;
  state = {
    loading: false,
    areaType: null,
    formValue: null, // 编辑的时候的初始值
  };

  componentDidMount = () => {
    const { query, type, form } = this.props;
    const { setFieldsValue } = form;
    if (type === '编辑') {
      const { code } = query;
      getStoreHouse(code)
        .then(res => {
          this.setState({ loading: true });
          const value = _.cloneDeep(res.data.data);
          value.category = String(value.category);
          value.attachments = value.attachmentFiles;
          if (value.workshopId) {
            value.workshopId = {
              label: value.workshopName,
              key: value.workshopId,
            };
            this.setState({ areaType: '2' });
          }
          const _formValue = formatDetailValueToForm(value);
          this.setState({ qualityControlSwitch: value.qualityControlSwitch, formValue: _formValue });
          if (_formValue) setFieldsValue(_formValue);
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    }
  };

  getButton = () => {
    const { type } = this.props;
    return (
      <div style={{ margin: '26px 0 100px 160px' }}>
        {type === '编辑' ? (
          <Button
            style={{ ...normalButtonStyle, marginRight: 40 }}
            type="default"
            onClick={() => {
              this.context.router.history.push('/knowledgeManagement/storeHouse');
            }}
            disabled={this.state.loading}
          >
            取消
          </Button>
        ) : null}
        <Button
          style={{ ...normalButtonStyle, marginRight: 40 }}
          type={type === '编辑' ? 'primary' : 'default'}
          onClick={() => {
            this.submit('save');
          }}
          disabled={this.state.loading}
        >
          保存
        </Button>
        {type === '创建' ? (
          <Button style={normalButtonStyle} type="primary" onClick={this.submit} disabled={this.state.loading}>
            保存并新增
          </Button>
        ) : null}
      </div>
    );
  };

  resetForm = category => {
    const { form } = this.props;
    form.resetFields();
    // category是仓库或者车间库 需要保持
    this.setState(
      {
        qualityControlSwitch: false,
      },
      () => {
        const { resetForm } = this.storageCapacityComponent || {};
        if (typeof resetForm === 'function') {
          resetForm();
        }

        form.setFieldsValue({ category, qualityControlSwitch: false });
      },
    );
  };

  submit = action => {
    const { query, form, type } = this.props;
    const { validateFieldsAndScroll } = form;
    const { router } = this.context;
    validateFieldsAndScroll((err, value) => {
      if (err) {
        // 库容管理里面的表是藏起来的。需要提示
        message.error('表单数据填写出错');
        return;
      }
      Object.keys(value).forEach(prop => {
        if (value[prop]) {
          if (prop === 'attachments') {
            if (value[prop].length > 0) {
              value[prop] = value[prop].map(n => n.restId || n.id);
            } else {
              delete value[prop];
            }
          }
          if (prop === 'workshopId') {
            value[prop] = value[prop].key;
          }
        }
      });
      const _value = formatFormValueToSubmit(value);
      this.setState({ loading: true });
      if (type === '创建') {
        createStoreHouse(_value)
          .then(() => {
            if (action === 'save') {
              message.success('保存成功');
              router.history.push(getStorageDetailPageUrl(_.get(_value, 'code')));
            } else {
              message.success('保存成功');
              this.resetForm(_value.category);
            }
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      } else {
        const { code, page } = query;
        const params = {
          code,
          updateWareHouseRequestDTO: _value,
        };
        editStoreHouse(params)
          .then(() => {
            message.success('编辑成功');
            router.history.push(page === 'storage' ? '/knowledgeManagement/storage' : getStorageDetailPageUrl(code));
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      }
    });
  };

  renderCodeScanNumContent = () => {
    return <FormattedMessage defaultMessage={'启用该配置后，该仓库及所有子节点下只能存放质量状态限制范围的物料'} />;
  };

  render() {
    const { form, type } = this.props;
    const { getFieldDecorator } = form;
    const { areaType, loading } = this.state;
    const { router, changeChineseToLocale } = this.context;

    return (
      <Spin spinning={loading}>
        <div style={{ margin: '20px 0 30px 20px', fontSize: 16 }}>
          {typeof type === 'string' ? changeChineseToLocale(type) : type}
          {changeChineseToLocale('仓库')}
        </div>
        <div className={styles.base}>
          <Form>
            <FormItem label="区域">
              {getFieldDecorator('category', {
                initialValue: '1',
              })(
                <RadioGroup
                  disabled={type === '编辑'}
                  onChange={e => {
                    this.setState({ areaType: e.target.value });
                  }}
                  options={[
                    { label: changeChineseToLocale('仓库'), value: '1' },
                    { label: changeChineseToLocale('车间库'), value: '2' },
                  ]}
                />,
              )}
            </FormItem>
            {areaType === '2' ? (
              <FormItem label="对应车间">
                {getFieldDecorator('workshopId', {
                  rules: [{ required: true, message: '请输入车间编码' }],
                })(<Searchselect style={{ width: inputWidth }} placeholder={'请填写车间编码'} type={'workshop'} />)}
              </FormItem>
            ) : null}
            <FormItem label="仓库编码">
              {getFieldDecorator('code', {
                rules: [
                  { required: true, message: '请输入仓库编码' },
                  { max: 20, message: '仓库编码长度不能超过20个字' },
                  { validator: orderNumberFormat('仓库编码') },
                ],
              })(
                <Input
                  disabled={type === '编辑'}
                  style={{ width: inputWidth }}
                  max={20}
                  placeholder={'请填写仓库编码'}
                />,
              )}
            </FormItem>
            <FormItem label="仓库名称">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: '请输入仓库名称' },
                  { max: 20, message: '仓库名称长度不能超过20个字' },
                ],
              })(<Input style={{ width: inputWidth }} max={20} placeholder={'请填写仓库名称'} />)}
            </FormItem>
            <FormItem label="二维码">
              {getFieldDecorator('qrCode', {
                rules: [{ max: 30, message: '二维码长度不能超过30个字' }, { validator: qrCodeFormat('二维码') }],
              })(<Input style={{ width: inputWidth }} max={30} placeholder={'请填写二维码'} />)}
            </FormItem>
            <FormItem
              label={
                <span>
                  {changeChineseToLocale('仓库质量管理')}
                  <Popover placement="top" content={this.renderCodeScanNumContent()}>
                    <Icon color={blacklakeGreen} type="exclamation-circle-o" style={{ paddingLeft: 5 }} />
                  </Popover>
                </span>
              }
            >
              {getFieldDecorator('qualityControlSwitch', {
                initialValue: false,
                onChange: e => {
                  const val = e && e.target ? e.target.value : null;
                  this.setState({ qualityControlSwitch: val });
                },
              })(
                <RadioGroup>
                  <Radio value>{changeChineseToLocale('启用')}</Radio>
                  <Radio value={false}>{changeChineseToLocale('不启用')}</Radio>
                </RadioGroup>,
              )}
            </FormItem>
            {this.state.qualityControlSwitch ? (
              <div>
                <FormItem label={'质量状态'}>
                  {getFieldDecorator('qualityControlItems', {
                    rules: [
                      {
                        required: this.state.qualityControlSwitch,
                        message: '质量状态必填',
                      },
                    ],
                  })(
                    <Select mode={'multiple'} style={{ width: inputWidth }}>
                      {Object.values(QUALITY_STATUS).map(i => {
                        const { name, value } = i || {};
                        return <Option value={value}>{changeChineseToLocale(name)}</Option>;
                      })}
                    </Select>,
                  )}
                </FormItem>
              </div>
            ) : null}
            <div>
              <StorageCapacity
                ref={inst => (this.storageCapacityComponent = inst)}
                initialValue={this.state.formValue}
                formItemStyle={{ width: inputWidth }}
                form={form}
              />
            </div>
            <FormItem label={'备注'}>
              {getFieldDecorator('remark')(
                <Textarea maxLength={50} placeholder={'最多输入50字'} style={{ width: inputWidth, height: 100 }} />,
              )}
            </FormItem>
            <FormItem label="附件">{getFieldDecorator('attachments', {})(<Attachment />)}</FormItem>
          </Form>
        </div>
        {this.getButton(router)}
      </Spin>
    );
  }
}

Base.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseToLocale: PropTypes.any,
};

const BaseForm = withForm({ showFooter: false }, Base);

export default BaseForm;
