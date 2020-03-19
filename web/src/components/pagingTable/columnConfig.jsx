// 列配置组件。如果要使用这个组件。需要在columns中加上useColumnConfig: true。这个属性用来确定是否要在列配置中把这个column作为选项
// 盘点记录中有如何使用这个组件的示例

import React, { Component } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Checkbox } from 'antd';
import { injectIntl } from 'react-intl';

import { Row, Hover, Button, Icon, Popover, message } from 'src/components';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import log from 'src/utils/log';
import styles from './styles.scss';

const CheckBoxGroup = Checkbox.Group;

const isNewData = columnConfigs =>
  columnConfigs.length > 0 && columnConfigs.filter(e => e && typeof e !== 'string').length > 0;

const getColumnsProps = ['key', 'dataIndex'];

// 把config中无法set到localstorage的属性去掉
const formatCallbackConfigs = configs => configs.map(({ label, ...rest }) => rest);

const sortAndMergeColumnsByConfigs = (columns, _configs) => {
  const configs = Array.isArray(_configs) ? _configs : [];
  const sortedColumns = columns.sort((a, b) => {
    const { key: aKey, dataIndex: aDataIndex } = a;
    const aKeyPos = configs.findIndex(e => aKey && e.key === aKey);
    const aDataIndexPos = configs.findIndex(e => aDataIndex && e.dataIndex === aDataIndex);
    const aPos = aKeyPos !== -1 ? aKeyPos : aDataIndexPos;
    const { key: bKey, dataIndex: bDataIndex } = b;
    const bKeyPos = configs.findIndex(e => bKey && e.key === bKey);
    const bDataIndexPos = configs.findIndex(e => bDataIndex && e.dataIndex === bDataIndex);
    const bPos = bKeyPos !== -1 ? bKeyPos : bDataIndexPos;
    if (aPos === -1 || bPos === -1) {
      return 0;
    }
    return aPos - bPos;
  });
  return sortedColumns.map(column => {
    const { key, dataIndex, fixed, showAlways } = column || {};
    const keyPos = configs.findIndex(e => key && e.key === key);
    const dataIndexPos = configs.findIndex(e => dataIndex && e.dataIndex === dataIndex);
    let checked = true;
    if (!!fixed || showAlways) {
      return {
        ...column,
        checked,
      };
    }
    if (keyPos !== -1) {
      const keyObj = configs[keyPos];
      if (keyObj.checked === false) {
        checked = false;
      }
    } else if (dataIndexPos !== -1) {
      const dataIndexObj = configs[dataIndexPos];
      if (dataIndexObj.checked === false) {
        checked = false;
      }
    }
    return {
      ...column,
      checked,
    };
  });
};

class ColumnConfig extends Component {
  state = {
    configs: [],
  };

