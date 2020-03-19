import React from 'react';
import _ from 'lodash';
import { Table, Tooltip } from 'components';
import { replaceSign } from 'constants';
import { restCheckItemConfigToDisplay } from 'utils/defects';
import { arrayIsEmpty } from 'utils/array';
import PropTypes from 'prop-types';

import { AQL_CHECK, RATIO_CHECK, CHECKITEM_CHECK, CHECKITEM_CHECKCOUNT_TYPE } from '../../constants';

type Props = {
  checkCountType: Number,
  data: {},
};

/** 质检项列表 */
class QcItemsTable extends React.Component {
  props: Props;
  state = { dataSource: [] };

  componentDidMount() {
    this.formatDataSource();
  }

  componentDidUpdate(prevProps) {
    const { data: oldData } = this.props;
    const { data: newData } = prevProps;
    if (!_.isEqual(oldData, newData)) {
      this.formatDataSource(newData);
    }
  }

  formatDataSource = () => {
    const { data } = this.props;
    const dataSource = arrayIsEmpty(data)
      ? []
      : _.sortBy(
          data.map(qcCheckItemConfig => ({
            ...qcCheckItemConfig,
            logicDisplay: restCheckItemConfigToDisplay(qcCheckItemConfig),
          })),
          'seq',
        );
    this.setState({ dataSource });
  };

  getColumns = () => {
    const { checkCountType } = this.props;
    const { changeChineseToLocale } = this.context;
    let columns = [
      {
        title: changeChineseToLocale('质检项名称'),
        dataIndex: 'checkItem.name',
        width: 150,
        key: 'name',
        render: name => <Tooltip text={name} length={20} />,
      },
      {
        title: changeChineseToLocale('分类'),
        width: 100,
        dataIndex: 'checkItem.group.name',
        key: 'groupName',
        render: name => <Tooltip text={name} length={20} />,
      },
    ];
    // AQL质检
    if (checkCountType === AQL_CHECK) {
      columns = columns.concat([
        {
          title: changeChineseToLocale('检验水平'),
          dataIndex: 'qcAqlConfig.qcAqlInspectionLevelName',
          width: 100,
          key: 'inspectionLevel',
          render: name => <Tooltip text={name || replaceSign} length={20} />,
        },
        {
          title: changeChineseToLocale('接收质量限'),
          width: 100,
          dataIndex: 'qcAqlConfig.qcAqlValue',
          key: 'qcAqlValue',
          render: name => <Tooltip text={name || replaceSign} length={20} />,
        },
      ]);
    }
    if (checkCountType === CHECKITEM_CHECK) {
      columns = columns.concat([
        {
          title: '抽检类型',
          dataIndex: 'checkCountType',
          width: 100,
          key: 'checkCountType',
          render: data => <Tooltip text={data ? CHECKITEM_CHECKCOUNT_TYPE[data] : replaceSign} length={20} />,
        },
        {
          title: '抽检数值',
          width: 180,
          dataIndex: 'checkNums',
          key: 'checkNums',
          render: (checkNums, record) => {
            const { qcAqlInspectionLevelName, qcAqlValue, checkCountType } = record;
            return checkCountType === AQL_CHECK ? (
              qcAqlInspectionLevelName && qcAqlValue ? (
                <div>
                  <div>检验水平：{qcAqlInspectionLevelName}</div>
                  <div>接收质量限：{qcAqlValue}</div>
                </div>
              ) : (
                replaceSign
              )
            ) : (
              <Tooltip
                text={
                  typeof checkNums === 'number'
                    ? checkCountType === RATIO_CHECK
                      ? `${checkNums}%`
                      : checkNums
                    : replaceSign
                }
                length={20}
              />
            );
          },
        },
      ]);
    }
    columns = columns.concat([
      {
        title: changeChineseToLocale('标准'),
        dataIndex: 'logicDisplay',
        key: 'logicDisplay',
        width: 200,
        render: logicDisplay => <Tooltip text={logicDisplay} width={200} />,
      },
      {
        title: changeChineseToLocale('不良原因细分'),
        dataIndex: 'qcDefectConfigs',
        key: 'qcDefectConfigs',
        width: 200,
        render: qcDefectConfigs => (
          <Tooltip
            text={(qcDefectConfigs && qcDefectConfigs.map(n => n.qcDefectReasonName).join('，')) || replaceSign}
            width={200}
          />
        ),
      },
      {
        title: changeChineseToLocale('备注'),
        dataIndex: 'checkItem.desc',
        width: 150,
        key: 'desc',
        render: desc => <Tooltip text={desc} width={150} />,
      },
    ]);
    return columns;
  };

  render() {
    const { data, ...rest } = this.props || {};
    const columns = this.getColumns();
    const { dataSource } = this.state;

    return (
      <Table
        scroll={{ x: true }}
        pagination={false}
        columns={columns}
        dataSource={dataSource}
        style={{ margin: 0 }}
        {...rest}
      />
    );
  }
}

QcItemsTable.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default QcItemsTable;
