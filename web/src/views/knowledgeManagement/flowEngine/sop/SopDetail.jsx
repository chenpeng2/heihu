import React from 'react';
import { Modal } from 'antd';
import {
  Radio,
  Link,
  FormItem,
  SimpleTable,
  Input,
  Popover,
  openModal,
  message,
  Spin,
  Icon,
  Table,
  FormattedMessage,
} from 'components';
import Color from 'styles/color';
import { disableSOP, enableSOP, getSOPDetail, getSOPSteps } from 'services/knowledgeBase/sop';
import {
  getSOPTemplateDetail,
  getSOPTemplateList,
  enableSopTemplate,
  disableSopTemplate,
} from 'services/knowledgeBase/sopTemplate';
import { replaceSign } from 'constants';
import _ from 'lodash';
import CONSTANT, { SOP_ENABLED_STATUS, SOPBusinessObjectType } from '../common/SOPConstant';
import { toSOPEdit, toSOPTemplateEdit, toSOPTemplateStep, toSOPStep, toSOPTemplateLog } from '../utils/navigation';
import ControllerList from './ControllerList';
import CopySop from './CopySop';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const SHOW_BASIC = 1;
const SHOW_STEP = 2;

class SopDetail extends React.PureComponent {
  state = {
    showCopyModal: false,
    SOPDetail: null,
    showType: SHOW_BASIC,
    SOPStepList: [],
    isCreatedByTemplate: false,
    loading: false,
  };

  isTemplateMode = this.props.mode === 'template';

  componentDidMount() {
    this.SOPId = this.props.match.params.SOPId;
    this.setInitialValue();
  }

  getSOPDetail = () => {
    const { SOPDetail } = this.state;
    if (!SOPDetail) {
      return {};
    }
    const { sop, sopTemplate } = SOPDetail;
    return this.isTemplateMode ? sopTemplate : sop;
  };

  setInitialValue = async () => {
    const detailApi = this.isTemplateMode ? getSOPTemplateDetail : getSOPDetail;
    const stepListApi = this.isTemplateMode ? getSOPTemplateList : getSOPSteps;
    const {
      data: { data },
    } = await detailApi(this.SOPId);
    const {
      data: {
        data: { stepList },
      },
    } = await stepListApi(this.SOPId);
    this.setState({
      SOPDetail: data,
      SOPStepList: this.convertDataSource(stepList),
      isCreatedByTemplate: !!_.get(data, 'sop.sopTemplate'),
    });
  };

  convertDataSource = dataSource => {
    return dataSource.map(({ step, subStepList }) => ({
      step,
      subStepList: subStepList && subStepList.length > 0 ? this.convertDataSource(subStepList) : null,
    }));
  };

  getPresetColumns = () => {
    return [
      { title: '名称', dataIndex: 'name' },
      { title: '类型', dataIndex: 'type', render: type => CONSTANT.SOPFieldType.get(type) },
      { title: '是否多值', dataIndex: 'multi', render: multi => (multi ? '是' : '否') },
      { title: '读写权限', dataIndex: 'rwPermission', render: rw => CONSTANT.SopFieldRwPermissionMap.get(rw) },
    ].map(node => ({
      ...node,
      key: node.title,
    }));
  };

  getDIYColumns = () => {
    const columns = [
      {
        title: '是否trigger赋值',
        dataIndex: 'useTrigger',
        render: useTrigger => (useTrigger ? '是' : '否'),
        key: 'useTrigger',
      },
      {
        title: 'trigger赋值语句',
        dataIndex: 'triggerValue',
        render: triggerValue => triggerValue || replaceSign,
        key: 'triggerValue',
      },
    ];
    return [...this.getPresetColumns(), ...columns];
  };

