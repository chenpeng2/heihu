import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Modal } from 'antd';
import auth from 'utils/auth';
import withForm from 'components/form';
import { replaceSign } from 'src/constants';
import moment from 'src/utils/time';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import {
  Row,
  Col,
  Link,
  DetailPageItemContainer,
  Table,
  Spin,
  Searchselect,
  Icon,
  Tooltip,
  Popover,
  Alert,
  Button,
} from 'components';
import { error, grey, borderGrey, white } from 'src/styles/color';
import { STRATEGY_TRIGGER_TYPE, STRATEGY_CATEGORY } from 'src/views/equipmentMaintenance/constants';
import { queryEquipmentCategoryDetail, deleteEquipmentCategory } from 'src/services/knowledgeBase/equipment';
import { bindDeviceTypeSpareParts, unbindDeviceTypeSpareParts } from 'services/equipmentMaintenance/spareParts';
import { enableStrategy, disableStrategy } from 'services/equipmentMaintenance/base';
import authorityWrapper from 'src/components/authorityWrapper';
import { getTimeUnitName } from '../base/formatValue';
import styles from './styles.scss';

const DeleteWrapper = authorityWrapper(Link);
const EditWrapper = authorityWrapper(Link);

type Props = {
  match: {
    params: {
      id: any,
    },
  },
  intl: any,
  form: any,
  location: {
    query: {},
  },
};
const itemContainerStyle = {
  padding: '0 20px',
  marginTop: 20,
};
const colStyle = { width: 400 };

class EquipmentTypeDetail extends Component {
  props: Props;
  state = {
    data: {},
    loading: false,
    pageLoading: false,
    strategyLoading: false,
    equipmentCleanStatus: null,
    spareParts: [],
    visible: false,
  };

