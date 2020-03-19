import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Tooltip, Table, Link, openModal, Icon } from 'src/components';
import { replaceSign } from 'src/constants';
import { borderGrey, error } from 'src/styles/color';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { STRATEGY_TRIGGER_TYPE, STRATEGY_CATEGORY } from 'src/views/equipmentMaintenance/constants';
import moment from 'src/utils/time';
import ConfigModal from './configModal';
import { getTimeUnitName } from './formatValue';
import styles from './styles.scss';

type Props = {
  form: {},
  data: [],
  intl: any,
  type: string,
  deviceMetricIds: [],
  handleStrategySubmit: () => {},
};

class StrategyConfig extends Component {
  props: Props;

  state = {
    config: [],
    deviceMetricIds: [],
  };

  componentDidMount() {
    const { data, type } = this.props;
    if (type === 'edit') {
      this.setState({ config: data });
    }
  }

  componentWillReceiveProps(nextProps) {
    const { deviceMetricIds } = nextProps;
    this.setState({ deviceMetricIds });
  }

  getColumns = () => {
    const { type, intl } = this.props;
    const { changeChineseTemplateToLocale } = this.context;
    const { deviceMetricIds } = this.state;
    return [
      {
        title: type === 'edit' ? '策略号/策略名称' : '策略名称',
        dataIndex: 'strategyTitle',
        width: 150,
        render: (strategyTitle, record) => {
          return (
            <div style={{ display: 'flex' }}>
              {!record.strategyCode ? (
                <Icon
                  type={'minus-circle'}
                  style={{
                    margin: '0 7px',
                    color: error,
                    cursor: 'pointer',
                    lineHeight: '18px',
                    position: 'absolute',
                    left: 4,
                  }}
                  onClick={() => {
                    const { handleStrategySubmit } = this.props;
                    const { config } = this.state;
                    const index = config.findIndex(value => {
                      return value.uid === record.uid;
                    });
                    config.splice(index, 1);
                    handleStrategySubmit(config);
                  }}
                />
              ) : null}
              <Tooltip
                text={
                  `${type === 'edit' ? `${record.strategyCode || replaceSign}/` : ''}${strategyTitle}` || replaceSign
                }
                length={20}
              />
            </div>
          );
        },
      },
      {
        title: '策略描述',
        dataIndex: 'strategyDescription',
        width: 160,
        render: strategyDescription => {
          return <Tooltip text={strategyDescription || replaceSign} length={20} />;
        },
      },
      {
        title: '策略开始时间',
        dataIndex: 'strategyStartTime',
        width: 120,
        render: strategyStartTime => {
          return strategyStartTime ? moment(strategyStartTime).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
        },
      },
      {
        title: '策略结束时间',
        dataIndex: 'strategyEndTime',
        width: 120,
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
        render: (strategyTriggerType, record) => {
          const { strategyTriggerSchema, period: formPeriod } = record;
          const data = `${strategyTriggerType.key || strategyTriggerType}`;
          if (data === '5') {
            return replaceSign;
          } else if (data === '1' || data === '2') {
            const { period, timeUnit } = strategyTriggerSchema || {};
            const { validPeriod, validPeriodUnit } = formPeriod || {};
            const timeUnitName = getTimeUnitName(timeUnit);
            return changeChineseTemplateToLocale('周期：每{period}{timeUnitName}', {
              period: validPeriod || period,
              timeUnitName: changeChineseToLocale((validPeriodUnit && validPeriodUnit.label) || timeUnitName, intl),
            });
          }
          const { metricBaseValue, unit, metricName, metricCompareType } = strategyTriggerSchema || {};
          const { metricUnitName: _metricUnitName, metricName: _metricName } = record.deviceMetric || {};
          if (record.useFormValue) {
            const { metric, metricBaseValue: formMetricBaseValue } = record || {};
            const { metricBaseValue, metricCompareType, unit } = formMetricBaseValue || {};
            return (
              <Tooltip
                text={changeChineseTemplateToLocale(
                  '{metricName}阈值{metricCompareType}{metricBaseValue}{metricUnitName}',
                  {
                    metricName: metric && metric.label,
                    metricCompareType: metricCompareType.label,
                    metricBaseValue,
                    metricUnitName: unit,
                  },
                )}
                width={140}
              />
            );
          }
          return (
            <Tooltip
              text={changeChineseTemplateToLocale(
                '{metricName}阈值{metricCompareType}{metricBaseValue}{metricUnitName}',
                {
                  metricName: metricName || _metricName,
                  metricCompareType: `${metricCompareType}` === '1' ? '≤' : '≥',
                  metricBaseValue,
                  metricUnitName: unit || _metricUnitName,
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
        width: 100,
        render: (_, record, index) => (
          <Link
            onClick={() => {
              openModal({
                title: '配置策略',
                children: (
                  <ConfigModal
                    changeIndex={index}
                    type={'edit'}
                    data={record}
                    deviceMetricIds={deviceMetricIds}
                    changeStrategy={this.changeStrategy}
                  />
                ),
                footer: null,
                onCancel: null,
                width: 680,
              });
            }}
          >
            编辑
          </Link>
        ),
      },
    ];
  };

  changeStrategy = (values, type, changeIndex) => {
    const { handleStrategySubmit } = this.props;
    const { config } = this.state;
    if (type === 'edit') {
      config.forEach((n, index) => {
        if (index === changeIndex) {
          config[index] = values;
          config[index].useFormValue = true;
        }
      });
    } else {
      values.useFormValue = true;
      config.push(values);
    }
    this.setState({ config: _.cloneDeep(config) });
    handleStrategySubmit(config);
  };

  onSubmitScroll = () => {
    const items = document.getElementsByClassName('ant-table-body')[1];
    setTimeout(() => {
      items.scrollTop = items.scrollHeight - parseInt(items.style.maxHeight, 10);
    }, 100);
  };

  render() {
    const { intl } = this.props;
    const { config, deviceMetricIds } = this.state;
    const columns = this.getColumns();
    return (
      <div className={styles.strategyConfig}>
        <Table
          columns={columns}
          dataSource={Array.isArray(config) ? config : []}
          pagination={false}
          scroll={{ x: '130%', y: 230 }}
        />
        <div
          style={{
            height: 46,
            lineHeight: '48px',
            border: `1px solid ${borderGrey}`,
            borderTopWidth: 0,
            margin: '0 20px',
          }}
        >
          <Link
            style={{ marginLeft: 10 }}
            icon={'plus-circle-o'}
            onClick={() => {
              openModal({
                title: '配置策略',
                children: (
                  <ConfigModal
                    onSubmitScroll={this.onSubmitScroll}
                    type={'create'}
                    deviceMetricIds={deviceMetricIds}
                    changeStrategy={this.changeStrategy}
                    intl={intl}
                  />
                ),
                footer: null,
                onCancel: null,
                width: 680,
              });
            }}
          >
            添加维护策略
          </Link>
        </div>
      </div>
    );
  }
}

StrategyConfig.contextTypes = {
  changeChineseTemplateToLocale: PropTypes.any,
};

export default injectIntl(StrategyConfig);
