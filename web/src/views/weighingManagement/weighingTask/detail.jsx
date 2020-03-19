import React, { Component } from 'react';
import _ from 'lodash';

import { queryWeighingTaskDetail } from 'src/services/weighing/weighingTask';
import { DetailPageItemContainer, Row, Col, SimpleTable, Tooltip, Link, PlainText } from 'components';
import { thousandBitSeparator } from 'utils/number';
import { arrayIsEmpty } from 'utils/array';
import { formatDateTime } from 'utils/time';
import { replaceSign } from 'src/constants';
import { grey } from 'src/styles/color';

import WeighingRecordTable from './base/weighingRecordTable';
import RemainWeighingRecordTable from './base/remainWeighingRecordTable';
import {
  WEIGHING_TASK_STATUS,
  EXECUTOR_TYPE_USER,
  WEIGHING_TASK_STATUS_UNREADY,
  WEIGHING_TASK_STATUS_UNSTARTED,
} from '../constants';
import { toWeighingTaskLog } from '../navigation';
import { formatInstructions } from './utils';
import CancelLink from './base/cancelLink';
import EditLink from './base/editLink';

type Props = {};

class WeighingTaskDetail extends Component {
  props: Props;
  state = {
    data: {},
    dataSource: [],
    expandedRowKeys: [],
  };

  componentDidMount = () => {
    this.fetchData();
  };

  fetchData = async params => {
    const id = _.get(this.props, 'match.params.id');

    await queryWeighingTaskDetail({ id, ...params })
      .then(res => {
        const data = _.get(res, 'data.data');
        const { instructions } = data;
        const dataSource = formatInstructions(instructions, false);
        this.setState(
          {
            data,
            dataSource,
          },
          () => {
            this.setExpandedRowKeys(dataSource);
          },
        );
      })
      .catch(err => console.log(err));
  };

  getInstructionColumns = () => {
    return [
      {
        title: '称量顺序',
        key: 'instructionOrder',
        dataIndex: 'instructionOrder',
        indentSize: 20,
        width: 90,
        render: (order, record, index) => {
          const { parentKey } = record;

          if (!parentKey) return null;

          return <div style={{ display: 'inline-block' }}>{index + 1}</div>;
        },
      },
      {
        title: '物料编号 | 物料名称',
        key: 'materialName',
        dataIndex: 'materialName',
        width: 300,
        render: (materialName, record, index) => {
          const { materialCode, projectCode, parentKey } = record;
          const project = parentKey ? '' : `(${projectCode})`;

          return <div>{`${materialCode || replaceSign}/${materialName || replaceSign}${project}`}</div>;
        },
      },
      {
        title: '计划数量',
        key: 'num',
        dataIndex: 'num',
        align: 'right',
        width: 120,
        render: (num, record, index) => {
          const decimal = num.toString().split('.');
          if (_.get(decimal, '[1].length') > 6) {
            num = parseFloat(num).toFixed(6);
          }
          return thousandBitSeparator(num);
        },
      },
      {
        title: '单位',
        key: 'materialUnit',
        dataIndex: 'materialUnit',
        width: 100,
        render: materialUnit => <Tooltip text={materialUnit} length={10} />,
      },
      {
        title: <PlainText style={{ paddingRight: 20 }} text="上限" />,
        key: 'upperLimit',
        dataIndex: 'upperLimit',
        align: 'right',
        width: 120,
        render: amount => <div style={{ paddingRight: 20 }}>{thousandBitSeparator(amount)}</div>,
      },
      {
        title: <PlainText text="下限" style={{ paddingRight: 20 }} />,
        key: 'lowerLimit',
        dataIndex: 'lowerLimit',
        align: 'right',
        width: 120,
        render: amount => <div style={{ paddingRight: 20 }}>{thousandBitSeparator(amount)}</div>,
      },
    ];
  };

  onExpand = (expanded, record) => {
    const { dataSource } = this.state;
    const _dataSource =
      dataSource &&
      dataSource.map(item => {
        const { key, expanded } = item;

        if (record && record.key === key) {
          return {
            ...item,
            expanded: !expanded,
          };
        }
        return item;
      });
    this.setExpandedRowKeys(_dataSource);

    this.setState({ dataSource: _dataSource });
  };

