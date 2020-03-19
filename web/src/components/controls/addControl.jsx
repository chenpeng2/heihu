import React, { Component } from 'react';
import { Radio, Menu } from 'antd';
import { error, grey, white, fontSub } from 'src/styles/color';
import {
  FormItem,
  Button,
  Input,
  Textarea,
  Link,
  Attachment,
  OpenModal,
  Checkbox,
  Icon,
  Dropdown,
  Popover,
} from 'components';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { nullCharacterVerification, checkStringLength } from 'components/form';
import _ from 'lodash';
import AddAttachment from './addAttachment';
import styles from './styles.scss';

const MenuItem = Menu.Item;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

type Props = {
  form: {
    getFieldDecorator: () => {},
    getFieldValue: () => {},
    getFieldsValue: () => {},
  },
  intl: any,
  isChild: Boolean,
  props: {},
  onSubmit: () => {},
  data: [],
};

const controls = {
  partition: ['type', 'name', 'mandatory', 'tips', 'subControls'],
  singleOption: ['type', 'name', 'options', 'mandatory', 'tips'],
  textBox: ['type', 'name', 'multi', 'mandatory', 'tips'],
  checkOption: ['type', 'description', 'mandatory', 'tips'],
  taskOption: ['type', 'description', 'mandatory', 'tips'],
  picture: ['type', 'name', 'mandatory', 'tips', 'onLocation'],
  materialReplace: ['type', 'mandatory', 'tips', 'info'],
  deviceMetric: ['type', 'mandatory', 'tips', 'info'],
  downtimeRecord: ['type', 'mandatory', 'tips', 'info'],
};

const controlNameMap = {
  partition: '分区',
  textBox: '文本框',
  singleOption: '单选框',
  checkOption: '检查项',
  taskOption: '任务项',
  picture: '照片',
  materialReplace: '备件更换',
  deviceMetric: '设备/模具读数',
  downtimeRecord: '实际停机',
};

class AddControls extends Component {
  props: Props;
  state = {
    controlsData: [],
    havematerialReplace: false,
    haveDeviceMetric: false,
    haveDowntimeRecord: false,
    visible: false,
    showAttachmentModal: false,
    clicked: '',
  };

  componentWillReceiveProps = ({ data }) => {
    if (data) {
      data.forEach((n, i) => {
        n.id = `${this.getType(n.type)}-${i}`;
        n.settingSave = true;
        if (n.attachment && n.attachment.length) {
          n.attachment.forEach(x => {
            if (x.file) {
              x.file.original_filename = x.name;
            }
          });
        }
        if (n.subControls) {
          n.subControls.forEach((m, idx) => {
            if (n.mandatory) {
              m.mandatory = true;
              m.mandatoryDisabled = true;
            }
            if (m.type === 'materialReplace') {
              this.setState({ havematerialReplace: true });
            }
            if (m.type === 'deviceMetric') {
              this.setState({ haveDeviceMetric: true });
            }
            if (m.type === 'downtimeRecord') {
              this.setState({ haveDowntimeRecord: true });
            }
            m.id = `${this.getType(m.type)}-${idx}-${i}`;
            m.settingSave = true;
          });
        }
        if (n.type === 'materialReplace') {
          this.setState({ havematerialReplace: true });
        }
        if (n.type === 'deviceMetric') {
          this.setState({ haveDeviceMetric: true });
        }
        if (n.type === 'downtimeRecord') {
          this.setState({ haveDowntimeRecord: true });
        }
      });
      this.setState({ controlsData: data });
    }
  };

  getType = type => {
    let _type = '';
    switch (type) {
      case 'materialReplace':
        _type = 'mR';
        break;
      case 'downtimeRecord':
        _type = 'dR';
        break;
      default:
        _type = type;
    }
    return _type;
  };

