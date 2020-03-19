import React from 'react';
import {
  Input,
  FormItem,
  SimpleTable,
  Radio,
  Select,
  Link,
  Button,
  Icon,
  message,
  InputNumber,
  Spin,
  FormattedMessage,
} from 'components';
import SearchSelect from 'components/select/searchSelect';
import { error } from 'styles/color';
import PropTypes from 'prop-types';
import { amountValidator } from 'components/form';
import { getSOPDetail, getSOPPresetFields, updateSopFieldFromTemplate } from 'services/knowledgeBase/sop';
import { getSOPTemplateDetail } from 'services/knowledgeBase/sopTemplate';
import { getMBomById } from 'services/bom/mbom';
import { extraSearchForMBom } from 'containers/productivityStandard/base/processSelect';
import classNames from 'classnames';
import { SOPCodeRule } from './SOPFormFieldRules';
import { toSOPDetail, toSOPTemplateDetail, toSOPList, toSOPTemplateList } from '../utils/navigation';
import CONSTANT, { SOPBusinessObjectType, SOPFieldType, SopFieldRwPermissionMap } from '../common/SOPConstant';
import styles from './index.scss';

const RadioGroup = Radio.Group;
const Option = Select.Option;
const width = 200;

export const extraSearchForProcess = async (type, params, options) => {
  const { mBomId } = options || {};
  if (!mBomId) return null;

  const mBom = await getMBomById(mBomId);
  const { data } = mBom || {};
  const { data: mBomData } = data || {};
  const { processList } = mBomData || {};

  if (Array.isArray(processList)) {
    const res = [];
    processList.forEach(({ nodes }) => {
      nodes.forEach(({ nodeCode, process, outputMaterial }) => {
        // 工序可能是一样的。需要利用nodeCode来区分
        const { code, name } = process || {};
        res.push({ key: nodeCode, label: `${nodeCode}/${code}/${name}`, outputMaterial });
      });
    });

    return res;
  }
  return [];
};

class SOPBaseForm extends React.PureComponent {
  SOPId = null;
  state = {
    DIYField: [],
    presetFieldDataSource: null,
    loading: false,
    editSopByTemplateCreate: false, // 编辑的sop是否是由模板生产的
  };

  isTemplateMode = () => this.props.mode === 'template';

  presetColumns = [
    { title: '名称', dataIndex: 'name' },
    { title: '类型', dataIndex: 'type', render: type => SOPFieldType.get(type) },
    { title: '是否多值', dataIndex: 'multi', render: multi => (multi ? '是' : '否') },
    { title: '读写权限', dataIndex: 'rwPermission', render: rw => SopFieldRwPermissionMap.get(rw) },
  ].map(node => ({
    ...node,
    key: node.title,
  }));

  componentDidMount() {
    this.setPresetFields(1);
    const { type, mode } = this.props;
    if (type === 'edit') {
      this.SOPId = this.props.match.params.id;
      this.setState({ loading: true });
      if (mode === 'template') {
        this.setTemplateInitValue();
      } else {
        this.setEditInitValue();
      }
    }
  }

  setTemplateInitValue = async () => {
    const {
      form: { setFieldsValue },
    } = this.props;
    const {
      data: { data },
    } = await getSOPTemplateDetail(this.SOPId).finally(() => {
      this.setState({ loading: false });
    });
    const { sopTemplate, customFieldList } = data;
    this.setState({ DIYField: customFieldList.map((value, index) => index) }, () => {
      setFieldsValue({
        ...sopTemplate,
        fieldList: customFieldList,
      });
    });
  };

  setEditInitValue = async () => {
    this.setState({ loading: true });
    const {
      form: { setFieldsValue },
    } = this.props;
    const {
      data: { data },
    } = await getSOPDetail(this.SOPId).finally(() => {
      this.setState({ loading: false });
    });
    const {
      sop: {
        mbomId,
        nodeCode,
        mbom: { materialCode, materialName, version },
        node: {
          process: { code, name },
        },
        sopTemplate,
      },
      sop,
      customFieldList,
    } = data;
    this.setState(
      {
        DIYField: customFieldList.map((value, index) => index),
        loading: false,
        editSopByTemplateCreate: !!sopTemplate,
      },
      () => {
        setFieldsValue({
          ...sop,
          mbomId: { key: mbomId, label: `${materialCode}/${materialName}/${version}` },
          nodeCode: { key: nodeCode, label: `${nodeCode}/${code}/${name}` },
          fieldList: customFieldList,
        });
      },
    );
  };

  setPresetFields = async type => {
    const {
      data: { data },
    } = await getSOPPresetFields(type);
    this.setState({ presetFieldDataSource: data });
  };