  getStepColumns = () => {
    return [
      {
        title: '步骤名称',
        dataIndex: 'step.name',
        width: 180,
        render: (name, { step }) => {
          const { groupType } = step;
          if (!groupType) {
            return name;
          }
          return (
            <span>
              {name}
              <Icon
                iconType="gc"
                type={groupType === CONSTANT.SOP_STEP_GROUP_TYPE_SERIAL ? 'chuan' : 'bing'}
                style={{ fontSize: 12, marginLeft: 2 }}
              />
            </span>
          );
        },
      },
      { title: '显示名称', dataIndex: 'step.showName' },
      {
        title: '执行权限',
        dataIndex: 'step.privilegeType',
        render: (type, { step }) => {
          const sopStepPrivilegeType = CONSTANT.SopStepPrivilegeType.get(type);
          if (!sopStepPrivilegeType) {
            return replaceSign;
          }
          return `${sopStepPrivilegeType} - ${_.get(step, 'privilegeValue.label', replaceSign)}`;
        },
      },
      {
        title: '电子签名',
        dataIndex: 'step.digitalSignature',
        render: (digitalSignature, { step }) => {
          if (!digitalSignature) {
            return replaceSign;
          }
          const { digitalSignatureType, digitalSignatureValue } = step;
          return `${CONSTANT.SopStepPrivilegeType.get(digitalSignatureType)} - ${_.get(
            digitalSignatureValue,
            'label',
          )}`;
        },
      },
      {
        title: '后续步骤',
        dataIndex: 'step.nextLogic',
        render: (nextLogic, { step }) => {
          if (!nextLogic) {
            return replaceSign;
          }
          const type = `${CONSTANT.NextLogic[nextLogic]}`;
          const { nextOptionalStepList, nextTrigger } = step;
          if (nextLogic === CONSTANT.NEXT_LOGIC_PERSON_SELECT) {
            return `${type}: ${nextOptionalStepList && nextOptionalStepList.map(({ label }) => label).join(',')}`;
          }
          if (nextLogic === CONSTANT.NEXT_LOGIC_IF_JUDGE) {
            return `${type}: ${nextTrigger}`;
          }
          return type;
        },
      },
      { title: '结束后执行', dataIndex: 'step.execAfterFinishTrigger', render: text => text || replaceSign },
      {
        title: '控件列表',
        dataIndex: 'step.controlCount',
        render: (count, record) =>
          count && (
            <Popover
              content={<ControllerList stepId={record.step.id} mode={this.props.mode} sopId={this.SOPId} />}
              title={`控件列表|${record.step.name}`}
              arrowPointAtCenter
            >
              <Link>{count}</Link>
            </Popover>
          ),
      },
      {
        title: '操作',
        dataIndex: 'step.id',
        fixed: 'right',
        render: id => {
          return (
            <Link
              to={
                this.isTemplateMode
                  ? toSOPTemplateStep(this.SOPId, {
                      stepId: id,
                    })
                  : toSOPStep(this.SOPId, {
                      stepId: id,
                    })
              }
              disabled={this.getSOPDetail().status}
              title="启用中的SOP不能编辑"
            >
              编辑
            </Link>
          );
        },
      },
    ].map(node => ({ width: 150, ...node, key: node.title }));
  };

  renderPresetTable = ({ dataSource, columns }) => {
    return (
      <SimpleTable
        columns={columns}
        dataSource={dataSource}
        style={{ margin: 0, width: 800 }}
        pagination={false}
        rowKey="id"
      />
    );
  };

  handleUpdateStatus = async (id, status) => {
    this.setState({ loading: true });
    const disableApi = this.isTemplateMode ? disableSopTemplate : disableSOP;
    const enableApi = this.isTemplateMode ? enableSopTemplate : enableSOP;
    if (status === SOP_ENABLED_STATUS) {
      await disableApi(id).finally(() => {
        this.setState({ loading: false });
      });
    } else {
      await enableApi(id).finally(() => {
        this.setState({ loading: false });
      });
    }
    this.setInitialValue();
    message.success('操作成功！');
  };