  setExpandedRowKeys = dataSource => {
    const expandedRows = Array.isArray(dataSource) ? dataSource.filter(({ expanded }) => expanded) : [];
    const expandedRowKeys = Array.isArray(expandedRows) ? expandedRows.map(({ key }) => key) : [];

    this.setState({ expandedRowKeys });
  };

  render() {
    const { data, dataSource, expandedRowKeys } = this.state;
    const {
      id,
      code,
      projectCodes,
      productCode,
      materialName,
      ebomVersion,
      workstations,
      status,
      userChooseMode,
      userGroupName,
      executorName,
      planBeginTime,
      planEndTime,
      realBeginTime,
      realEndTime,
      creatorName,
      createdAt,
    } = data || {};
    const detail = [
      {
        title: '任务号',
        data: code,
      },
      {
        title: '生产项目',
        data: _.join(projectCodes, ','),
      },
      {
        title: '成品物料',
        data: `${productCode}/${materialName}`,
      },
      {
        title: '物料清单',
        data: ebomVersion,
      },
      {
        title: '工位',
        data: arrayIsEmpty(workstations) ? null : workstations.map(({ name }) => name).join(','),
      },
      {
        title: '状态',
        data: WEIGHING_TASK_STATUS[status],
      },
      {
        title: '执行人',
        data: status === WEIGHING_TASK_STATUS_UNSTARTED ? executorName : userGroupName,
      },
      {
        title: '计划开始时间',
        data: planBeginTime ? formatDateTime(planBeginTime) : null,
      },
      {
        title: '计划结束时间',
        data: planEndTime ? formatDateTime(planEndTime) : null,
      },
      {
        title: '实际开始时间',
        data: realBeginTime ? formatDateTime(realBeginTime) : null,
      },
      {
        title: '实际结束时间',
        data: realEndTime ? formatDateTime(realEndTime) : null,
      },
      {
        title: '创建人',
        data: creatorName,
      },
      {
        title: '创建时间',
        data: createdAt ? formatDateTime(createdAt) : null,
      },
    ];

    return (
      <div style={{ padding: 20 }}>
        <DetailPageItemContainer
          wrapperStyle={{ marginBottom: 20 }}
          action={
            <div
              style={{
                display: 'flex',
                width: 300,
                justifyContent: 'flex-end',
                alignItems: 'center',
                backgroundColor: grey,
                paddingRight: 20,
              }}
            >
              <EditLink id={id} icon="edit" disabled={[1, 2].indexOf(status) < 0} />
              <CancelLink
                id={id}
                code={code}
                icon="close-circle-o"
                refetch={this.fetchData}
                disabled={[1, 2].indexOf(status) < 0}
              />
              <Link icon="bars" style={{ marginLeft: 20 }} to={toWeighingTaskLog({ id })}>
                操作日志
              </Link>
            </div>
          }
          contentStyle={{ width: '100%', padding: 20 }}
          itemHeaderTitle="称量任务详情"
        >
          {detail.map(({ title, data }) => {
            return (
              <Row>
                <Col type="title">{title}</Col>
                <Col type="content" style={{ width: 920 }}>
                  {data || replaceSign}
                </Col>
              </Row>
            );
          })}
        </DetailPageItemContainer>
        <DetailPageItemContainer
          wrapperStyle={{ marginBottom: 20 }}
          contentStyle={{ width: '100%', padding: 20 }}
          itemHeaderTitle="称量指令"
        >
          <SimpleTable
            style={{ width: '100%', margin: 0 }}
            dataSource={dataSource}
            rowKey={record => record.key}
            expandedRowKeys={expandedRowKeys}
            onExpand={this.onExpand}
            columns={this.getInstructionColumns()}
            pagination={false}
          />
        </DetailPageItemContainer>
        <DetailPageItemContainer
          wrapperStyle={{ marginBottom: 20 }}
          contentStyle={{ width: '100%', padding: 20 }}
          itemHeaderTitle="称量记录"
        >
          <WeighingRecordTable style={{ width: '100%' }} taskId={id} />
        </DetailPageItemContainer>
        <DetailPageItemContainer
          wrapperStyle={{ marginBottom: 20 }}
          contentStyle={{ width: '100%', padding: 20 }}
          itemHeaderTitle="剩余量记录"
        >
          <RemainWeighingRecordTable style={{ width: '100%' }} taskId={id} />
        </DetailPageItemContainer>
      </div>
    );
  }
}

export default WeighingTaskDetail;
