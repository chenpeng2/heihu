import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import {
  message,
  Table,
  Checkbox,
  Icon,
  Link,
  Badge,
  OpenImportModal,
  Button,
  Tooltip,
  buttonAuthorityWrapper,
  FormattedMessage,
} from 'src/components';
import { getMboms, importMboms, bulkUpdateMBomStatus } from 'src/services/bom/mbom';
import moment, { formatUnix } from 'utils/time';
import { exportXlsxFile } from 'utils/exportFile';
import UpdateStatus from 'src/containers/mBom/base/updateMBomStatusPopover';
import { getQuery } from 'src/routes/getRouteParams';
import { setLocation } from 'utils/url';
import { genArr } from 'utils/array';
import { replaceSign } from 'src/constants';
import { blacklakeGreen, border } from 'styles/color';
import auth from 'src/utils/auth';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';

import LinkToEditMbom from '../baseComponent/linkToEditMbom';
import LinkToCopyMbom from '../baseComponent/linkToCopyMbom';

import Filter from './filter';

const chunkSize = 100;
const ButtonWithAuth = buttonAuthorityWrapper(Button);
const tableUniqueKey = 'MBomDefinationTableConfig';
const actionRow = {
  borderTop: `1px solid ${border}`,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-start',
  padding: '20px',
};

type Props = {
  viewer: any,
  relay: any,
  children: Element,
  form: {
    getFieldDecorator: () => {},
    getFieldsValue: () => {},
  },
  match: {
    location: {
      query: {
        code: string,
        duration: string,
        remark: string,
      },
    },
  },
};

class MBomList extends Component {
  props: Props;
  state = {
    loading: false,
    data: [],
    selectedRows: [],
    selectedRowKeys: [],
    count: null,
    sortedInfo: null,
    searchParams: {},
  };

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async (params, filter, sorter) => {
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    this.setState({ loading: true });
    const { match } = this.props;
    const _query = getQuery(match);
    const _params = {
      size: pageSize,
      ..._query,
      ...params,
      groupByMaterialCode: false,
    };
    const { field, order } = sorter || {};
    const query = { ..._query, ...params };
    setLocation(this.props, () => query);
    if (!_params.version) {
      delete _params.version;
    }
    if (!_params.eBomVersion) {
      delete _params.eBomVersion;
    }
    const searchParams = {
      ..._params,
      sortField: field,
      sortType: order === 'descend' ? 'DESC' : 'ASC',
    };
    const {
      data: { data, count },
    } = await getMboms(searchParams);
    this.setState({
      data,
      count,
      pagination: {
        current: _params && _params.page,
        pageSize: (_params && _params.size) || pageSize,
        total: count,
      },
      loading: false,
      searchParams,
    });
  };

