import React, { useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'src/utils/time';
import { DetailPageItemContainer, Spin, Table, Tooltip, Link, haveAuthority, openModal, message } from 'src/components';
import { arrayIsEmpty } from 'src/utils/array';
import { getTimeUnitName } from 'views/knowledgeManagement/equipmentModeling/equipmentType/base/formatValue';
import StrategyDetailModal from 'views/equipmentMaintenance/device/strategyDetailModal';
import EnableStrategyModal from 'views/equipmentMaintenance/device/enableStrategyModal';
import {
  disableToolingStrategy,
  createToolingTaskByStrategy,
  enableToolingStrategy,
} from 'services/equipmentMaintenance/base';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import auth from 'utils/auth';
import { replaceSign } from 'constants';
import styles from './styles.scss';

type Props = {
  data: any,
  intl: any,
  fetchToolingOperationLog: () => {},
};

const ToolingStrategy = (props: Props, context) => {
  const { data, fetchToolingOperationLog, intl } = props;
  const [loading, setLoading] = useState(false);
  if (!data) {
    return null;
  }

  const handleChangeStrategyStatus = status => {
    setLoading(status);
    fetchToolingOperationLog();
  };

  const getStrategyColumns = data => {
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
        render: data => {
          return data === 2 ? '保养' : '点检';
        },
      },
      {
        title: '策略方案',
        dataIndex: 'strategyTriggerType',
        width: 110,
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
        width: 180,
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
                    context,
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
                      setLoading(true);
                      disableToolingStrategy(data.id, params).then(() => {
                        record.enabled = 0;
                        fetchToolingOperationLog();
                        setLoading(false);
                      });
                    } else if (strategyTriggerType !== 5) {
                      openModal(
                        {
                          title: '编辑策略',
                          width: 600,
                          children: (
                            <EnableStrategyModal
                              id={data.id}
                              strategy={record}
                              handleChangeStrategyStatus={handleChangeStrategyStatus}
                              data={data}
                              type={'tooling'}
                              fetchData={() => {}}
                            />
                          ),
                          footer: null,
                        },
                        context,
                      );
                    } else {
                      setLoading(true);
                      enableToolingStrategy(data.id, {
                        updateStrategyBase: true,
                        strategyCode: record.strategyCode,
                      }).then(() => {
                        setLoading(false);
                        fetchToolingOperationLog();
                        record.enabled = 1;
                        record.lastExecutionTime = Date.parse(moment());
                      });
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
                    setLoading(true);
                    createToolingTaskByStrategy(data.id, { strategyCode: record.strategyCode }).then(res => {
                      setLoading(false);
                      fetchToolingOperationLog();
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

  const { taskStrategies } = data;

  return (
    <div className={styles.itemContainerStyle}>
      <DetailPageItemContainer contentStyle={{ width: '100%', display: 'block' }} itemHeaderTitle={'维护策略'}>
        {!arrayIsEmpty(taskStrategies) ? (
          <div style={{ marginBottom: 20 }}>
            <Spin spinning={loading}>
              <Table
                columns={getStrategyColumns(data)}
                dataSource={Array.isArray(taskStrategies) ? taskStrategies : []}
                pagination={
                  taskStrategies && taskStrategies.length > 10 ? { pageSize: 10, total: taskStrategies.length } : false
                }
                scroll={{ x: true }}
              />
            </Spin>
          </div>
        ) : (
          <div disabled style={{ width: '100%', display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
            {changeChineseToLocale('暂无信息', intl)}
          </div>
        )}
      </DetailPageItemContainer>
    </div>
  );
};

ToolingStrategy.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default injectIntl(ToolingStrategy);
