import * as React from 'react';
import {
  SimpleTable,
  Link,
  Button,
  Icon,
  Spin,
  Popconfirm,
  message,
  Tooltip,
  ImagePreview,
  Attachment,
  authorityWrapper,
  Searchselect,
  OpenModal,
  Table,
  openModal,
  haveAuthority,
  Row,
  Col,
  DetailPageItemContainer,
  buttonAuthorityWrapper,
  withForm,
} from 'components';
import PropTypes from 'prop-types';
import {
  getDeviceDetail,
  getModuleDetail,
  deviceScrap,
  enableDevice,
  disableDevice,
  cleanDevice,
  dirtyDevice,
  getDeviceLog,
  getModuleLog,
} from 'services/equipmentMaintenance/device';
import moment, { format } from 'src/utils/time';
import { getOrganizationConfigFromLocalStorage } from 'utils/organizationConfig';
import {
  bindDeviceSpareParts,
  bindMoudleSpareParts,
  unbindDeviceSpareParts,
  unbindMoudleSpareParts,
} from 'services/equipmentMaintenance/spareParts';
import {
  disableEquipProdStrategy,
  disableEquipModuleStrategy,
  CreateEquipProdTaskByStrategy,
  CreateEquipMoudleTaskByStrategy,
  enableEquipProdStrategy,
  enableEquipModuleStrategy,
} from 'services/equipmentMaintenance/base';
import {
  STRATEGY_TRIGGER_TYPE,
  STRATEGY_CATEGORY,
  EQUIPMENT_CLEAN_STATUS,
  CLEANED,
  WAITFORCLEAN,
} from 'src/views/equipmentMaintenance/constants';
import { getTimeUnitName } from 'views/knowledgeManagement/equipmentModeling/equipmentType/base/formatValue';
import { alertYellow, borderGrey, grey, error, primary } from 'styles/color';
import { Dropdown, Menu } from 'antd';
import _ from 'lodash';
import auth from 'utils/auth';
import { arrayIsEmpty } from 'src/utils/array';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { DEVICE_ENABLE_STATUS, replaceSign } from 'constants';
import { formatUnixMoment } from 'utils/time';
import EditCleanConfig from './editCleanConfig';
import EditCalibrationConfigModal from './editCalibrationConfigModal';
import CleanStatusConfirmModal from './cleanStatusConfirmModal';
import EditDeviceCode from './editDeviceCode';
import EnableStrategyModal from './enableStrategyModal';
import StrategyDetailModal from './strategyDetailModal';
import DeviceDownTime from './deviceDownTime';
import { cycle, DEVICE_STATUS } from './constants';
import styles from './index.scss';

Menu.Item = authorityWrapper(Menu.Item);
const LinkWithAuth = buttonAuthorityWrapper(Link);

type propsType = {
  form: any,
  intl: any,
  location: any,
  history: any,
  match: {},
  id: string,
  type: string,
};

const itemContainerStyle = {
  padding: '0 20px',
  marginTop: 20,
};
const colStyle = { width: 400 };

class DeviceDetail extends React.Component<propsType> {
  state = {
    data: {},
    moduleDataSource: [],
    logDataSource: [],
    equipmentCleanStatus: false,
    loading: false,
    strategyLoding: false,
    visible: false,
    isChange: false,
    deviceCode: null,
    cleanStatus: 0,
    spareParts: [],
    boundMoulds: [],
    taskStrategies: [],
  };

  componentWillMount() {
    const { match, type } = this.props;
    const {
      params: { deviceId, moduleId },
    } = match;
    const { spareParts } = this.state;
    const getDetail = type === 'module' ? getModuleDetail : getDeviceDetail;
    getDetail(type === 'module' ? moduleId : deviceId).then(res => {
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
      const config = getOrganizationConfigFromLocalStorage();
      const equipmentCleanStatus = config.config_equipment_clean_status.configValue;
      const deviceCalibration = config.config_device_calibration.configValue;
      this.setState({ spareParts, equipmentCleanStatus, deviceCalibration });
    });
  }

  componentDidMount() {
    if (document.getElementById('deviceDetail')) {
      document.getElementById('deviceDetail').scrollIntoView();
    }
    this.setPageDetail();
    this.setPageDeviceLog();
  }

  componentWillReceiveProps(nextProps) {
    this.setPageDetail(nextProps);
  }