  componentWillMount() {
    const { columns, initialValue = [], cbForChange } = this.props;
    // 检查是否符合列配置的要求
    this.checkColumnKeyAndDataIndexUniq(columns);
    this.mergeColumnsWithConfigs(columns, initialValue, configs => {
      cbForChange(configs);
    });
  }

  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqualWith(nextProps.columns, this.props.columns, (nextColumn, thisColumn) => {
        // 如果key和dataIndex其中有一个变化代表column有变化
        return thisColumn.key === nextColumn.key && thisColumn.dataIndex === nextColumn.dataIndex;
      })
    ) {
      const { columns } = nextProps;
      const { configs } = this.state;
      this.mergeColumnsWithConfigs(columns, configs);
    }
  }

  getTitleWithoutDragline = title => {
    if (typeof title === 'string') {
      return title;
    }
    return React.Children.map(title.props.children, child => {
      const childId = _.get(child, 'props.id');
      if (childId === 'DRAGLINE') {
        return null;
      }
      return child;
    });
  };

  checkColumnKeyAndDataIndexUniq = columns => {
    if (columns.length !== _.uniqBy(columns, e => e.key || e.dataIndex).length) {
      log.error('key || dataIndex 有重复的列');
    }
  };

  mergeColumnsWithConfigs = (columns, configs = [], cb) => {
    let _configs = null;

    // 如果columns中定义了使用columnConfig那么使用
    if (Array.isArray(columns)) {
      const sortedColumns = sortAndMergeColumnsByConfigs(columns, configs);
      _configs = sortedColumns
        .map(i => {
          const { fixed, showAlways, title, dataIndex, key, checked } = i || {};
          if (!(key || dataIndex)) {
            log.error('column缺少key或者dataIndex作为唯一标识');
            return null;
          }
          return {
            fixed,
            disabled: showAlways || !!fixed,
            label: <div style={{ display: 'inline-block' }}>{this.getTitleWithoutDragline(title)}</div>,
            value: key || dataIndex,
            key,
            dataIndex,
            checked,
          };
        })
        .filter(i => i);
    }
    this.setState({ configs: _configs }, () => {
      if (typeof cbForChange === 'function') cb(_configs);
    });
  };

  renderContent = () => {
    const { cbForChange, intl } = this.props;
    const { configs } = this.state;

    // if (!(Array.isArray(configs) && configs.length)) {
    //   return <span>请配置范围</span>;
    // }

    return (
      <div style={{ minWidth: 140 }}>
        <CheckBoxGroup
          style={{ width: '100%' }}
          onChange={value => {
            const _configs = configs.map(({ key, dataIndex, ...rest }) => ({
              ...rest,
              key,
              dataIndex,
              checked: key ? value.indexOf(key) !== -1 : dataIndex && value.indexOf(dataIndex) !== -1,
            }));
            const checkCheckColumnLength = _configs.filter(e => e.checked && !e.fixed).length;
            if (checkCheckColumnLength < 5) {
              message.error('非固定列数量不能少于5个!');
              return;
            }
            this.setState({ configs: _configs }, () => {
              if (typeof cbForChange === 'function') cbForChange(formatCallbackConfigs(_configs));
            });
          }}
          value={configs && configs.filter(e => e.checked).map(e => e.key || e.dataIndex)}
        >
          {configs.map((i, id) => {
            const previousConfig = configs[id - 1];
            const nextConfig = configs[id + 1];
            const { label, key, dataIndex, value, disabled, fixed } = i || {};
            return (
              <Row.AntRow style={{ margin: '5px 0px' }}>
                <Hover
                  style={{ display: 'flex', height: 20, lingHeight: '20px', position: 'relative' }}
                  childrenContainerStyle={{ flex: '1', marginRight: 20 }}
                  hoverComponent={
                    <div style={{ position: 'absolute', right: 10 }}>
                      <span
                        className={`${styles.caret} ${
                          fixed || (previousConfig && previousConfig.fixed) || id === 0 ? styles.disabled : ''
                        }`}
                        onClick={() => {
                          if (fixed || (previousConfig && previousConfig.fixed) || id === 0) {
                            return;
                          }
                          const _configs = _.cloneDeep(configs);
                          _configs[id - 1] = i;
                          _configs[id] = previousConfig;
                          this.setState({ configs: _configs }, () => {
                            if (typeof cbForChange === 'function') cbForChange(formatCallbackConfigs(_configs));
                          });
                        }}
                      >
                        <Icon size={10} type="caret-up" />
                      </span>
                      <span
                        className={`${styles.caret} ${
                          fixed || (nextConfig && nextConfig.fixed) || id === configs.length - 1 ? styles.disabled : ''
                        }`}
                        onClick={() => {
                          if (fixed || (nextConfig && nextConfig.fixed) || id === configs.length - 1) {
                            return;
                          }
                          const _configs = _.cloneDeep(configs);
                          _configs[id + 1] = i;
                          _configs[id] = nextConfig;
                          this.setState({ configs: _configs }, () => {
                            if (typeof cbForChange === 'function') cbForChange(formatCallbackConfigs(_configs));
                          });
                        }}
                      >
                        <Icon size={10} style={{ marginTop: -6 }} type="caret-down" />
                      </span>
                    </div>
                  }
                >
                  <Checkbox disabled={disabled} value={value}>
                    {label}
                  </Checkbox>
                </Hover>
              </Row.AntRow>
            );
          })}
        </CheckBoxGroup>
      </div>
    );
  };

  render() {
    const { style, intl } = this.props;
    const ele = document.getElementsByClassName(styles.columnConfigContainer);

    return (
      <div style={style} className={styles.columnConfigContainer}>
        <Popover getPopupContainer={() => ele[0]} trigger="click" content={this.renderContent()} placement={'leftTop'}>
          <Button type={'default'}>
            <Icon type={'liepeizhihui'} iconType={'gc'} />
            <span>{changeChineseToLocale('列配置', intl)}</span>
          </Button>
        </Popover>
      </div>
    );
  }
}

// 需要调用这个方法来过滤column
// 只有useColumnConfig=true时 才调用这个方法 默认所有非固定列都可以选择显示或隐藏
// 想要始终显示某列不允许隐藏时 在设置column选项的时候加上 showAlways: true 即可
export const getTableColumns = (allColumns, columnConfigs) => {
  let res = allColumns;

  // 忽略以前的列配置
  if (Array.isArray(columnConfigs) && isNewData(columnConfigs)) {
    // checked相关的逻辑在sortAndMergeColumnsByConfigs中已经处理了
    res = sortAndMergeColumnsByConfigs(allColumns, columnConfigs).filter(i => i.checked);
  }

  return res;
};

ColumnConfig.propTypes = {
  style: PropTypes.object,
  columns: PropTypes.any,
  initialValue: PropTypes.any, // 初始默认值，用来传localStorage中保存的数据
  cbForChange: PropTypes.any,
  intl: PropTypes.any,
};

export default injectIntl(ColumnConfig);