  addControl = ({ item, key = null }) => {
    const { controlsData } = this.state;
    const {
      props: { parentKey },
    } = item;
    if (parentKey === -1) {
      const controlData = {
        id: `${this.getType(key)}-${controlsData.length}`,
        type: key,
      };
      if (key === 'picture') {
        controlData.onLocation = true;
      }
      controlsData.push(controlData);
    } else {
      const parentIndex = parseInt(parentKey, 10);
      controlsData[parentIndex].subControls = controlsData[parentIndex].subControls || [];
      const controlData = {
        id: `${this.getType(key)}-${controlsData[parentIndex].subControls.length}-${parentIndex}`,
        type: key,
      };
      if (key === 'picture') {
        controlData.onLocation = true;
      }
      if (controlsData[parentIndex].mandatory && controlsData[parentIndex].settingSave) {
        controlData.mandatory = true;
        controlData.mandatoryDisabled = true;
      }
      controlsData[parentIndex].subControls.push(controlData);
    }
    if (key === 'materialReplace') {
      this.setState({ havematerialReplace: true });
    }
    if (key === 'deviceMetric') {
      this.setState({ haveDeviceMetric: true });
    }
    if (key === 'downtimeRecord') {
      this.setState({ haveDowntimeRecord: true });
    }
    this.setState({ controlsData });
  };

  remove = (i, parentIndex) => {
    const { controlsData } = this.state;
    const data = parentIndex || parentIndex === 0 ? controlsData[parentIndex].subControls : controlsData;
    const removeData = data.splice(i, 1);
    if (removeData[0].type === 'materialReplace') {
      this.setState({ havematerialReplace: false });
    }
    if (removeData[0].type === 'deviceMetric') {
      this.setState({ haveDeviceMetric: false });
    }
    if (removeData[0].type === 'downtimeRecord') {
      this.setState({ haveDowntimeRecord: false });
    }
    this.setState({ controlsData });
  };

  moveDown = (i, parentIndex) => {
    const { controlsData } = this.state;
    const data = parentIndex || parentIndex === 0 ? controlsData[parentIndex].subControls : controlsData;
    if (i === data.length - 1) {
      const last = data.pop();
      data.unshift(last);
    } else {
      const a = data[i];
      data[i] = data[i + 1];
      data[i + 1] = a;
    }
    this.setState({ controlsData });
  };

  moveUp = (i, parentIndex) => {
    const { controlsData } = this.state;
    const data = parentIndex || parentIndex === 0 ? controlsData[parentIndex].subControls : controlsData;
    if (i === 0) {
      const first = data.shift();
      data.push(first);
    } else {
      const a = data[i];
      data[i] = data[i - 1];
      data[i - 1] = a;
    }
    this.setState({ controlsData });
  };

  renderMenu = (isChild, parentKey) => {
    const { intl } = this.props;
    return (
      <Menu onClick={this.addControl} style={{ width: 300 }}>
        <MenuItem parentKey={parentKey} key="partition" disabled={isChild === 'true'}>
          {changeChineseToLocale('分区', intl)}
        </MenuItem>
        <MenuItem parentKey={parentKey} key="textBox">
          {changeChineseToLocale('文本框', intl)}
        </MenuItem>
        <MenuItem parentKey={parentKey} key="singleOption">
          {changeChineseToLocale('单选框', intl)}
        </MenuItem>
        <MenuItem parentKey={parentKey} key="checkOption">
          {changeChineseToLocale('检查项目', intl)}
        </MenuItem>
        <MenuItem parentKey={parentKey} key="taskOption">
          {changeChineseToLocale('任务项目', intl)}
        </MenuItem>
        <MenuItem parentKey={parentKey} key="picture">
          {changeChineseToLocale('照片', intl)}
        </MenuItem>
        {/* <MenuItem disabled={this.state.havematerialReplace} parentKey={parentKey} key="materialReplace">
          备件更换
        </MenuItem> */}
        <MenuItem disabled={this.state.haveDeviceMetric} parentKey={parentKey} key="deviceMetric">
          {changeChineseToLocale('设备/模具读数', intl)}
        </MenuItem>
        <MenuItem disabled={this.state.haveDowntimeRecord} parentKey={parentKey} key="downtimeRecord">
          {changeChineseToLocale('实际停机', intl)}
        </MenuItem>
      </Menu>
    );
  };