  setPageDetail = async props => {
    this.setState({ loading: true });
    const { match, type } = props || this.props;
    const {
      params: { deviceId, moduleId },
    } = match;
    const {
      data: {
        data: { entity, logs, modules, boundMoulds, taskStrategies },
      },
    } = type === 'module' ? await getModuleDetail(moduleId) : await getDeviceDetail(deviceId);
    this.setState({ data: entity, boundMoulds, moduleDataSource: modules, loading: false, taskStrategies });
  };

  setPageDeviceLog = async () => {
    const { match, type } = this.props;
    const {
      params: { deviceId, moduleId },
    } = match;
    const {
      data: { data },
    } = type === 'module' ? await getModuleLog(moduleId, {}) : await getDeviceLog(deviceId, {});
    this.setState({ logDataSource: data });
  };

  getModuleColumns = () => {
    const { location } = this.props;
    return [
      {
        title: '设备名称',
        dataIndex: 'name',
        key: 'name',
        render: text => <Tooltip length={15} text={text} />,
      },
      {
        title: '设备编码',
        dataIndex: 'code',
        key: 'code',
        render: text => <Tooltip length={15} text={text} />,
      },
      {
        title: '设备类型',
        dataIndex: 'category.name',
        key: 'category',
        render: text => <Tooltip length={15} text={text} />,
      },
      {
        title: '电子标签',
        dataIndex: 'qrcode',
        key: 'qrcode',
        render: text => <Tooltip length={15} text={text || replaceSign} />,
      },
      {
        title: '车间',
        dataIndex: 'workshop',
        width: 150,
        key: 'workshop',
        render: workshop => <Tooltip length={15} text={(workshop && workshop.name) || replaceSign} />,
      },
      {
        title: '制造商',
        dataIndex: 'manufacturer.name',
        key: 'manufacturer',
        render: text => <Tooltip length={15} text={text || replaceSign} />,
      },
      {
        title: '操作',
        dataIndex: 'id',
        key: 'id',
        render: id => (
          <div>
            <Link to={`${location.pathname}/detail/module/${id}`}>详情</Link>
          </div>
        ),
      },
    ];
  };

  handleChangeStrategyStatus = status => {
    this.setState({ strategyLoding: status });
  };