  getDIYColumns = () => {
    const {
      form: { getFieldDecorator, getFieldValue, setFields },
    } = this.props;
    const { DIYField, editSopByTemplateCreate } = this.state;
    return [
      {
        title: '名称',
        dataIndex: 'key',
        render: key => (
          <div style={{ display: 'flex' }}>
            {!editSopByTemplateCreate && (
              <Icon
                type="minus-circle"
                style={{ color: error, marginRight: 5, marginTop: 14, pointer: 'cursor', cursor: 'pointer' }}
                onClick={() => {
                  this.setState({ DIYField: DIYField.filter(value => value !== key) });
                }}
              />
            )}
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`fieldList[${key}].name`, {
                rules: [{ required: true, message: '名称不能为空' }],
              })(<Input style={{ width: 200 }} disabled={editSopByTemplateCreate} />)}
            </FormItem>
            {getFieldDecorator(`fieldList[${key}].id`)(<div />)}
          </div>
        ),
      },
      {
        title: '类型',
        dataIndex: 'key',
        render: key => {
          return (
            <FormItem style={{ marginBottom: 0 }}>
              {getFieldDecorator(`fieldList[${key}].type`, {
                rules: [{ required: true, message: '类型不能为空' }],
              })(
                <Select
                  disabled={editSopByTemplateCreate}
                  style={{ width: 100 }}
                  onChange={value => {
                    if (value !== CONSTANT.FIELD_TYPE_NUMBER) {
                      setFields({
                        [`fieldList[${key}].useTrigger`]: { value: false },
                      });
                    }
                  }}
                >
                  {[
                    CONSTANT.FIELD_TYPE_TEXT,
                    CONSTANT.FIELD_TYPE_NUMBER,
                    CONSTANT.FIELD_TYPE_TIME,
                    CONSTANT.FIELD_TYPE_FILE,
                    CONSTANT.FIELD_TYPE_USER,
                    CONSTANT.FIELD_TYPE_WORKSTATION,
                    CONSTANT.FIELD_TYPE_DEVICE,
                    CONSTANT.FIELD_TYPE_MULTIPLE_USER,
                  ].map(key => (
                    <Option value={key}>{SOPFieldType.get(key)}</Option>
                  ))}
                </Select>,
              )}
            </FormItem>
          );
        },
      },
      {
        title: '是否多值',
        dataIndex: 'key',
        render: key => {
          return getFieldDecorator(`fieldList[${key}].multi`, {
            initialValue: false,
          })(
            <RadioGroup
              disabled={editSopByTemplateCreate}
              onChange={e => {
                if (e.target.value) {
                  setFields({
                    [`fieldList[${key}].useTrigger`]: { value: false },
                  });
                }
              }}
              options={[{ value: true, label: '是' }, { value: false, label: '否' }]}
            />,
          );
        },
      },
      {
        title: '读写权限',
        dataIndex: 'key',
        render: key => {
          return getFieldDecorator(`fieldList[${key}].rwPermission`, {
            initialValue: CONSTANT.SOP_FIELD_READWRITE,
          })(
            <RadioGroup
              disabled={editSopByTemplateCreate}
              onChange={e => {
                if (e.target.value === CONSTANT.SOP_FIELD_READWRITE) {
                  setFields({
                    [`fieldList[${key}].useTrigger`]: { value: false },
                  });
                }
              }}
              options={Array.from(SopFieldRwPermissionMap, ([value, label]) => ({ label, value }))}
            />,
          );
        },
      },
      {
        title: '是否trigger赋值',
        dataIndex: 'key',
        render: key => {
          const multi = getFieldValue(`fieldList[${key}].multi`);
          const rwPermission = getFieldValue(`fieldList[${key}].rwPermission`);
          const type = getFieldValue(`fieldList[${key}].type`);
          const disabled =
            multi || rwPermission === CONSTANT.SOP_FIELD_READWRITE || type !== CONSTANT.FIELD_TYPE_NUMBER;
          return getFieldDecorator(`fieldList[${key}].useTrigger`, {
            initialValue: false,
          })(
            <RadioGroup
              disabled={editSopByTemplateCreate || disabled}
              options={[{ value: true, label: '是' }, { value: false, label: '否' }]}
            />,
          );
        },
      },
      {
        title: 'trigger赋值语句',
        dataIndex: 'key',
        render: key => {
          const useTrigger = getFieldValue(`fieldList[${key}].useTrigger`);
          const triggerValueField = getFieldDecorator(`fieldList[${key}].triggerValue`)(<Input />);
          if (this.isTemplateMode()) {
            return <FormattedMessage defaultMessage={'SOP模板不能设置trigger公式'} />;
          }
          if (!useTrigger) {
            return <FormattedMessage defaultMessage={'请先选择trigger赋值'} />;
          }
          return triggerValueField;
        },
      },
    ].map(node => ({ ...node, key: node.title }));
  };

  onSubmit = async () => {
    const { editSopByTemplateCreate } = this.state;
    const {
      form: { validateFields },
      type,
      history: { push },
      createApi,
      editApi,
      mode,
    } = this.props;
    validateFields(async (err, value) => {
      if (!err) {
        this.setState({ loading: true });
        const submitValue = {
          ...value,
          fieldList: value.fieldList && value.fieldList.filter(n => n && n.name),
          mbomId: value.mbomId && value.mbomId.key,
          nodeCode: value.nodeCode && value.nodeCode.key,
        };
        let detailId;
        if (editSopByTemplateCreate) {
          // sop模板创建的sop只能更新自定义字段trigger公式
          await updateSopFieldFromTemplate(this.SOPId, submitValue.fieldList).finally(() => {
            this.setState({ loading: false });
          });
          detailId = this.SOPId;
        } else if (type === 'edit') {
          await editApi(this.SOPId, submitValue).finally(() => {
            this.setState({ loading: false });
          });
          detailId = this.SOPId;
        } else {
          const {
            data: { data },
          } = await createApi(submitValue).finally(() => {
            this.setState({ loading: false });
          });
          detailId = data;
        }
        push(mode === 'template' ? toSOPTemplateDetail(detailId) : toSOPDetail(detailId));
        message.success('操作成功！');
        this.setState({ loading: false });
      }
    });
  };

  render() {
    const {
      form: { getFieldDecorator, getFieldValue, resetFields },
      title,
      type,
      history: { push },
      mode,
    } = this.props;
    const isEdit = type === 'edit';
    const { DIYField, presetFieldDataSource, loading, editSopByTemplateCreate } = this.state;
    const required = name => ({ required: true, message: `${name}不能为空！` });
    return (
      <div className={styles.sopBaseForm}>
        <h2>
          <FormattedMessage defaultMessage={title} />
        </h2>
        <Spin spinning={loading}>
          <div>
            <FormItem label="编号">
              {getFieldDecorator('code', {
                rules: SOPCodeRule,
              })(<Input style={{ width }} disabled={isEdit} />)}
            </FormItem>
            <FormItem label="名称">
              {getFieldDecorator('name', {
                rules: [
                  required('名称'),
                  { max: 50, message: '名称长度不超过50' },
                  {
                    pattern: /[A-Za-z0-9\u4e00-\u9fa5-_]+$/,
                    message: '只支持中英文，数字，-，_',
                  },
                ],
              })(<Input style={{ width }} disabled={editSopByTemplateCreate} />)}
            </FormItem>
            <FormItem label="版本号">
              {getFieldDecorator('version', {
                rules: [required('版本号'), amountValidator(1000000)],
              })(<InputNumber style={{ width }} disabled={editSopByTemplateCreate} />)}
            </FormItem>
            <FormItem label="状态">
              <FormattedMessage defaultMessage={'停用中'} />
            </FormItem>
            <FormItem label="业务实体">
              <div className={classNames(styles.businessObjectType, 'child-gap')}>
                {getFieldDecorator('businessObjectType', {
                  initialValue: 1,
                })(
                  <Select disabled={editSopByTemplateCreate} style={{ width: 150 }}>
                    {Array.from(SOPBusinessObjectType, ([key, value]) => (
                      <Option value={key}>{value}</Option>
                    ))}
                  </Select>,
                )}
                {mode !== 'template' && (
                  <React.Fragment>
                    {getFieldDecorator('mbomId')(
                      <SearchSelect
                        style={{ width: 400 }}
                        disabled={editSopByTemplateCreate}
                        onChange={() => {
                          resetFields(['nodeCode']);
                        }}
                        extraSearch={params => extraSearchForMBom({ ...params, status: 0 })}
                      />,
                    )}
                    {getFieldDecorator('nodeCode')(
                      <SearchSelect
                        style={{ width: 250 }}
                        disabled={editSopByTemplateCreate}
                        loadOnFocus
                        extraSearch={async searchParams => {
                          const res = await extraSearchForProcess('mBom', searchParams, {
                            mBomId: getFieldValue('mbomId') && getFieldValue('mbomId').key,
                          });
                          return res || [];
                        }}
                      />,
                    )}
                  </React.Fragment>
                )}
              </div>
            </FormItem>
            <FormItem label="业务预设字段">
              <SimpleTable
                rowKey="id"
                columns={this.presetColumns}
                dataSource={presetFieldDataSource}
                pagination={false}
                style={{ margin: 0, width: 700 }}
              />
            </FormItem>
            <FormItem label="自定义字段">
              <SimpleTable
                rowKey="key"
                columns={this.getDIYColumns()}
                dataSource={DIYField.map(key => ({ key }))}
                pagination={false}
                style={{ margin: 0, width: 1000 }}
                footer={() => (
                  <Link
                    icon="plus-circle-o"
                    disabled={editSopByTemplateCreate}
                    onClick={() => {
                      this.setState({ DIYField: [...DIYField, (DIYField[DIYField.length - 1] || 0) + 1] });
                    }}
                  >
                    增加自定义字段
                  </Link>
                )}
              />
            </FormItem>
            <FormItem label=" ">
              <div>
                <Button
                  type="default"
                  style={{ width: 120, marginRight: 70 }}
                  onClick={() => {
                    push(this.isTemplateMode() ? toSOPTemplateList() : toSOPList());
                  }}
                >
                  取消
                </Button>
                <Button style={{ width: 120 }} onClick={this.onSubmit} loading={loading}>
                  保存
                </Button>
              </div>
            </FormItem>
          </div>
        </Spin>
      </div>
    );
  }
}

SOPBaseForm.propsTypes = {
  mode: PropTypes.oneOf(['template', 'sop']),
  type: PropTypes.oneOf(['create', 'edit']),
};

export default SOPBaseForm;