  renderField = (controlData, parentIndex) => {
    const {
      form: { getFieldDecorator },
      intl,
    } = this.props;
    const fieldName = controlData.id;
    const controlName = _.get(controlNameMap, controlData.type);
    const keys = _.get(controls, controlData.type);
    const multiBox =
      controlName === '文本框' ? (
        <FormItem key={`${fieldName}-multi`} style={{ paddingLeft: 10 }}>
          {getFieldDecorator(`${fieldName}-multi`, {
            valuePropName: 'checked',
            initialValue: _.get(controlData, 'multi'),
          })(
            <Checkbox
              onChange={e => {
                controlData.multi = e.target.checked;
              }}
            >
              多行文本
            </Checkbox>,
          )}
        </FormItem>
      ) : null;
    const pictureOnLocation =
      controlName === '照片' ? (
        <FormItem key={`${fieldName}-onLocation`} style={{ paddingLeft: 10 }}>
          {getFieldDecorator(`${fieldName}-onLocation`, {
            valuePropName: 'checked',
            initialValue: _.get(controlData, 'onLocation'),
          })(
            <Checkbox
              onChange={e => {
                controlData.onLocation = e.target.checked;
              }}
            >
              仅支持现场拍摄
            </Checkbox>,
          )}
        </FormItem>
      ) : null;
    return (
      keys &&
      keys.map(x => {
        let field = null;
        switch (x) {
          case 'type':
            field = (
              <FormItem key={`${fieldName}-type`} style={{ display: 'none' }}>
                {getFieldDecorator(`${fieldName}-type`, {
                  initialValue: _.get(controlData, 'type', undefined),
                })(<Input />)}
              </FormItem>
            );
            break;
          case 'info':
            field = (
              <div style={{ display: 'flex' }}>
                {controlName === '备件更换' || controlName === '设备/模具读数' || controlName === '实际停机' ? (
                  <div style={{ color: fontSub, marginLeft: 48, marginTop: -8 }}>
                    {changeChineseToLocale('该控件无需配置', intl)}
                  </div>
                ) : null}
              </div>
            );
            break;
          case 'name':
            field = (
              <div style={{ display: 'flex' }}>
                <FormItem key={`${fieldName}-name`} label="名称">
                  {getFieldDecorator(`${fieldName}-name`, {
                    rules: [
                      { required: true, message: changeChineseToLocale('请输入名称', intl) },
                      { validator: _.includes(keys, 'subControls') ? checkStringLength(20) : checkStringLength(10) },
                      { validator: nullCharacterVerification('名称') },
                    ],
                    initialValue: _.get(controlData, 'name'),
                  })(
                    <Input
                      placeholder={`请输入${controlName}名称`}
                      style={{ borderColor: '#E5E5E5', width: 274 }}
                      onChange={value => {
                        controlData.name = value;
                      }}
                    />,
                  )}
                </FormItem>
                {multiBox}
                {pictureOnLocation}
              </div>
            );
            break;
          case 'description':
            field = (
              <FormItem key={`${fieldName}-description`} label="描述">
                {getFieldDecorator(`${fieldName}-description`, {
                  rules: [{ required: true, message: changeChineseToLocale('请输入描述', intl) }],
                  initialValue: _.get(controlData, 'description'),
                })(
                  <Input
                    placeholder={`请输入${controlName}描述`}
                    style={{ borderColor: '#E5E5E5', width: 550 }}
                    onChange={value => {
                      controlData.description = value;
                    }}
                  />,
                )}
              </FormItem>
            );
            break;
          case 'options':
            field = (
              <FormItem key={`${fieldName}-options`} label="选项">
                {getFieldDecorator(`${fieldName}-options`, {
                  rules: [{ required: true, message: changeChineseToLocale('请输入选项', intl) }],
                  initialValue: _.get(controlData, 'options'),
                })(
                  <Input
                    placeholder={`请输入${controlName}选项`}
                    style={{ borderColor: '#E5E5E5', width: 550 }}
                    onChange={value => {
                      controlData.options = value;
                    }}
                  />,
                )}
              </FormItem>
            );
            break;
          case 'subControls': {
            controlData.subControls = controlData.subControls || [];
            const subControls = _.get(controlData, 'subControls');
            field = this.renderSubControl(
              subControls.map((x, idx) => {
                return subControls[idx]
                  ? this.renderSubField(x, parentIndex, idx)
                  : this.renderSubField(null, parentIndex, idx);
              }),
              parentIndex,
            );
            break;
          }
          default:
            break;
        }
        return field;
      })
    );
  };

  renderSubControl = (fields, parentIndex) => {
    const { intl } = this.props;
    const menu = this.renderMenu('true', parentIndex);
    return (
      <div>
        {fields}
        <Dropdown overlay={menu} placement="bottomCenter" trigger={['click']}>
          <Button type="dashed" className={styles.childAddControlsBtn}>
            <Icon type="plus-circle-o" /> {changeChineseToLocale('添加控件', intl)} <Icon type="down" />
          </Button>
        </Dropdown>
      </div>
    );
  };

