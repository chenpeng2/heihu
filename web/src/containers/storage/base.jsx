import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Radio } from 'antd';
import {
  withForm,
  FormItem,
  Popover,
  Icon,
  Attachment,
  Textarea,
  Input,
  Form,
  Button,
  Spin,
  Select,
  message,
  FormattedMessage,
} from 'src/components';
import { orderNumberFormat, qrCodeFormat } from 'components/form';
import { createStorage, editStorage, getStorage, getStorageQcItems } from 'src/services/knowledgeBase/storage';
import { getStoreHouse } from 'src/services/knowledgeBase/storeHouse';
import { QUALITY_STATUS } from 'src/views/qualityManagement/constants';
import { blacklakeGreen } from 'src/styles/color';
import { STORAGE_LEVEL } from './storageConstants';

type Props = {
  form: any,
  type: string,
  taskCode: string,
  query: {},
};

const ButtonStyle = {
  width: 114,
  height: 32,
};
const inputWidth = 300;
const RadioGroup = Radio.Group;
const Option = Select.Option;

class Base extends Component {
  props: Props;
  state = {
    loading: false,
    qualityControlSwitch: 'false',
    aloneEnabled: false,
  };

  async componentDidMount() {
    const { query, type, form } = this.props;
    const { code, id, level, qualityControlSwitch, qualityControlItems } = query;
    const { setFieldsValue } = form;
    if (type === '编辑') {
      this.setState({ loading: true });
      getStorage(code)
        .then(async res => {
          const {
            data: { data },
          } = res;
          const value = _.cloneDeep(data);
          value.parentCode = {
            key: value.parentCode,
            label: value.parentName,
          };
          value.attachments = value.attachmentFiles;
          const {
            data: { data: qcConfig },
          } = await getStorageQcItems({ id });
          if (qcConfig && qcConfig.length) {
            this.setState({ qualityControlSwitch: 'true' }, () => {
              if (!data.qualityControlSwitch) {
                value.qualityControlItems = qcConfig;
                value.qualityControlSwitch = false;
              } else {
                this.setState({ aloneEnabled: true });
              }
            });
          }
          setFieldsValue(value);
        })
        .finally(() => {
          this.setState({ loading: false });
        });
    } else if (level === STORAGE_LEVEL.FIRST_STORAGE_LEVEL) {
      setFieldsValue({
        qualityControlSwitch: qualityControlSwitch === 'false',
        qualityControlItems: JSON.parse(qualityControlItems || '[]'),
      });
    } else {
      const {
        data: { data: qcConfig },
      } = await getStorageQcItems({ id });
      if (qcConfig && qcConfig.length) {
        this.setState({ qualityControlSwitch: 'true' }, () => {
          setFieldsValue({ qualityControlSwitch: false, qualityControlItems: qcConfig });
        });
      }
    }
  }

  submit = () => {
    const { query, form, type } = this.props;
    const { validateFieldsAndScroll } = form;
    validateFieldsAndScroll((err, value) => {
      if (err) {
        return null;
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
          if (prop === 'parentCode') {
            value[prop] = value[prop].key;
          }
        }
      });
      this.setState({ loading: true });
      if (type === '创建') {
        const { level } = query;
        value.level = level;
        createStorage(value)
          .then(() => {
            message.success('保存成功');
            window.history.back();
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      } else {
        const { code } = query;
        const params = {
          code,
          updateStorageRequestDTO: value,
        };
        editStorage(params)
          .then(() => {
            message.success('编辑成功');
            window.history.back();
          })
          .finally(() => {
            this.setState({ loading: false });
          });
      }
    });
  };

  getButton = () => (
    <div style={{ margin: '26px 0 100px 160px' }}>
      <Button
        type={'default'}
        style={{ ...ButtonStyle, marginRight: 40 }}
        onClick={() => {
          window.history.back();
        }}
      >
        取消
      </Button>
      <Button style={ButtonStyle} type="primary" onClick={this.submit} disabled={this.state.loading}>
        保存
      </Button>
    </div>
  );

  renderCodeScanNumContent = () => {
    return (
      <FormattedMessage defaultMessage={'仓位质量管控默认与上级位置，当您需要特殊控制时请选择例外配置之后单独维护'} />
    );
  };