  getStrategyColumns = () => {
    const { intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    return [
      {
        title: '策略号/策略名称',
        dataIndex: 'strategyTitle',
        fixed: 'left',
        width: 150,
        render: (strategyTitle, record) => (
          <Tooltip text={`${record.strategyCode}/${strategyTitle}` || replaceSign} length={20} />
        ),
      },
      {
        title: '策略描述',
        dataIndex: 'strategyDescription',
        width: 180,
        render: strategyDescription => <Tooltip text={strategyDescription || replaceSign} length={20} />,
      },
      {
        title: '策略开始时间',
        dataIndex: 'strategyStartTime',
        width: 180,
        render: strategyStartTime => {
          return strategyStartTime ? moment(strategyStartTime).format('YYYY/MM/DD HH:mm') : replaceSign;
        },
      },
      {
        title: '策略结束时间',
        dataIndex: 'strategyEndTime',
        width: 180,
        render: strategyEndTime => {
          return strategyEndTime ? moment(strategyEndTime).format('YYYY/MM/DD HH:mm') : replaceSign;
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
        width: 180,
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
        title: '上次执行时间',
        dataIndex: 'lastExecutionTime',
        width: 180,
        render: lastExecutionTime => {
          return lastExecutionTime ? moment(lastExecutionTime).format('YYYY/MM/DD HH:mm') : replaceSign;
        },
      },
      {
        title: '操作',
        fixed: 'right',
        key: 'operation',
        width: 160,
        render: (_, record) => {
          const { data } = this.state;
          const { type } = this.props;
          const { enabled, strategyTriggerType, strategyCategory, strategyStartTime, strategyEndTime } = record;
          return (
            <div>
              <Link
                style={{ marginRight: 20 }}
                onClick={() => {
                  openModal(
                    {
                      title: '策略详情',
                      width: 600,
                      children: <StrategyDetailModal strategy={record} />,
                      footer: null,
                    },
                    this.context,
                  );
                }}
              >
                查看
              </Link>
              {haveAuthority(auth.WEB_ENABLE_TASK_STRATEGY) || haveAuthority(auth.WEB_DISABLE_TASK_STRATEGY) ? (
                <Link
                  style={{ marginRight: 20 }}
                  disabled={data.enableStatus === 3}
                  onClick={() => {
                    if (enabled !== 0) {
                      const params = { strategyCode: record.strategyCode };
                      this.setState({ strategyLoding: true });
                      if (type === 'module') {
                        disableEquipModuleStrategy(data.id, params).then(() => {
                          record.enabled = 0;
                          this.handleChangeStrategyStatus();
                          this.setState({ strategyLoding: false });
                        });
                      } else {
                        disableEquipProdStrategy(data.id, params).then(() => {
                          record.enabled = 0;
                          this.handleChangeStrategyStatus();
                          this.setState({ strategyLoding: false });
                        });
                      }
                    } else if (strategyTriggerType !== 5) {
                      openModal(
                        {
                          title: '编辑策略',
                          width: 600,
                          children: (
                            <EnableStrategyModal
                              id={data.id}
                              strategy={record}
                              handleChangeStrategyStatus={this.handleChangeStrategyStatus}
                              data={data}
                              type={type}
                              fetchData={this.fetchData}
                            />
                          ),
                          footer: null,
                        },
                        this.context,
                      );
                    } else {
                      const enableStrategy = type === 'module' ? enableEquipModuleStrategy : enableEquipProdStrategy;
                      this.setState({ strategyLoding: true });
                      enableStrategy(data.id, { updateStrategyBase: true, strategyCode: record.strategyCode }).then(
                        () => {
                          this.setState({ strategyLoding: false });
                          record.enabled = 1;
                          record.lastExecutionTime = Date.parse(moment());
                        },
                      );
                    }
                  }}
                >
                  {enabled !== 0 ? '停用' : '启用'}
                </Link>
              ) : null}
              {strategyTriggerType !== 1 && strategyTriggerType !== 2 ? (
                <Link
                  disabled={
                    enabled === 0 ||
                    data.enableStatus === 3 ||
                    (strategyEndTime && strategyEndTime < Date.parse(moment())) ||
                    (strategyStartTime && strategyStartTime > Date.parse(moment()))
                  }
                  onClick={() => {
                    this.setState({ strategyLoding: true });
                    const createTask =
                      type === 'module' ? CreateEquipMoudleTaskByStrategy : CreateEquipProdTaskByStrategy;
                    createTask(data.id, { strategyCode: record.strategyCode }).then(res => {
                      this.setState({ strategyLoding: false });
                      message.success(
                        changeChineseTemplateToLocale('创建成功！任务号为{taskCode}', {
                          taskCode: res.data && res.data.data,
                        }),
                      );
                    });
                  }}
                >
                  手动执行
                </Link>
              ) : null}
            </div>
          );
        },
      },
    ];
  };

  getLogColumns = () => [
    {
      title: '时间',
      dataIndex: 'createdAt',
      width: 200,
      render: time => formatUnixMoment(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    { title: '日志类型', width: 200, dataIndex: 'logTypeDisplay' },
    { title: '操作人', width: 200, dataIndex: 'operator.name' },
    {
      title: '描述',
      dataIndex: 'description',
      render: data => <Tooltip text={data || replaceSign} length={40} />,
    },
    {
      title: '详情',
      key: 'detail',
      width: 100,
      render: (_, record) => {
        const { taskSnapshot } = record;
        let taskType = '';
        let taskCode = '';
        if (taskSnapshot) {
          const { taskCategory } = taskSnapshot;
          taskCode = taskSnapshot.taskCode;
          taskType = taskSnapshot.taskCategory === 'maintain' ? 'maintenanceTask' : `${taskSnapshot.taskCategory}Task`;
        }
        return (
          <div>
            {taskSnapshot ? <Link to={`/equipmentMaintenance/${taskType}/detail/${taskCode}`}>查看</Link> : null}
          </div>
        );
      },
    },
  ];

  renderSparePartsContent = () => {
    const { match, form, type, intl } = this.props;
    const {
      params: { deviceId, moduleId },
    } = match;
    const id = type === 'module' ? moduleId : deviceId;
    const { getFieldDecorator, getFieldValue } = form;
    const { spareParts, loading } = this.state;
    const _spareParts = _.cloneDeep(spareParts);
    const bindSpareParts = type === 'module' ? bindMoudleSpareParts : bindDeviceSpareParts;
    const unbindSpareParts = type === 'module' ? unbindMoudleSpareParts : unbindDeviceSpareParts;

    return (
      <Spin spinning={loading}>
        <div style={{ margin: '0 20px 20px 20px' }}>
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
                      unbindSpareParts({ id, code: value.key }).then(() => {
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
                      bindSpareParts({ id, code: value.key })
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
          <Link
            className={styles.item}
            style={{ borderTop: 'transparent', marginBottom: 20, cursor: 'pointer', width: '100%' }}
            onClick={() => {
              spareParts.push({ code: _.uniqueId('spareParts') });
              this.setState({ spareParts });
            }}
            icon={'plus-circle-o'}
          >
            添加一行
          </Link>
        </div>
      </Spin>
    );
  };

  getBoundMoulds = ({ mouldName, mouldCode, mouldQrcode }, index) => {
    const name = mouldName ? `模具名称${mouldName}` : '';
    const code = mouldCode ? `/模具编码${mouldCode}` : '';
    const qrcode = mouldQrcode ? `/电子标签${mouldQrcode}` : '';
    const display = `${name}${code}${qrcode}`;
    return index === 0 ? display : `、${display}`;
  };

  renderBaseInfo = () => {
    const {
      id,
      type,
      history: { push },
      intl,
    } = this.props;
    const { data } = this.state;
    const list = [
      {
        title: '图片',
        dataIndex: 'pictureFile',
        render: picture =>
          picture ? <ImagePreview url={picture.id} filename={picture.original_filename} /> : replaceSign,
      },
      { title: '类型', dataIndex: 'category.name' },
      {
        title: '名称',
        dataIndex: 'name',
        render: (text, data) => (
          <React.Fragment>
            {text}
            {data.maintainStatus === 2 && <span className="error-tag">维护停用</span>}
          </React.Fragment>
        ),
      },
      {
        title: '编码',
        dataIndex: 'code',
        render: text => {
          return (
            <div style={{ display: 'flex', justifyContent: 'unset' }}>
              {this.state.deviceCode || text || replaceSign}
              <Link
                style={{ float: 'right', marginRight: 20, marginLeft: 30 }}
                onClick={() => {
                  OpenModal(
                    {
                      title: '编码变更',
                      children: (
                        <EditDeviceCode
                          targetId={id}
                          editCode={deviceCode => {
                            this.setState({ deviceCode });
                          }}
                          targetType={type}
                          initialValue={this.state.deviceCode || text}
                        />
                      ),
                      footer: null,
                    },
                    this.context,
                  );
                }}
              >
                编辑
              </Link>
            </div>
          );
        },
      },
      { title: '外部ID', dataIndex: 'outerId' },
      { title: '电子标签', dataIndex: 'qrcode' },
      { title: '车间', dataIndex: 'workshop.name' },
      { title: '制造商', dataIndex: 'manufacturer.name' },
      { title: '型号', dataIndex: 'model' },
      { title: '序列号', dataIndex: 'serialNumber' },
      { title: '规格描述', dataIndex: 'description' },
      {
        title: '出厂日期',
        dataIndex: 'deliverDate',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD'),
      },
      {
        title: '入厂日期',
        dataIndex: 'admitDate',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD'),
      },
      {
        title: '首次启用日期',
        dataIndex: 'firstEnableDate',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD'),
      },
      {
        title: '更新日期',
        dataIndex: 'updatedAt',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        render: time => time && formatUnixMoment(time).format('YYYY-MM-DD HH:mm:ss'),
      },
      {
        title: '附件',
        dataIndex: 'attachmentsFile',
        render: file => (file ? <div style={{ width: 350 }}>{Attachment.AttachmentFile(file)}</div> : replaceSign),
      },
    ];
    const menu = (
      <Menu
        onClick={({ item, key }) => {
          push(
            `/equipmentMaintenance/${key}/create?targetType=${
              type === 'module' ? 'equipmentModule' : 'equipmentProd'
            }&targetId=${id}&targetName=${encodeURIComponent(data.name)}&categoryId=${data.category.id}`,
          );
        }}
      >
        <Menu.Item key="repairTask" auth={auth.WEB_CREATE_REPAIR_TASK}>
          {changeChineseToLocale('维修任务', intl)}
        </Menu.Item>
        {/* <Menu.Item key="maintenanceTask" auth={auth.WEB_CREATE_MAINTAIN_TASK}>
          保养任务
        </Menu.Item>
        <Menu.Item key="checkTask" auth={auth.WEB_CREATE_CHECK_TASK}>
          点检任务
        </Menu.Item> */}
      </Menu>
    );

    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer
          contentStyle={{ width: 880 }}
          itemHeaderTitle={'基本信息'}
          action={
            <Link
              icon="edit"
              to={`${location.pathname}/edit/${type}/${id}?workshop=${data && JSON.stringify(data.workshop)}`}
              style={{ marginRight: 20 }}
              auth={auth.WEB_EDIT_EQUIPMENT}
            >
              编辑
            </Link>
          }
        >
          {_.get(data, 'enableStatus', 3) !== 3 && (
            <div className={styles.basicOperation}>
              <Dropdown overlay={menu}>
                <Button icon="plus-circle-o" icon={'down'}>
                  创建任务
                </Button>
              </Dropdown>
            </div>
          )}
          {data &&
            list.map(({ title, dataIndex, render }) => {
              const desc = _.get(data, dataIndex);
              return (
                <Row style={{ marginRight: 20 }}>
                  <Col type={'title'}>{title}</Col>
                  <Col style={colStyle} type={'content'}>
                    {(typeof render === 'function' ? render(desc, data) : desc) || replaceSign}
                  </Col>
                </Row>
              );
            })}
        </DetailPageItemContainer>
      </div>
    );
  };

  renderDeviceModule = () => {
    const { id, type, intl } = this.props;
    const { data, moduleDataSource } = this.state;
    const isIdle = data.enableStatus === DEVICE_STATUS.DEVICE_IDLE;

    return (
      <div>
        {type !== 'module' && (
          <React.Fragment>
            <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
              <DetailPageItemContainer contentStyle={{ width: 880 }} itemHeaderTitle={'启用状态'}>
                <Row style={{ marginRight: 20 }}>
                  <Col type={'title'}>{'启用状态'}</Col>
                  <Col style={colStyle} type={'content'}>
                    <span className={styles.desc} style={{ flex: 'none' }}>
                      {changeChineseToLocale(DEVICE_ENABLE_STATUS[data.enableStatus], intl)}
                    </span>
                    {data.enableStatus !== DEVICE_STATUS.DEVICE_SCRAPPED && (
                      <span
                        className="switch-close"
                        onClick={() => {
                          const func = isIdle ? enableDevice : disableDevice;
                          this.setState({ loading: true });
                          func(id)
                            .then(() => {
                              message.success(`${isIdle ? '启用' : '闲置'}成功`);
                              data.enableStatus = isIdle ? 2 : 1;
                              this.setState({ data });
                            })
                            .finally(() => {
                              this.setState({ loading: false });
                            });
                        }}
                        style={{
                          marginLeft: 20,
                          backgroundColor: isIdle ? primary : alertYellow,
                          marginRight: 10,
                        }}
                      >
                        {changeChineseToLocale(isIdle ? '启用' : '闲置', intl)}
                      </span>
                    )}
                    {isIdle ? (
                      <Popconfirm
                        title={changeChineseToLocale('设备报废后，将无法重新启用，请确认！', intl)}
                        cancelText={changeChineseToLocale('放弃', intl)}
                        onConfirm={() => {
                          deviceScrap(id)
                            .then(() => {
                              message.success('报废成功');
                              this.setPageDetail();
                            })
                            .catch(() => {
                              this.setState({ scarpPop: true });
                            });
                        }}
                      >
                        <span style={{ marginLeft: 20 }} className="switch-close">
                          {changeChineseToLocale('报废', intl)}
                        </span>
                      </Popconfirm>
                    ) : null}
                  </Col>
                </Row>
              </DetailPageItemContainer>
            </div>
            <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
              <DetailPageItemContainer
                contentStyle={{ display: 'unset' }}
                itemHeaderTitle={'设备组件'}
                action={
                  <Link
                    to={`/equipmentMaintenance/device/add?deviceId=${id}&workshop=${data &&
                      JSON.stringify(data.workshop)}`}
                    icon="plus-circle-o"
                    style={{ float: 'right', marginRight: 20 }}
                  >
                    添加
                  </Link>
                }
              >
                <SimpleTable
                  pagination={!arrayIsEmpty(moduleDataSource) && moduleDataSource.length > 10}
                  dataSource={moduleDataSource}
                  columns={this.getModuleColumns()}
                />
              </DetailPageItemContainer>
            </div>
          </React.Fragment>
        )}
      </div>
    );
  };

  renderDeviceMetric = () => {
    const { data } = this.state;
    const { changeChineseTemplateToLocale } = this.context;
    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer contentStyle={{ display: 'unset' }} itemHeaderTitle={'设备读数'}>
          {_.get(data, 'deviceMetricValues', []).map(n => (
            <Row style={{ marginRight: 20 }}>
              <Col type={'title'}>
                {changeChineseTemplateToLocale('当前{metricName}', {
                  metricName: n.metricName,
                })}
              </Col>
              <Col style={colStyle} type={'content'}>
                {n.metricValue ? `${n.metricValue}${n.metricUnitName}` : replaceSign}
              </Col>
            </Row>
          ))}
        </DetailPageItemContainer>
      </div>
    );
  };

  renderTaskStrategy = () => {
    const { intl } = this.props;
    const { data, taskStrategies } = this.state;
    return (
      <div
        style={{
          ...itemContainerStyle,
          margin: '20px 0',
          paddingBottom: taskStrategies && taskStrategies.length > 10 ? 40 : 0,
        }}
      >
        <DetailPageItemContainer contentStyle={{ display: 'unset' }} itemHeaderTitle={'维护策略'}>
          {taskStrategies && taskStrategies.length ? (
            <div style={{ marginBottom: 20 }}>
              <Spin spinning={this.state.strategyLoding}>
                <Table
                  columns={this.getStrategyColumns(data)}
                  dataSource={Array.isArray(taskStrategies) ? taskStrategies : []}
                  pagination={
                    taskStrategies && taskStrategies.length > 10
                      ? { pageSize: 10, total: taskStrategies.length }
                      : false
                  }
                  scroll={{ x: true }}
                />
              </Spin>
            </div>
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
              {changeChineseToLocale('暂无信息', intl)}
            </div>
          )}
        </DetailPageItemContainer>
      </div>
    );
  };

  renderModuleBind = () => {
    const { boundMoulds } = this.state;
    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer contentStyle={{ width: 880 }} itemHeaderTitle={'模具绑定'}>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>当前模具</Col>
            <Col style={colStyle} type={'content'}>
              {boundMoulds && boundMoulds.length > 0
                ? boundMoulds.map((node, i) => this.getBoundMoulds(node, i))
                : replaceSign}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  renderDeviceValidity = () => {
    const { id, intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { data } = this.state;

    return (
      <div style={itemContainerStyle}>
        <DetailPageItemContainer
          contentStyle={{ display: 'unset' }}
          action={
            <LinkWithAuth
              icon="form"
              style={{ float: 'right', marginRight: 20 }}
              auth={auth.WEB_CHANGE_DEVICE_CALIBRATION_VALID_TIME}
              onClick={() => {
                OpenModal(
                  {
                    title: '配置效期',
                    children: (
                      <EditCalibrationConfigModal
                        deviceId={id}
                        calibrationConfig={data.detail}
                        update={calibrationConfig => {
                          const {
                            calibrationValidEndTime,
                            calibrationRemindTimeUnit,
                            calibrationRemindTimeAmount,
                            calibrationLastValidEndTime,
                          } = calibrationConfig;
                          data.detail = {
                            calibrationValidEndTime,
                            calibrationRemindTimeUnit,
                            calibrationRemindTimeAmount,
                            calibrationLastValidEndTime,
                          };
                          getDeviceLog(id, { page: 1, size: 10 }).then(res => {
                            const { data } = res.data || {};
                            this.setState({ logDataSource: data });
                          });
                          this.setState({ updateCalibrationConfig: true });
                        }}
                      />
                    ),
                    footer: null,
                  },
                  this.context,
                );
              }}
            >
              配置
            </LinkWithAuth>
          }
          itemHeaderTitle={'设备效期'}
        >
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>有效期至</Col>
            <Col style={colStyle} type={'content'}>
              {(data.detail.calibrationValidEndTime &&
                format(data.detail.calibrationValidEndTime, 'YYYY-MM-DD HH:mm')) ||
                replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>上次记录时间</Col>
            <Col style={colStyle} type={'content'}>
              {(data.detail.calibrationLastValidEndTime &&
                format(data.detail.calibrationLastValidEndTime, 'YYYY-MM-DD HH:mm')) ||
                replaceSign}
            </Col>
          </Row>
          <Row style={{ marginRight: 20 }}>
            <Col type={'title'}>提醒时间</Col>
            <Col style={colStyle} type={'content'}>
              {(data.detail.calibrationRemindTimeAmount &&
                changeChineseTemplateToLocale('有效期前{calibrationRemindTimeAmount}{calibrationRemindTimeUnit}提醒', {
                  calibrationRemindTimeAmount: data.detail.calibrationRemindTimeAmount,
                  calibrationRemindTimeUnit: cycle.filter(n => n.key === `${data.detail.calibrationRemindTimeUnit}`)[0]
                    .label,
                })) ||
                replaceSign}
            </Col>
          </Row>
        </DetailPageItemContainer>
      </div>
    );
  };

  renderDeviceClean = () => {
    const { id, intl } = this.props;
    const { data, visible } = this.state;
    const cleanStatus = data.cleanStatus;
    const _cleanConfig = this.state.cleanConfig || data.cleanConfig;
    return (
      <div style={itemContainerStyle}>
        <DetailPageItemContainer
          contentStyle={{ display: 'unset' }}
          itemHeaderTitle={'设备清洁'}
          action={
            <Link
              icon="form"
              style={{ float: 'right', marginRight: 20 }}
              onClick={() => {
                OpenModal(
                  {
                    title: '变更设备清洁配置',
                    children: (
                      <EditCleanConfig
                        deviceId={id}
                        cleanConfig={_cleanConfig}
                        update={cleanConfig => {
                          if (data.cleanInvalidTime && _cleanConfig) {
                            data.cleanInvalidTime = moment(data.cleanInvalidTime)
                              .subtract(_cleanConfig.validPeriod, _cleanConfig.validPeriodUnit)
                              .add(cleanConfig.validPeriod, cleanConfig.validPeriodUnit);
                          }
                          this.setState({ cleanConfig });
                        }}
                      />
                    ),
                    footer: null,
                  },
                  this.context,
                );
              }}
            >
              配置
            </Link>
          }
        >
          {_cleanConfig && _cleanConfig.open ? (
            <React.Fragment>
              <Row style={{ marginRight: 20 }}>
                <Col type={'title'}>当前状态</Col>
                <Col style={colStyle} type={'content'}>
                  {changeChineseToLocale(EQUIPMENT_CLEAN_STATUS[cleanStatus], intl)}
                  <span
                    style={{ color: cleanStatus === WAITFORCLEAN ? primary : error, cursor: 'pointer', marginLeft: 20 }}
                    onClick={() => {
                      this.setState({ visible: true });
                    }}
                  >
                    {changeChineseToLocale(
                      cleanStatus === CLEANED ? EQUIPMENT_CLEAN_STATUS[WAITFORCLEAN] : EQUIPMENT_CLEAN_STATUS[CLEANED],
                      intl,
                    )}
                  </span>
                </Col>
                <CleanStatusConfirmModal
                  cleanStatus={cleanStatus}
                  onVisibleChange={value => {
                    this.setState({ visible: value });
                  }}
                  visible={visible}
                  onConfirm={cleanStatus => {
                    if (cleanStatus === 2) {
                      cleanDevice(id).then(() => {
                        data.cleanStatus = 1;
                        data.lastCleanTime = Date.parse(moment());
                        if (_cleanConfig.validPeriod !== 0) {
                          data.cleanInvalidTime = moment(data.lastCleanTime).add(
                            _cleanConfig.validPeriod,
                            _cleanConfig.validPeriodUnit,
                          );
                        }
                        this.setState({ data });
                      });
                    } else {
                      dirtyDevice(id).then(() => {
                        data.cleanStatus = 2;
                        this.setState({ data });
                      });
                    }
                  }}
                />
              </Row>
              <Row style={{ marginRight: 20 }}>
                <Col type={'title'}>上次清洁时间</Col>
                <Col style={colStyle} type={'content'}>
                  {(data.lastCleanTime && moment(data.lastCleanTime).format('YYYY/MM/DD HH:mm')) || replaceSign}
                </Col>
              </Row>
              {_cleanConfig.validPeriod !== 0 ? (
                <React.Fragment>
                  <Row style={{ marginRight: 20 }}>
                    <Col type={'title'}>清洁效期</Col>
                    <Col style={colStyle} type={'content'}>
                      {`${_cleanConfig.validPeriod}${changeChineseToLocale(
                        _cleanConfig.validPeriodUnit === 'h' ? '小时' : '天',
                        intl,
                      )}`}
                    </Col>
                  </Row>
                  <Row style={{ marginRight: 20 }}>
                    <Col type={'title'}>清洁过期时间</Col>
                    <Col style={colStyle} type={'content'}>
                      {(data.cleanStatus === 1 &&
                        data.cleanInvalidTime &&
                        moment(data.cleanInvalidTime).format('YYYY/MM/DD HH:mm')) ||
                        replaceSign}
                    </Col>
                  </Row>
                </React.Fragment>
              ) : null}
            </React.Fragment>
          ) : (
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              {changeChineseToLocale('暂无配置', intl)}
            </div>
          )}
        </DetailPageItemContainer>
      </div>
    );
  };

  renderDeviceDownTime = () => {
    const { id, type } = this.props;
    const { data } = this.state;
    const downtime = data.downtime;
    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer contentStyle={{ display: 'unset', paddingBottom: 0 }} itemHeaderTitle={'设备停机'}>
          <DeviceDownTime
            setPageDeviceLog={this.setPageDeviceLog}
            handleSubmit={() => {
              this.setState({ updateDownTime: true });
            }}
            data={downtime && downtime.plan}
            type={'plan'}
            deviceId={id}
            equipType={type}
          />
          <DeviceDownTime
            setPageDeviceLog={this.setPageDeviceLog}
            handleSubmit={() => {
              this.setState({ updateDownTime: true });
            }}
            data={downtime && downtime.real}
            type={'actual'}
            deviceId={id}
            equipType={type}
          />
        </DetailPageItemContainer>
      </div>
    );
  };

  renderSpareParts = () => {
    const { id } = this.props;
    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer
          contentStyle={{ display: 'unset' }}
          itemHeaderTitle={'备件关联'}
          action={
            <Link
              icon="bars"
              to={`${location.pathname}/sparePartsChangeLog/${id}`}
              style={{ float: 'right', marginRight: 20 }}
              auth={auth.WEB_EDIT_EQUIPMENT}
            >
              更换记录
            </Link>
          }
        >
          {this.renderSparePartsContent()}
        </DetailPageItemContainer>
      </div>
    );
  };

  renderDeviceLog = () => {
    const { id, type } = this.props;
    const { logDataSource } = this.state;

    return (
      <div style={{ ...itemContainerStyle, margin: '20px 0' }}>
        <DetailPageItemContainer
          itemHeaderTitle={'设备日志'}
          action={
            <Link
              to={`${location.pathname}/devicelog/${type}/${id}`}
              icon="eye-o"
              style={{ float: 'right', marginRight: 20 }}
            >
              查看
            </Link>
          }
        >
          <div style={{ marginBottom: 20, width: '100%' }}>
            <SimpleTable dataSource={logDataSource} columns={this.getLogColumns()} pagination={false} />
          </div>
        </DetailPageItemContainer>
      </div>
    );
  };

  render() {
    const { data, deviceCalibration, loading, equipmentCleanStatus } = this.state;
    const { type } = this.props;
    const mouldBind = (data.category && data.category.mouldBind) || false;

    return (
      <div id="deviceDetail">
        <Spin spinning={loading}>
          {this.renderBaseInfo()}
          {this.renderDeviceModule()}
          {this.renderDeviceMetric()}
          {this.renderTaskStrategy()}
          {mouldBind ? this.renderModuleBind() : null}
          {deviceCalibration === 'true' && data.category && data.category.calibrationConfig && type === 'device'
            ? this.renderDeviceValidity()
            : null}
          {equipmentCleanStatus === 'true' && type === 'device' ? this.renderDeviceClean() : null}
          {this.renderDeviceDownTime()}
          {/* {this.renderSpareParts()} */}
          {this.renderDeviceLog()}
        </Spin>
      </div>
    );
  }
}

DeviceDetail.contextTypes = {
  router: {},
  changeChineseTemplateToLocale: PropTypes.any,
};

export default withForm({}, injectIntl(DeviceDetail));