  renderSubField = (data, parentIndex, index) => {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const { select, visible, clicked } = this.state;
    parentIndex = Number(parentIndex);
    const subFormItems = (
      <div className={styles.controlWrapper}>
        <div className={styles.controlWrapper}>
          <FormItem label={_.get(controlNameMap, _.get(data, 'type', undefined))}>
            {getFieldDecorator(data.id)(
              <div
                className={styles.control}
                style={{
                  width: `${parentIndex}` !== -1 ? 710 : 909,
                  paddingLeft: 0,
                  backgroundColor: `${parentIndex}` !== -1 ? grey : white,
                }}
              >
                <div>{this.renderField(data || null, parentIndex, index)}</div>
                <div id={data.id} className={styles.actionBox}>
                  <Popover
                    overlayStyle={{ top: 45 }}
                    overlayClassName={styles.settingPopover}
                    getPopupContainer={() => document.getElementById(data.id)}
                    placement="bottom"
                    autoAdjustOverflow="true"
                    content={this.renderSetting(data || null, parentIndex)}
                    trigger="click"
                    visible={visible && clicked === `${data.id}-${parentIndex}`}
                    onVisibleChange={this.handleVisibleChange}
                  >
                    <Link
                      icon="setting"
                      style={{ height: 14 }}
                      tag={`${data.id}-${parentIndex}`}
                      onClick={e => {
                        this.setState({
                          clicked: e.target.parentNode.getAttribute('tag'),
                        });
                      }}
                    />
                  </Popover>
                  <div style={{ transform: 'scale(0.6)', marginTop: -4 }}>
                    <Link
                      icon="caret-up"
                      onClick={() => {
                        this.moveUp(index, parentIndex);
                      }}
                    />
                    <Link
                      icon="caret-down"
                      iconStyle={{ position: 'absolute', left: 0, top: 10 }}
                      onClick={() => {
                        this.moveDown(index, parentIndex);
                      }}
                    />
                  </div>
                </div>
              </div>,
            )}
          </FormItem>
        </div>
        <Icon
          style={{ color: error, paddingLeft: 10, cursor: 'pointer', height: 14 }}
          type="minus-circle"
          onClick={() => {
            this.remove(index, parentIndex);
          }}
        />
      </div>
    );
    return <div>{subFormItems}</div>;
  };

  handleVisibleChange = visible => {
    const {
      form: { resetFields },
    } = this.props;
    const { controlsData, showAttachmentModal } = this.state;
    let clicked = this.state.clicked;
    if (showAttachmentModal) {
      return null;
    }
    this.setState({ visible }, () => {
      if (clicked) {
        const parentIndex = clicked.split('-')[3];
        if (parentIndex) {
          clicked = clicked.slice(0, clicked.lastIndexOf(`-${parentIndex}`));
        }
        const data = parentIndex || parentIndex === 0 ? controlsData[parentIndex].subControls : controlsData;
        const controlData = (data && data.find(n => clicked === n.id)) || {};
        const save = controlData.settingSave;
        if (!save) {
          if (!(controlsData[parentIndex] && controlsData[parentIndex].mandatory)) {
            resetFields([`${clicked}-mandatory`]);
            delete controlData.mandatory;
          }
          resetFields([`${clicked}-tipType`, `${clicked}-tips`, `${clicked}-settingSave`, `${clicked}-attachment`]);
          delete controlData.tipType;
          delete controlData.tips;
          delete controlData.attachment;
        }
      }
    });
  };