  render() {
    const { form, type, query } = this.props;
    const { changeChineseToLocale } = this.context;
    const { parentName, parentCode, level, qualityControlSwitch } = query;
    const { getFieldDecorator, setFieldsValue } = form;
    let _qualityControlSwitch = 'false';
    if (type === '编辑' || level === STORAGE_LEVEL.SECOND_STORAGE_LEVEL) {
      _qualityControlSwitch = this.state.qualityControlSwitch;
    } else if (level === STORAGE_LEVEL.FIRST_STORAGE_LEVEL) {
      _qualityControlSwitch = qualityControlSwitch;
    }
    return (
      <Spin spinning={this.state.loading}>
        <div style={{ margin: '20px 0 30px 20px', fontSize: 16 }}>{`${changeChineseToLocale(
          type,
        )}${changeChineseToLocale('仓位')}`}</div>
        <div style={{ marginLeft: 40 }}>
          <Form>
            <FormItem label="上级位置">
              {getFieldDecorator('parentCode', {
                rules: [{ required: true }],
                initialValue: {
                  label: parentName,
                  key: parentCode,
                },
              })(<Select labelInValue disabled style={{ width: inputWidth }} />)}
            </FormItem>
            <FormItem label="仓位编码">
              {getFieldDecorator('code', {
                rules: [
                  { required: true, message: changeChineseToLocale('请输入仓位编码') },
                  { max: 20, message: changeChineseToLocale('仓位编码长度不能超过20个字') },
                  { validator: orderNumberFormat(changeChineseToLocale('仓位编码')) },
                ],
              })(
                <Input
                  disabled={type === '编辑'}
                  style={{ width: inputWidth }}
                  max={20}
                  placeholder={'请填写仓位编码'}
                />,
              )}
            </FormItem>
            <FormItem label="仓位名称">
              {getFieldDecorator('name', {
                rules: [
                  { required: true, message: changeChineseToLocale('请输入仓位名称') },
                  { max: 20, message: '仓位名称长度不能超过20个字' },
                ],
              })(<Input style={{ width: inputWidth }} max={20} placeholder={'请填写仓位名称'} />)}
            </FormItem>
            <FormItem label="二维码">
              {getFieldDecorator('qrCode', {
                rules: [{ max: 30, message: changeChineseToLocale('二维码长度不能超过30个字') }, { validator: qrCodeFormat('二维码') }],
              })(<Input style={{ width: inputWidth }} max={30} placeholder={'请填写二维码'} />)}
            </FormItem>
            {_qualityControlSwitch === 'true' ? (
              <React.Fragment>
                <FormItem
                  label={
                    <span>
                      <Popover placement="top" content={this.renderCodeScanNumContent()}>
                        <Icon color={blacklakeGreen} type="exclamation-circle-o" style={{ paddingRight: 10 }} />
                      </Popover>
                      {changeChineseToLocale('仓位质量管理')}
                    </span>
                  }
                >
                  {getFieldDecorator('qualityControlSwitch', {
                    onChange: e => {
                      const val = e.target.value;
                      this.setState({ aloneEnabled: val });
                    },
                  })(
                    <RadioGroup>
                      <Radio
                        onClick={async () => {
                          const getData = level === STORAGE_LEVEL.FIRST_STORAGE_LEVEL ? getStoreHouse : getStorage;
                          const res = await getData(parentCode);
                          const data = _.get(res, 'data.data');
                          setFieldsValue({ qualityControlItems: data.qualityControlItems });
                        }}
                        value={false}
                      >
                        {changeChineseToLocale('与上级位置一致')}
                      </Radio>
                      <Radio value>{changeChineseToLocale('单独启用')}</Radio>
                    </RadioGroup>,
                  )}
                </FormItem>
                <FormItem label={'质量状态'}>
                  {getFieldDecorator('qualityControlItems', {
                    rules: [
                      {
                        required: true,
                        message: changeChineseToLocale('质量状态必填'),
                      },
                    ],
                  })(
                    <Select disabled={!this.state.aloneEnabled} mode={'multiple'} style={{ width: inputWidth }}>
                      {Object.values(QUALITY_STATUS).map(i => {
                        const { name, value } = i || {};
                        return <Option value={value}>{changeChineseToLocale(name)}</Option>;
                      })}
                    </Select>,
                  )}
                </FormItem>
              </React.Fragment>
            ) : null}
            <FormItem label={'备注'}>
              {getFieldDecorator('remark')(
                <Textarea maxLength={50} placeholder={'最多输入50字'} style={{ width: inputWidth, height: 100 }} />,
              )}
            </FormItem>
            <FormItem label="附件">{getFieldDecorator('attachments', {})(<Attachment />)}</FormItem>
          </Form>
        </div>
        {this.getButton()}
      </Spin>
    );
  }
}

Base.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

const BaseForm = withForm({ showFooter: false }, Base);

export default BaseForm;