  getColumns = () => {
    const { multiple } = this.state;
    const sortedInfo = this.state.sortedInfo || {};
    let columns = [
      {
        title: '成品物料编号',
        dataIndex: 'materialCode',
        key: 'materialCode',
        width: 180,
        fixed: 'left',
        render: materialCode => materialCode || replaceSign,
        sorter: true,
      },
      {
        title: '成品物料名称',
        fixed: 'left',
        key: 'materialName',
        width: 180,
        dataIndex: 'materialName',
        render: materialName => materialName || replaceSign,
      },
      {
        title: '版本号',
        dataIndex: 'version',
        key: 'version',
        width: 100,
        render: version => version || replaceSign,
      },
      {
        title: '有效期',
        key: 'date',
        width: 200,
        render: (_, record) => {
          const { validFrom, validTo } = record;
          const getFormatDate = timestamp => {
            if (!timestamp) {
              return '';
            }
            return moment(Number(timestamp)).format('YYYY/MM/DD');
          };
          return validFrom && validTo ? `${getFormatDate(validFrom)}-${getFormatDate(validTo)}` : replaceSign;
        },
      },
      {
        title: '发布状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: status => {
          if (status !== undefined) {
            const _display = status === 1 ? '已发布' : '未发布';
            return <Badge status={status === 1 ? 'success' : 'error'} text={_display} />;
          }
          return replaceSign;
        },
      },
      {
        title: '工艺路线编号',
        dataIndex: 'processRoutingCode',
        key: 'processRoutingCode',
        width: 180,
        render: code => (
          <span>
            <Tooltip text={code || replaceSign} length={14} />
          </span>
        ),
      },
      {
        title: '工序编号／名称',
        dataIndex: 'processList',
        key: 'processNames',
        width: 200,
        render: processList => {
          const processGroupNameArray =
            processList &&
            processList.map(processGroup => {
              if (!processGroup.nodes) {
                return '';
              }
              if (processGroup.nodes.length === 1) {
                const { process } = processGroup.nodes[0];
                return process && `${process.code}/${process.name}`;
              }
              const processNameArray = processGroup.nodes.map(({ process }) => {
                return process && `${process.code}/${process.name}`;
              });
              return `${processGroup.name}（${processNameArray.join('，')}）`;
            });
          return (processGroupNameArray && processGroupNameArray.join('，')) || replaceSign;
        },
      },
      {
        title: '物料清单版本号',
        dataIndex: 'ebomVersion',
        width: 200,
        key: 'ebomVersion',
        render: eBomVersion => eBomVersion || replaceSign,
      },
      {
        title: '物料编号／名称列表',
        dataIndex: 'processList',
        width: 200,
        key: 'materialList',
        render: (processList, record) => {
          let materialArray = [];
          if (processList) {
            processList.forEach(processGroup => {
              if (!processGroup.nodes) {
                return '';
              }
              if (processGroup.nodes.length === 1) {
                const { inputMaterials, outputMaterial } = processGroup.nodes[0];
                if (inputMaterials && inputMaterials.length) {
                  materialArray = materialArray.concat(inputMaterials.filter(e => e.materialCode));
                }
                if (outputMaterial && outputMaterial.materialCode) {
                  materialArray.push(outputMaterial);
                }
              } else {
                const { inputMaterials, outputMaterial } = processGroup;
                if (inputMaterials && inputMaterials.length) {
                  materialArray = materialArray.concat(inputMaterials.filter(e => e.materialCode));
                }
                if (outputMaterial && outputMaterial.materialCode) {
                  materialArray.push(outputMaterial);
                }
                processGroup.nodes.forEach(node => {
                  const { inputMaterials, outputMaterial } = node;
                  if (inputMaterials && inputMaterials.length) {
                    materialArray = materialArray.concat(inputMaterials.filter(e => e.materialCode));
                  }
                  if (outputMaterial && outputMaterial.materialCode) {
                    materialArray.push(outputMaterial);
                  }
                });
              }
            });
          }
          materialArray = materialArray.filter(e => !(e && e.materialCode === record.materialCode));
          return (
            (
              materialArray && materialArray.map(e => `${e.materialCode}/${e.material ? e.material.name : replaceSign}`)
            ).join('，') || replaceSign
          );
        },
      },
      {
        title: '创建时间',
        dataIndex: 'createdAt',
        width: 200,
        key: 'createdAt',
        sorter: true,
        render: createdAt => formatUnix(createdAt),
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        width: 200,
        render: (text, record) => {
          return record.id ? this.renderOperation(record) : null;
        },
      },
    ];
    if (multiple) {
      columns = _.dropRight(columns);
    }
    return columns;
  };

  renderOperation = mBom => {
    const { status, id, restId } = mBom;
    const { router } = this.context;
    const baseStyle = { marginRight: 10, cursor: 'pointer', color: blacklakeGreen };

    return (
      <div>
        <Link
          auth={auth.WEB_VIEW_MBOM_DEF}
          style={baseStyle}
          onClick={() => {
            router.history.push(`/bom/mbom/${id}/detail`);
          }}
        >
          查看
        </Link>
        <LinkToEditMbom status={status} id={id} />
        <LinkToCopyMbom style={{ margin: '0px 10px' }} id={id} />
        <UpdateStatus
          key={id}
          mBom={mBom}
          callback={({ id, status }) => {
            const { data } = this.state;
            const mBom = data.find(e => e.id === id);
            mBom.status = status;
            this.setState({ data });
          }}
          beforeClick={() => this.setState({ loading: true })}
          finallyCallback={() => this.setState({ loading: false })}
        />
      </div>
    );
  };

  onBulkUse = async () => {
    const { selectedRows } = this.state;
    if (!selectedRows.length) {
      message.error('请选择需要批量操作的生产Bom');
      return;
    }
    this.setState({ loading: true });
    // 调用批量发布接口
    const {
      data: { data },
    } = await bulkUpdateMBomStatus({
      ids: selectedRows.map(e => e.id),
      status: 1,
    }).finally(e => this.setState({ loading: false }));
    message.success(data);
    this.setState({ multiple: false, selectedRows: [], selectedRowKeys: [], allchecked: false });
    this.fetchData();
  };

  onBulkStop = async () => {
    const { selectedRows } = this.state;
    if (!selectedRows.length) {
      message.error('请选择需要批量操作的生产Bom');
      return;
    }
    this.setState({ loading: true });
    // 调用批量停用接口
    const {
      data: { data },
    } = await bulkUpdateMBomStatus({
      ids: selectedRows.map(e => e.id),
      status: 0,
    }).finally(e => this.setState({ loading: false }));
    message.success(data);
    this.setState({ multiple: false, selectedRows: [], selectedRowKeys: [], allchecked: false });
    this.fetchData();
  };

  onBulkExport = () => {
    const { selectedRows } = this.state;
    if (!selectedRows.length) {
      message.error('请选择需要批量操作的生产Bom');
      return;
    }
    const headers = ['生产BOM成品物料编号', '生产BOM版本号', '工序序号', '工序名称', '工位编号'];
    const values = [];
    selectedRows.forEach(({ materialCode, version, processList }) => {
      processList.forEach(({ nodes }) => {
        nodes.forEach(({ workstationDetails, process, nodeCode }) => {
          workstationDetails.forEach(({ code }) => {
            values.push([materialCode, version, nodeCode, process.name, code]);
          });
        });
      });
    });
    exportXlsxFile([headers, ...values], `生产BOM导出文件${moment().format('YYYYMMDDHHmmss')}`);
    this.setState({ multiple: false, selectedRows: [], selectedRowKeys: [], allchecked: false });
  };

  renderMultipleActions = () => {
    const { selectedRowKeys, allchecked } = this.state;

    return (
      <div>
        <Checkbox
          checked={allchecked}
          style={{ display: 'inline-block' }}
          onClick={async e => {
            const { searchParams } = this.state;
            if (e.target.checked) {
              this.setState({ loading: true });
              const {
                data: { count },
              } = await getMboms({
                ...searchParams,
                page: 0,
                size: 1,
              });

              const pages = genArr(count / chunkSize, 1);
              const data = await Promise.all(
                pages.map(page => {
                  return getMboms({
                    ...searchParams,
                    page,
                    size: chunkSize,
                  });
                }),
              ).finally(e => this.setState({ loading: false }));
              // 拉回来的数据需要还原成传groupByMaterialCode:true的顺序
              const mboms = _(data)
                .map(e => e.data.data)
                .flatten()
                .sortBy(['materialCode', 'id'])
                .value();
              this.setState({
                allchecked: true,
                selectedRows: mboms,
                selectedRowKeys: mboms.map(({ id }) => id),
              });
            } else {
              this.setState({
                allchecked: false,
                selectedRows: [],
                selectedRowKeys: [],
              });
            }
          }}
        >
          全选
        </Checkbox>
        <Button ghost style={{ margin: '0 5px 10px' }} onClick={this.onBulkUse}>
          批量发布
        </Button>
        <Button ghost style={{ margin: '0 5px 10px' }} onClick={this.onBulkStop}>
          批量停用
        </Button>
        <Button ghost style={{ margin: '0 5px 10px' }} onClick={this.onBulkExport} icon={'upload'}>
          批量导出
        </Button>
        <Button
          type="ghost"
          style={{ margin: '0 5px 10px' }}
          onClick={() => {
            this.selectedStorage = undefined;
            this.setState({
              multiple: false,
              allchecked: false,
              selectedRows: [],
              selectedRowKeys: [],
            });
          }}
        >
          取消
        </Button>
        <FormattedMessage
          style={{ margin: '0 5px' }}
          defaultMessage={'已选{amount}条'}
          values={{ amount: selectedRowKeys.length }}
        />
      </div>
    );
  };

  render() {
    const columns = this.getColumns();
    const { data, count, loading, multiple, pagination } = this.state;

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      getCheckboxProps: record => {
        const res = {};
        if (record.isParent) {
          res.disabled = true;
        }
        return res;
      },
      onChange: (selectedRowKeys, selectedRows) => {
        const { selectedRows: _selectedRows } = this.state;
        const newSelectedRows = _.pullAllBy(_selectedRows, data, 'id').concat(selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows: newSelectedRows,
          allchecked: false,
        });
      },
    };

    return (
      <div id="mbom_list">
        <Filter onFilter={params => this.fetchData(params)} />
        <div style={actionRow}>
          {multiple ? (
            this.renderMultipleActions()
          ) : (
            <Fragment>
              <ButtonWithAuth
                auth={auth.WEB_CREATE_MBOM_DEF}
                style={{ marginRight: 20 }}
                icon="plus-circle-o"
                onClick={() => this.context.router.history.push('/bom/mbom/create')}
              >
                创建生产BOM
              </ButtonWithAuth>
              <Button
                ghost
                style={{ marginRight: 10 }}
                onClick={() => this.setState({ multiple: true })}
                icon="piliangcaozuo"
                iconType={'gc'}
              >
                批量操作
              </Button>
              <Button
                icon="download"
                ghost
                style={{ marginRight: 20 }}
                onClick={() => {
                  OpenImportModal({
                    item: '生产BOM',
                    fileTypes: '.xlsx',
                    logUrl: '/bom/mbom/logs/import',
                    titles: [
                      'materialCode',
                      'version',
                      'defNum',
                      'materialCurrentUnitName',
                      'validFrom',
                      'validTo',
                      'processRoutingCode',
                      'ebomVersion',
                      'bindEBomToProcessRouting',
                      'prepareTime',
                      'prepareTimeCategory',
                      'processNodeCode',
                      'workstations',
                      'inputMaterialCode',
                      'inputAmount',
                      'inputMaterialCurrentUnitName',
                      'outputMaterialCode',
                      'outputAmount',
                      'processProductDesc',
                      {
                        title: 'qcConfigCodes',
                        formatter: data => data && data.split(','),
                      },
                    ],
                    splitKey: ['materialCode', 'version'],
                    listName: 'mboms',
                    fileDataStartLocation: 1,
                    templateUrl:
                      'https://public-template.s3.cn-northwest-1.amazonaws.com.cn/v20190911/%E7%94%9F%E4%BA%A7BOM%E6%A8%A1%E6%9D%BF0911.xlsx',
                    method: importMboms,
                    // splitData: this.splitData,
                    context: this.context,
                    onSuccess: res => {
                      if (sensors) {
                        sensors.track('web_bom_mBom_create', {
                          CreateMode: 'Excel导入',
                          amount: res.success,
                        });
                      }
                      this.fetchData();
                    },
                  });
                }}
              >
                导入
              </Button>
              <Link icon="eye-o" style={{ lineHeight: '30px', height: '28px' }} to={'/bom/mbom/logs/import'}>
                查看导入日志
              </Link>
            </Fragment>
          )}
        </div>
        <Table
          tableUniqueKey={'MBomDefinationTableConfig'}
          useColumnConfig
          dragable
          loading={loading}
          defaultExpandAllRows
          rowSelection={multiple ? rowSelection : null}
          pagination={pagination}
          dataSource={data}
          total={count}
          onChange={({ current, pageSize }, filter, sorter) =>
            this.fetchData({ page: current, size: pageSize }, filter, sorter)
          }
          rowKey="id"
          columns={columns}
        />
      </div>
    );
  }
}

MBomList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(MBomList);