  render() {
    const { SOPDetail, SOPStepList, isCreatedByTemplate, loading } = this.state;
    const { mode } = this.props;
    if (!SOPDetail) {
      return null;
    }
    const { customFieldList, presetFieldList } = SOPDetail;
    const sopBaseDetail = this.getSOPDetail();
    const { mbom, node, status, syncStatus, sopTemplate } = sopBaseDetail;
    const { materialCode, materialName, version } = mbom || {};
    const { nodeCode, process } = node || {};
    const { code, name } = process || {};
    const maps = [
      { key: 'code', display: '编号' },
      {
        key: 'name',
        display: '名称',
      },
      { key: 'version', display: '版本号' },
      {
        key: 'status',
        display: '状态',
        render: status => (
          <div>
            <FormattedMessage defaultMessage={CONSTANT.SOPStatus.get(status)} />
            {!(this.isTemplateMode && syncStatus === 1) && (
              <Link
                style={{ marginLeft: 5 }}
                onClick={() => {
                  this.handleUpdateStatus(this.SOPId, status);
                }}
              >
                {status === SOP_ENABLED_STATUS ? '停用' : '启用'}
              </Link>
            )}
          </div>
        ),
      },
      !this.isTemplateMode && {
        key: 'sopTemplate',
        display: '模板',
        render: sopTemplate => {
          if (!sopTemplate) {
            return replaceSign;
          }
          const { name, code, version } = sopTemplate;
          return `${code}/${name}/${version}`;
        },
      },
      this.isTemplateMode && {
        key: 'syncStatus',
        display: '同步状态',
        render: syncStatus => <FormattedMessage defaultMessage={syncStatus === 1 ? '同步中' : '空闲'} />,
      },
      isCreatedByTemplate && {
        key: 'sopTemplate',
        display: '同步状态',
        render: sopTemplate => {
          return <FormattedMessage defaultMessage={sopTemplate.syncStatus === 1 ? '同步中' : '空闲'} />;
        },
      },
      {
        key: 'businessObjectType',
        display: '业务实体',
        render: type => (
          <p style={{ width: 800 }}>
            {this.isTemplateMode
              ? replaceSign
              : `${materialCode}/${materialName}/${version} - ${nodeCode}/${code}/${name}`}
          </p>
        ),
      },
    ].filter(n => n);
    const { showCopyModal, showType } = this.state;
    return (
      <div style={{ margin: 20 }}>
        <Spin spinning={loading}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className="child-gap" style={{ display: 'flex' }}>
              <FormattedMessage style={{ fontSize: 18, fontWeight: 'bold' }} defaultMessage={'SOP详情'} />
              <RadioGroup value={showType} onChange={e => this.setState({ showType: e.target.value })}>
                <RadioButton value={SHOW_BASIC}>
                  <FormattedMessage defaultMessage={'基本信息'} />
                </RadioButton>
                <RadioButton value={SHOW_STEP}>
                  <FormattedMessage defaultMessage={'步骤列表'} />
                </RadioButton>
              </RadioGroup>
            </div>
            <div className="child-gap40">
              {this.isTemplateMode && syncStatus === 0 && status === SOP_ENABLED_STATUS && (
                <Link to={`${location.pathname}/batch-create`} icon="plus-circle-o">
                  批量创建SOP
                </Link>
              )}
              {syncStatus !== 1 && (
                <Link
                  icon="edit"
                  to={this.isTemplateMode ? toSOPTemplateEdit(this.SOPId) : toSOPEdit(this.SOPId)}
                  disabled={status}
                  title="启用中的SOP不能编辑"
                >
                  编辑
                </Link>
              )}
              {mode !== 'template' && !isCreatedByTemplate && (
                <Link
                  icon="copy"
                  onClick={() =>
                    openModal({
                      children: <CopySop SOPId={this.SOPId} wrappedComponentRef={inst => (this.copyForm = inst)} />,
                      title: '复制SOP',
                      onOk: async () => {
                        await this.copyForm.submit();
                      },
                      autoClose: false,
                    })
                  }
                >
                  复制
                </Link>
              )}
              <Link icon="eye" to={`${location.pathname}/log`}>
                查看操作记录
              </Link>
            </div>
          </div>
          <div style={{ marginTop: 10 }}>
            {showType === SHOW_BASIC ? (
              <div>
                {maps.map(({ key, display, render }) => (
                  <FormItem label={display} key={`${key}${display}`} style={{ margin: 0 }}>
                    {render ? render(sopBaseDetail[key]) : <span>{sopBaseDetail[key]}</span>}
                  </FormItem>
                ))}
                <FormItem label="业务预设字段" style={{ marginTop: 20 }}>
                  {this.renderPresetTable({ dataSource: presetFieldList, columns: this.getPresetColumns() })}
                </FormItem>
                <FormItem label="自定义字段">
                  {this.renderPresetTable({ dataSource: customFieldList, columns: this.getDIYColumns() })}
                </FormItem>
              </div>
            ) : (
              <Table
                dragable
                tableUniqueKey={'sop-detail-page-step'}
                columns={this.getStepColumns()}
                pagination={false}
                childrenColumnName="subStepList"
                dataSource={SOPStepList}
                rowKey={({ step: { id } }) => id}
                footer={() => {
                  const to = this.isTemplateMode
                    ? toSOPTemplateStep(this.SOPId)
                    : `/knowledgeManagement/sop/edit-sop-step/${this.SOPId}`;
                  return SOPStepList && SOPStepList.length > 0 ? (
                    <Link icon="edit" to={to} disabled={status} title="启用中SOP不能编辑">
                      编辑步骤
                    </Link>
                  ) : (
                    <Link icon="plus-circle-o" to={to}>
                      创建步骤或步骤组
                    </Link>
                  );
                }}
              />
            )}
          </div>
        </Spin>
        <Modal
          title="复制SOP"
          visible={showCopyModal}
          onCancel={() => {
            this.setState({ showCopyModal: false });
          }}
        >
          <div style={{ background: Color.grey, border: `1px solid ${Color.border}`, paddingTop: 10 }}>
            <FormItem label="复制后的编号">
              <Input />
            </FormItem>
          </div>
        </Modal>
      </div>
    );
  }
}

export default SopDetail;