  componentWillMount() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    const { spareParts } = this.state;
    const config = getOrganizationConfigFromLocalStorage();
    const equipmentCleanStatus = config.config_equipment_clean_status.configValue;
    this.setState({ equipmentCleanStatus });
    queryEquipmentCategoryDetail(id).then(res => {
      const {
        data: {
          data: { unionMaterials },
        },
      } = res;
      if (unionMaterials) {
        unionMaterials.forEach(n => {
          spareParts.push(n.material);
        });
      }
      this.setState({ spareParts });
    });
  }

  componentDidMount() {
    const {
      match: {
        params: { id },
      },
    } = this.props;
    this.fetchData(id);
  }

  fetchData = async id => {
    this.setState({ pageLoading: true });
    const { data } = await queryEquipmentCategoryDetail(id);
    this.setState({
      data: data.data,
      pageLoading: false,
    });
  };

  showDeleteConfirm = () => {
    const { data } = this.state;
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    Modal.confirm({
      iconType: 'exclamation-circle',
      className: `${styles.deleteModal}`,
      title: changeChineseToLocale('删除设备类型', intl),
      content: changeChineseTemplateToLocale('确认删除设备类型{name}吗？此操作无法恢复！', { name: data.name }),
      okText: changeChineseToLocale('删除', intl),
      cancelText: changeChineseToLocale('放弃', intl),
      onOk: () => {
        const {
          match: {
            params: { id },
          },
        } = this.props;
        deleteEquipmentCategory(id)
          .then(res => {
            if (res.data.statusCode === 200) {
              this.context.router.history.push('/knowledgeManagement/equipmentType');
            }
          })
          .catch(console.log);
      },
    });
  };

  getColumns = () => {
    return [
      {
        title: '读数名称',
        width: 280,
        dataIndex: 'metricName',
      },
      {
        title: '单位',
        width: 380,
        dataIndex: 'metricUnitName',
      },
    ];
  };

  getEquipTypeInfo = () => {
    const { data } = this.state;
    const { deviceMetrics, resourceCategory, calibrationConfig, mouldBind, name } = data && data;
    const columns = this.getColumns();
    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer
          contentStyle={{ width: 880 }}
          itemHeaderTitle={'设备类型信息'}
          action={
            <div style={{ display: 'flex', width: 140, alignItems: 'center', backgroundColor: grey }}>
              <EditWrapper
                auth={auth.WEB_EDIT_EQUIPMENT}
                icon="form"
                style={{ marginRight: 20 }}
                onClick={() => {
                  const {
                    match: {
                      params: { id },
                    },
                  } = this.props;
                  this.context.router.history.push(
                    `/knowledgeManagement/equipmentType/${id}/edit?resourceCategory=${resourceCategory}`,
                  );
                }}
              >
                编辑
              </EditWrapper>
              <DeleteWrapper
                auth={auth.WEB_REMOVE_EQUIPMENT}
                icon="delete"
                style={{ color: error, marginRight: 20 }}
                onClick={() => {
                  this.showDeleteConfirm();
                }}
              >
                删除
              </DeleteWrapper>
            </div>
          }
        >
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'类型名称'}</Col>
            <Col type={'content'} style={colStyle}>
              {name}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'资源类别'}</Col>
            <Col type={'content'} style={colStyle}>
              {resourceCategory === 'equipmentProd' ? '生产设备' : '设备组件'}
            </Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'模具绑定'}</Col>
            <Col type={'content'} style={colStyle}>
              {mouldBind ? '开启' : '关闭'}
            </Col>
          </Row>
          {resourceCategory === 'equipmentProd' ? (
            <Row style={{ marginRight: 40 }}>
              <Col type={'title'}>{'设备效期'}</Col>
              <Col type={'content'} style={colStyle}>
                {calibrationConfig ? '开启' : '关闭'}
              </Col>
            </Row>
          ) : null}
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'设备读数'}</Col>
            <Col type={'content'} style={{ marginLeft: -20, width: 460 }}>
              {
                <Table
                  columns={columns}
                  dataSource={Array.isArray(deviceMetrics) ? deviceMetrics : []}
                  pagination={false}
                />
              }
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  getCleanConfig = cleanConfig => {
    return (
      <div style={{ ...itemContainerStyle, marginTop: 20 }}>
        <DetailPageItemContainer itemHeaderTitle={'设备清洁配置'}>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'清洁管理'}</Col>
            <Col type={'content'}>{cleanConfig.open ? '开启' : '关闭'}</Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'清洁效期'}</Col>
            <Col type={'content'}>
              {`${cleanConfig.validPeriod || 0}${cleanConfig.validPeriodUnit === 'd' ? '天' : '小时'}`}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  hide = () => {
    this.setState({ visible: false });
  };

  open = () => {
    this.setState({ visible: true });
  };

  getStrategyColumns = () => {
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
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
        render: strategyDescription => <Tooltip text={strategyDescription || replaceSign} length={20} />,
      },
      {
        title: '策略开始时间',
        dataIndex: 'strategyStartTime',
        width: 180,
        render: strategyStartTime => {
          return strategyStartTime ? moment(strategyStartTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
        },
      },
      {
        title: '策略结束时间',
        dataIndex: 'strategyEndTime',
        width: 180,
        render: strategyEndTime => {
          return strategyEndTime ? moment(strategyEndTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
        },
      },
      {
        title: '策略类型',
        dataIndex: 'strategyCategory',
        width: 90,
        render: data => changeChineseToLocale(STRATEGY_CATEGORY[data], intl),
      },
      {
        title: '策略方案',
        dataIndex: 'strategyTriggerType',
        width: 110,
        render: data => changeChineseToLocale(STRATEGY_TRIGGER_TYPE[data], intl),
      },
      {
        title: '方案描述',
        dataIndex: 'strategyTriggerType',
        key: 'strategyTriggerTypeDesc',
        width: 160,
        render: (data, record) => {
          const { strategyTriggerSchema, deviceMetric } = record;
          const { period, timeUnit } = strategyTriggerSchema || {};
          if (data === 5) {
            return replaceSign;
          } else if (data === 1 || data === 2) {
            const timeUnitName = getTimeUnitName(timeUnit);
            return changeChineseTemplateToLocale('周期：每{period}{timeUnitName}', {
              period,
              timeUnitName: changeChineseToLocale(timeUnitName, intl),
            });
          }
          const { metricBaseValue, metricCompareType } = strategyTriggerSchema || {};
          const { metricUnitName, metricName } = deviceMetric || {};
          return (
            <Tooltip
              text={changeChineseTemplateToLocale(
                '{metricName}阈值{metricCompareType}{metricBaseValue}{metricUnitName}',
                {
                  metricName,
                  metricCompareType: metricCompareType === 1 ? '≤' : '≥',
                  metricBaseValue,
                  metricUnitName,
                },
              )}
              width={140}
            />
          );
        },
      },
      {
        title: '操作',
        fixed: 'right',
        key: 'operation',
        width: 90,
        render: (_, record) => {
          const { disabledApplicationCount, enabledApplicationCount } = record;
          const {
            match: {
              params: { id },
            },
          } = this.props;
          if (disabledApplicationCount === 0 && enabledApplicationCount === 0) {
            return replaceSign;
          }
          return (
            <Popover
              trigger={'click'}
              content={this.renderContent(id, { strategyCode: record.strategyCode }, record)}
              visible={visible && selectId === record.strategyCode}
            >
              <Link
                onClick={() => {
                  this.setState({ selectId: record.strategyCode });
                  if (enabledApplicationCount === 0) {
                    this.setState({ strategyLoading: true });
                    enableStrategy(id, { strategyCode: record.strategyCode }).then(() => {
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

  renderContent = (id, params, record) => {
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
              disableStrategy(id, params).then(() => {
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

  getStrategyConfig = taskStrategies => {
    const { intl } = this.props;
    const columns = this.getStrategyColumns();
    return (
      <Spin spinning={this.state.strategyLoading || false}>
        <div className={styles.strategyConfig} style={{ ...itemContainerStyle, marginTop: 20 }}>
          <DetailPageItemContainer
            wrapperStyle={{ paddingBottom: taskStrategies && taskStrategies.length > 10 ? 50 : 0 }}
            itemHeaderTitle={'维护策略'}
          >
            {taskStrategies && taskStrategies.length ? (
              <Table
                columns={columns}
                dataSource={Array.isArray(taskStrategies) ? taskStrategies : []}
                pagination={
                  taskStrategies && taskStrategies.length > 10 ? { pageSize: 10, total: taskStrategies.length } : false
                }
              />
            ) : (
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                {changeChineseToLocale('暂无信息', intl)}
              </div>
            )}
          </DetailPageItemContainer>
        </div>
      </Spin>
    );
  };

  getRepairTaskConfig = repairTaskConfig => {
    return (
      <div style={{ ...itemContainerStyle, marginTop: 20 }}>
        <DetailPageItemContainer itemHeaderTitle={'维修任务配置'}>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'扫码确认'}</Col>
            <Col type={'content'}>{repairTaskConfig.scan ? '开启' : '关闭'}</Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'报告模板'}</Col>
            <Col type={'content'}>{repairTaskConfig.reportTemplate.name}</Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'提醒设置'}</Col>
            <Col type={'content'}>{repairTaskConfig.warnConfigDisplay}</Col>
          </Row>
          <Row style={{ marginRight: 40 }}>
            <Col type={'title'}>{'完成验收'}</Col>
            <Col type={'content'}>{repairTaskConfig.acceptanceCheck ? '是' : '否'}</Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  getSparePartsAssociation = () => {
    const {
      match: {
        params: { id },
      },
      form,
      intl,
    } = this.props;
    const { getFieldDecorator, getFieldValue } = form;
    const { spareParts, loading, disabled } = this.state;
    const _spareParts = _.cloneDeep(spareParts);

    return (
      <Spin spinning={loading}>
        <div style={{ ...itemContainerStyle, marginTop: 20 }}>
          <DetailPageItemContainer contentStyle={{ width: '100%' }} itemHeaderTitle={'备件关联'}>
            <div style={{ width: '100%', margin: '10px 20px 10px 0' }}>
              <div
                style={{
                  backgroundColor: grey,
                  height: 44,
                  lineHeight: '44px',
                  border: `1px solid ${borderGrey}`,
                }}
              >
                <span style={{ padding: '17px 0 17px 51px' }}>{changeChineseToLocale('备件', intl)}</span>
              </div>
              {spareParts.map(n => {
                return (
                  <div className={styles.item} style={{ borderTop: 'transparent' }}>
                    <Icon
                      type={'minus-circle'}
                      style={{ marginRight: 5, color: error, cursor: 'pointer' }}
                      onClick={() => {
                        const index = spareParts.findIndex(m => {
                          return n.code === m.code;
                        });
                        const value = getFieldValue(n.code);
                        if (value && (this.state[n.code] || n.name)) {
                          this.setState({ loading: true });
                          unbindDeviceTypeSpareParts({ id, code: value.key }).then(() => {
                            this.setState({ loading: false });
                            _spareParts.splice(index, 1);
                            this.setState({ spareParts: _spareParts });
                          });
                        } else {
                          _spareParts.splice(index, 1);
                          this.setState({ spareParts: _spareParts });
                        }
                      }}
                    />
                    {getFieldDecorator(n.code, {
                      initialValue: n.name ? { label: `${n.name}(编码${n.code})`, key: n.code } : [],
                    })(
                      <Searchselect
                        style={{ width: 526 }}
                        allowClear={false}
                        onChange={value => {
                          this.setState({ loading: true });
                          bindDeviceTypeSpareParts({ id, code: value.key })
                            .then(() => {
                              this.setState({ [n.code]: true });
                            })
                            .finally(() => {
                              this.setState({ loading: false });
                            });
                        }}
                        disabled={this.state[n.code] || !!n.name}
                        placeholder="请选择关联备件"
                        type={'spareParts'}
                        key="spareParts"
                      />,
                    )}
                  </div>
                );
              })}
              <div
                className={styles.item}
                style={{ borderTop: 'transparent', cursor: 'pointer' }}
                onClick={() => {
                  spareParts.push({ code: _.uniqueId('spareParts') });
                  this.setState({ spareParts });
                }}
              >
                <Icon type={'plus-circle-o'} style={{ marginRight: 5 }} />
                {changeChineseToLocale('添加一行', intl)}
              </div>
            </div>
          </DetailPageItemContainer>
        </div>
      </Spin>
    );
  };

  render() {
    const {
      location: { query },
    } = this.props;
    const { data, equipmentCleanStatus, pageLoading } = this.state;
    const { repairTaskConfig, cleanConfig, taskStrategies } = data && data;
    const { resourceCategory } = query;
    return (
      <Spin spinning={pageLoading}>
        {data && repairTaskConfig && cleanConfig ? (
          <div className={styles.equipmentTypeDetail}>
            <div style={{ paddingBottom: 100 }}>
              {this.getEquipTypeInfo()}
              {this.getStrategyConfig(taskStrategies)}
              {equipmentCleanStatus === 'true' && resourceCategory === 'equipmentProd'
                ? this.getCleanConfig(cleanConfig)
                : null}
              {this.getRepairTaskConfig(repairTaskConfig)}
              {/* {this.getSparePartsAssociation()} */}
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height: '100%' }} />
        )}
      </Spin>
    );
  }
}

EquipmentTypeDetail.contextTypes = {
  router: PropTypes.object.isRequired,
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({}, withRouter(injectIntl(EquipmentTypeDetail)));