  renderSetting = controlData => {
    const isPartition = _.get(controlData, 'type', undefined) === 'partition';
    const fieldName = controlData.id;
    const { form, intl } = this.props;
    const { getFieldDecorator } = form;
    const _attachments =
      controlData && Array.isArray(controlData.attachment) && controlData.attachment.length > 0
        ? controlData.attachment.map(n => {
            if (n && n.file) {
              const { original_extension, original_filename, uri, id } = n.file;
              return {
                originalExtension: original_extension,
                originalFileName: original_filename,
                url: uri,
                id,
                restId: id,
              };
            }
            return null;
          })
        : null;
    if (_attachments && _attachments[0]) {
      controlData.attachment = _attachments;
    }
    return (
      <div
        id={`setting-${fieldName}`}
        className={styles.settingContent}
        style={{ width: isPartition ? 290 : 243, margin: '10px 0 0 10px' }}
      >
        <div>
          <Icon type="exclamation-circle" style={{ marginRight: 6, color: '#FAAD14' }} />
          {changeChineseToLocale('控件设置', intl)}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: -40 }}>
          <FormItem colon={false} key={`${fieldName}-mandatory`} label="必填">
            {getFieldDecorator(`${fieldName}-mandatory`, {
              initialValue: controlData.mandatoryDisabled || _.get(controlData, 'mandatory', undefined),
            })(
              <RadioGroup
                disabled={controlData.mandatoryDisabled}
                onChange={e => {
                  controlData.mandatory = e.target.value;
                  if (controlData.subControls && controlData.subControls.length && controlData.settingSave) {
                    controlData.subControls.forEach(n => {
                      n.mandatoryDisabled = e.target.value;
                      n.mandatory = e.target.value;
                    });
                  }
                }}
                options={[
                  { label: changeChineseToLocale('是', intl), value: true },
                  { label: changeChineseToLocale('否', intl), value: false },
                ]}
              />,
            )}
          </FormItem>
          <FormItem colon={false} key={`${fieldName}-tipType`} label="提示" style={{ marginBottom: 0 }}>
            {getFieldDecorator(`${fieldName}-tipType`, {
              initialValue: _.get(controlData, 'tipType', undefined),
            })(
              <RadioGroup
                onChange={e => {
                  controlData.tipType = e.target.value;
                }}
                options={[
                  { label: changeChineseToLocale('普通信息', intl), value: 'regular' },
                  { label: changeChineseToLocale('警示信息', intl), value: 'warning' },
                ]}
              />,
            )}
          </FormItem>
        </div>
        <div style={{ marginLeft: 63, marginBottom: 26 }}>
          <FormItem colon={false} key={`${fieldName}-tips`} label="">
            {getFieldDecorator(`${fieldName}-tips`, {
              initialValue: _.get(controlData, 'tips', undefined),
            })(
              <Textarea
                maxLength={60}
                onChange={e => {
                  controlData.tips = e.target.value;
                }}
                placeholder={'请输入提示'}
                style={{ width: isPartition ? 200 : 175, height: 84 }}
              />,
            )}
          </FormItem>
        </div>
        {isPartition ? (
          <div>
            <FormItem style={{ margin: '0 0 0 -40px' }} label="附件">
              {getFieldDecorator(`${fieldName}-attachment`, {
                initialValue: _.get(controlData, 'attachment', []),
              })(
                <Attachment
                  style={{ width: 200, display: 'block' }}
                  tipStyle={{ marginLeft: 0, width: 210, lineHeight: '15px', marginTop: 4, top: 'unset' }}
                  onChange={value => {
                    controlData.attachment = value;
                    this.setState({ [`${fieldName}-attachment`]: value });
                  }}
                  prompt
                >
                  <div />
                </Attachment>,
              )}
            </FormItem>
            <Button
              style={{
                marginLeft: 63,
                transform: `translateY(${
                  (this.state[`${fieldName}-attachment`] && this.state[`${fieldName}-attachment`].length > 0) ||
                  (_.get(controlData, 'attachment') && _.get(controlData, 'attachment').length > 0)
                    ? 0
                    : '-34px'
                })`,
              }}
              onClick={() => {
                this.setState({ showAttachmentModal: true });
                OpenModal(
                  {
                    title: '添加附件',
                    width: 500,
                    footer: null,
                    onCancel: () => {
                      this.setState({ showAttachmentModal: false });
                    },
                    children: (
                      <AddAttachment
                        // form={this.props.form}
                        closeModal={() => {
                          this.setState({ showAttachmentModal: false });
                        }}
                        onSubmit={values => {
                          const {
                            form: { setFieldsValue },
                          } = this.props;
                          const { attachment, attachmentTitle } = values;
                          if (attachmentTitle) {
                            attachment[0].originalFileName = attachmentTitle;
                          }
                          if (attachment[0].originalFileName.length > 20) {
                            attachment[0].originalFileName = attachment[0].originalFileName.slice(0, 20);
                          }
                          if (controlData.attachment) {
                            controlData.attachment = controlData.attachment.concat(values.attachment);
                          } else {
                            controlData.attachment = values.attachment;
                          }
                          this.setState({ [`${fieldName}-attachment`]: controlData.attachment }, () => {
                            setFieldsValue({ [`${fieldName}-attachment`]: controlData.attachment });
                          });
                        }}
                      />
                    ),
                    getContainer: () => document.getElementById(`setting-${fieldName}`),
                  },
                  this.context,
                );
              }}
              ghost
            >
              添加附件
            </Button>
          </div>
        ) : null}
        <div style={{ marginTop: isPartition ? 35 : 0 }}>
          <FormItem style={{ marginBottom: 0, display: 'flex', justifyContent: 'flex-end' }}>
            {getFieldDecorator(`${fieldName}-settingSave`, {
              initialValue: _.get(controlData, 'settingSave', false),
            })(
              <RadioGroup>
                <RadioButton
                  value="true"
                  onClick={() => {
                    controlData.settingSave = true;
                    if (controlData.subControls && controlData.subControls.length) {
                      controlData.subControls.forEach(n => {
                        n.mandatoryDisabled = controlData.mandatory;
                        n.mandatory = controlData.mandatory;
                      });
                    }
                    this.setState({ visible: false });
                  }}
                >
                  {changeChineseToLocale('确定', intl)}
                </RadioButton>
              </RadioGroup>,
            )}
          </FormItem>
        </div>
      </div>
    );
  };

  renderFormItems = () => {
    const {
      isChild,
      form: { getFieldDecorator },
    } = this.props;
    const { controlsData, visible, clicked } = this.state;
    const formItems = controlsData.map((n, i) => {
      return (
        <div key={`controls-${i}`} className={styles.controlWrapper}>
          <FormItem label={controlNameMap[`${n.type}`]}>
            {getFieldDecorator(n.id)(
              <div
                className={styles.control}
                style={{
                  width: `${isChild}` === 'true' ? 710 : 909,
                  paddingLeft: 0,
                  backgroundColor: `${isChild}` === 'true' ? grey : white,
                }}
              >
                <div>{this.renderField(n, i)}</div>
                <div id={n.id} className={styles.actionBox}>
                  <Popover
                    overlayStyle={{ top: 45 }}
                    autoAdjustOverflow="true"
                    overlayClassName={styles.settingPopover}
                    getPopupContainer={() => document.getElementById(n.id)}
                    content={this.renderSetting(n, -1)}
                    visible={visible && clicked === n.id}
                    onVisibleChange={this.handleVisibleChange}
                    placement="bottom"
                    trigger="click"
                  >
                    <Link
                      icon="setting"
                      style={{ height: 14 }}
                      tag={n.id}
                      onClick={e => {
                        this.setState({
                          clicked: e.target.parentNode.getAttribute('tag'),
                        });
                      }}
                    />
                  </Popover>
                  <div style={{ transform: 'scale(0.6)', marginTop: -4 }}>
                    <Link
                      icon="caret-up"
                      onClick={() => {
                        this.moveUp(i);
                      }}
                    />
                    <Link
                      icon="caret-down"
                      iconStyle={{ position: 'absolute', left: 0, top: 10 }}
                      onClick={() => {
                        this.moveDown(i);
                      }}
                    />
                  </div>
                </div>
              </div>,
            )}
          </FormItem>
          <Icon
            style={{ color: error, paddingLeft: 10, cursor: 'pointer', height: 14 }}
            type="minus-circle"
            onClick={() => {
              this.remove(i);
            }}
          />
        </div>
      );
    });
    return formItems;
  };

  render() {
    const { isChild, onSubmit, intl } = this.props;
    const { controlsData } = this.state;
    const menu = this.renderMenu(isChild, -1);

    return (
      <div>
        {this.renderFormItems()}
        <Dropdown overlay={menu} placement="bottomCenter" trigger={['click']}>
          <Button type="dashed" className={isChild === 'true' ? styles.childAddControlsBtn : styles.addControlsBtn}>
            <Icon type="plus-circle-o" /> {changeChineseToLocale('添加控件', intl)} <Icon type="down" />
          </Button>
        </Dropdown>
        <Button
          style={{ width: 114, height: 32, marginLeft: 140, marginTop: 26, display: 'block' }}
          type="primary"
          onClick={e => {
            onSubmit(e, controlsData);
          }}
        >
          保存
        </Button>
      </div>
    );
  }
}

export default injectIntl(AddControls);
