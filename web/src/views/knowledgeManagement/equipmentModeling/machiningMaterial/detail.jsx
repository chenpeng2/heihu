import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'utils/time';
import {
  Row,
  Col,
  Link,
  Attachment,
  DetailPageItemContainer,
  ImagePreview,
  Spin,
  Table,
  Tooltip,
  Popover,
  Alert,
  Button,
} from 'components';
import { replaceSign } from 'src/constants';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getMachiningMaterialDetail } from 'src/services/knowledgeBase/equipment';
import { white } from 'src/styles/color';
import { getCustomLanguage } from 'src/utils/customLanguage';
import { enableStrategy, disableStrategy } from 'services/equipmentMaintenance/machiningMaterial';
import { remindGroup } from 'src/views/knowledgeManagement/equipmentModeling/equipmentType/constants';
import { getTimeUnitName } from '../equipmentType/base/formatValue';
import LinkToChangeStatus from './linkToChangeStatus';
import { getEditMachiningMaterialUrl } from './utils';

type Props = {
  match: {},
  intl: any,
  history: any,
};

const customLanguage = getCustomLanguage();
const itemContainerStyle = {
  padding: '0 20px',
  marginTop: 20,
};
const colStyle = { width: 400 };

class MachiningMaterial extends Component {
  props: Props;
  state = {
    data: null,
    loading: false,
    strategyLoading: false,
  };

  componentWillMount() {
    this.fetchData();
  }

  fetchData() {
    const { match } = this.props;
    const {
      params: { code },
    } = match;
    this.setState({ loading: true });
    getMachiningMaterialDetail(decodeURIComponent(code)).then(res => {
      const { data } = res.data;
      this.setState({ data, loading: false });
    });
  }

  open = () => {
    this.setState({ visible: true });
  };

  hide = () => {
    this.setState({ visible: false });
  };

  getStrategyColumns = () => {
    const { match } = this.props;
    const {
      params: { code },
    } = match;
    const { visible, selectId } = this.state;
    return [
      {
        title: '策略号/策略名称',
        dataIndex: 'strategyTitle',
        width: 150,
        render: (strategyTitle, record) => (
          <Tooltip text={`${record.strategyCode}/${strategyTitle}` || replaceSign} length={20} />
        ),
      },
      {
        title: '策略描述',
        dataIndex: 'strategyDescription',
        render: strategyDescription => <Tooltip text={strategyDescription || replaceSign} length={10} />,
      },
      {
        title: '策略开始时间',
        dataIndex: 'strategyStartTime',
        width: 150,
        render: strategyStartTime => {
          return strategyStartTime ? moment(strategyStartTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
        },
      },
      {
        title: '策略结束时间',
        dataIndex: 'strategyEndTime',
        width: 150,
        render: strategyEndTime => {
          return strategyEndTime ? moment(strategyEndTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
        },
      },
      {
        title: '策略类型',
        dataIndex: 'strategyCategory',
        width: 90,
        render: data => {
          return data === 2 ? '保养' : '点检';
        },
      },
      {
        title: '策略方案',
        dataIndex: 'strategyTriggerType',
        width: 90,
        render: data => {
          switch (data) {
            case 1:
              return '固定周期';
            case 2:
              return '浮动周期';
            case 3:
              return '累计用度';
            case 4:
              return '固定用度';
            case 5:
              return '手动创建';
            default:
              return '手动创建';
          }
        },
      },
      {
        title: '方案描述',
        dataIndex: 'strategyTriggerType',
        key: 'strategyTriggerTypeDesc',
        width: 140,
        render: (data, record) => {
          const { strategyTriggerSchema, deviceMetric } = record;
          const { period, timeUnit } = strategyTriggerSchema || {};
          if (data === 5) {
            return replaceSign;
          } else if (data === 1 || data === 2) {
            const timeUnitName = getTimeUnitName(timeUnit);
            return `周期：每${period}${timeUnitName}`;
          }
          const { metricBaseValue, metricCompareType } = strategyTriggerSchema || {};
          const { metricUnitName, metricName } = deviceMetric || {};
          return `${metricName}阈值${metricCompareType === 1 ? '≤' : '≥'}${metricBaseValue}${metricUnitName}`;
        },
      },
      {
        title: '操作',
        fixed: 'right',
        key: 'operation',
        width: 80,
        render: (_, record) => {
          const { disabledApplicationCount, enabledApplicationCount } = record;
          if (
            (disabledApplicationCount === 0 && enabledApplicationCount === 0) ||
            (!disabledApplicationCount && !enabledApplicationCount)
          ) {
            return replaceSign;
          }

          return (
            <Popover
              trigger={'click'}
              content={this.renderContent(code, { strategyCode: record.strategyCode }, record)}
              visible={visible && selectId === record.strategyCode}
            >
              <Link
                onClick={() => {
                  this.setState({ selectId: record.strategyCode });
                  if (enabledApplicationCount === 0) {
                    this.setState({ strategyLoading: true });
                    enableStrategy(code, { strategyCode: record.strategyCode }).then(() => {
                      record.enabledApplicationCount = 1;
                      this.setState({ strategyLoading: false });
                    });
                  } else {
                    this.open();
                  }
                }}
              >
                {enabledApplicationCount !== 0 ? '停用' : '启用'}
              </Link>
            </Popover>
          );
        },
      },
    ];
  };

  renderContent = (code, params, record) => {
    const { intl } = this.props;
    return (
      <div>
        <Alert
          style={{ width: 180, background: white, border: 'none' }}
          message={changeChineseToLocale('请确认是否停用该策略', intl)}
          showIcon
          type={'warning'}
        />
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type={'default'} size={'small'} style={{ marginRight: 10 }} onClick={this.hide}>
            取消
          </Button>
          <Button
            size={'small'}
            onClick={() => {
              this.setState({ strategyLoading: true });
              disableStrategy(code, params).then(() => {
                record.enabledApplicationCount = 0;
                record.disabledApplicationCount = 1;
                this.hide();
                this.setState({ strategyLoading: false });
              });
            }}
          >
            确定
          </Button>
        </div>
      </div>
    );
  };

  getOutputMaterialsColumns = () => {
    return [
      {
        title: '产出物料组编号/名称',
        width: 320,
        dataIndex: 'materialGroup',
        render: materialGroup => (
          <div>
            {materialGroup.map(n => (
              <Tooltip
                containerStyle={{ display: 'block' }}
                text={
                  n.outputMaterialCode && n.outputMaterialName
                    ? `${n.outputMaterialCode}/${n.outputMaterialName}`
                    : replaceSign
                }
                width={300}
              />
            ))}
          </div>
        ),
      },
      {
        title: '数量',
        width: 120,
        dataIndex: 'materialGroup',
        key: 'num',
        render: materialGroup => (
          <div>
            {materialGroup.map(n =>
              typeof n.outputAmount === 'number' ? (
                <Tooltip containerStyle={{ display: 'block' }} text={n.outputAmount} width={100} />
              ) : (
                replaceSign
              ),
            )}
          </div>
        ),
      },
      {
        title: '单位',
        width: 120,
        dataIndex: 'materialGroup',
        key: 'unit',
        render: materialGroup => (
          <div>
            {materialGroup.map(n => (
              <Tooltip
                containerStyle={{ display: 'block' }}
                text={n.outputMaterialPrimaryUnitName || replaceSign}
                width={100}
              />
            ))}
          </div>
        ),
      },
    ];
  };

  renderStrategyConfig = () => {
    const { data } = this.state;
    const { metrics, taskStrategies } = data || {};
    const columns = this.getStrategyColumns();
    return (
      <Spin spinning={this.state.strategyLoading}>
        <div style={{ ...itemContainerStyle, marginTop: 20 }}>
          <DetailPageItemContainer itemHeaderTitle={'维护策略'}>
            <Row style={{ marginRight: 20 }}>
              <Col type={'title'}>{'读数'}</Col>
              <Col style={colStyle} type={'content'}>
                {(metrics &&
                  metrics.length &&
                  metrics.map(metric => `${metric.metricName}(${metric.metricUnitName})`).join('，')) ||
                  replaceSign}
              </Col>
            </Row>
            <Row style={{ marginRight: 20, width: '100%' }}>
              <Col type={'title'}>{'维护策略'}</Col>
              <Col style={{ width: '85%' }} type={'content'}>
                {taskStrategies && taskStrategies.length ? (
                  <Table
                    style={{ margin: 'unset' }}
                    columns={columns}
                    dataSource={Array.isArray(taskStrategies) ? taskStrategies : []}
                    pagination={
                      taskStrategies && taskStrategies.length > 10
                        ? { pageSize: 10, total: taskStrategies.length }
                        : false
                    }
                  />
                ) : (
                  replaceSign
                )}
              </Col>
            </Row>
          </DetailPageItemContainer>
        </div>
      </Spin>
    );
  };

  renderRepairTaskConfig = () => {
    const { data } = this.state;
    const { repairTaskConfig } = data || {};
    const { scan, acceptanceCheck, reportTemplate, warnConfig } = repairTaskConfig || {};
    const warnConfigObj = remindGroup.filter(n => `${n.key}` === warnConfig)[0];
    return (
      <div style={{ ...itemContainerStyle, marginTop: 20 }}>
        <DetailPageItemContainer itemHeaderTitle={'维修任务配置'}>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'扫码确定'}</Col>
            <Col style={colStyle} type={'content'}>
              {scan ? '开启' : '关闭'}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'报告模板'}</Col>
            <Col style={colStyle} type={'content'}>
              {(reportTemplate && reportTemplate.name) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'提醒设置'}</Col>
            <Col style={colStyle} type={'content'}>
              {(warnConfigObj && warnConfigObj.label) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'完成验收'}</Col>
            <Col style={colStyle} type={'content'}>
              {acceptanceCheck ? '开启' : '关闭'}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  renderOutputMaterials() {
    const { intl } = this.props;
    const { data } = this.state;
    const { outputMaterials, toolingTypeDisplay } = data || {};
    const columns = this.getOutputMaterialsColumns();
    return (
      <div>
        {changeChineseToLocale(toolingTypeDisplay, intl)}
        {outputMaterials && outputMaterials.length ? (
          <Table
            style={{ margin: 'unset', marginTop: 10 }}
            columns={columns}
            dataSource={Array.isArray(outputMaterials) ? outputMaterials.map(n => ({ materialGroup: n })) : []}
            pagination={false}
          />
        ) : null}
      </div>
    );
  }

  renderMachiningMaterial = () => {
    const { history, intl } = this.props;
    const { data } = this.state;
    const {
      pictureFiles,
      type,
      typeDisplay,
      code,
      name,
      status,
      unitName,
      unitPrice,
      attachmentFiles,
      mgmtElectronicLabel,
      mgmtLifeCycle,
      specification,
    } = data || {};
    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer
          contentStyle={{ width: 880 }}
          itemHeaderTitle={`${customLanguage.equipment_machining_material}${changeChineseToLocale('信息', intl)}`}
          action={
            <Link
              icon="form"
              style={{ marginRight: 20 }}
              onClick={() => {
                history.push(getEditMachiningMaterialUrl(encodeURIComponent(code)));
              }}
            >
              编辑
            </Link>
          }
        >
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'图片'}</Col>
            <Col style={colStyle} type={'content'}>
              {(pictureFiles &&
                pictureFiles.length &&
                pictureFiles.map(picture => <ImagePreview url={picture.id} filename={picture.original_filename} />)) ||
                replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'类型'}</Col>
            <Col style={colStyle} type={'content'}>
              {typeDisplay}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'编号'}</Col>
            <Col style={colStyle} type={'content'}>
              {code}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'名称'}</Col>
            <Col style={colStyle} type={'content'}>
              {name}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'单位'}</Col>
            <Col style={colStyle} type={'content'}>
              {unitName}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'参考单价'}</Col>
            <Col style={colStyle} type={'content'}>
              {unitPrice || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'规格描述'}</Col>
            <Col style={colStyle} type={'content'}>
              {specification || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'附件'}</Col>
            <Col style={{ width: 350 }} type={'content'}>
              {(attachmentFiles && attachmentFiles.length && Attachment.AttachmentFile(attachmentFiles)) || replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'状态'}</Col>
            <Col style={colStyle} type={'content'}>
              <span style={{ marginRight: 20 }}>{changeChineseToLocale(status === 1 ? '启用中' : '停用中', intl)}</span>
              <LinkToChangeStatus
                record={data}
                onUpdate={status => {
                  this.setState({ status });
                }}
              />
            </Col>
          </Row>
          {type === 2 ? (
            <Row style={{ marginRight: 20 }}>
              <Col type={'title'}>{'工装类型'}</Col>
              <Col style={colStyle} type={'content'}>
                {this.renderOutputMaterials()}
              </Col>
            </Row>
          ) : null}
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'生命周期管理'}</Col>
            <Col style={colStyle} type={'content'}>
              {mgmtLifeCycle ? '有' : '无'}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>{'电子标签管理'}</Col>
            <Col style={colStyle} type={'content'}>
              {mgmtElectronicLabel ? '有' : '无'}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  render() {
    const { loading, data } = this.state;
    const { mgmtLifeCycle } = data || {};

    return (
      <Spin spinning={loading}>
        <div style={{ marginBottom: 100 }}>
          {this.renderMachiningMaterial()}
          {mgmtLifeCycle ? this.renderStrategyConfig() : null}
          {mgmtLifeCycle ? this.renderRepairTaskConfig() : null}
        </div>
      </Spin>
    );
  }
}

export default injectIntl(MachiningMaterial);
