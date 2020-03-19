import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {
  Button,
  Link,
  Table,
  Badge,
  Tooltip,
  Popconfirm,
  openModal,
  Checkbox,
  message,
  Radio,
  Icon,
  buttonAuthorityWrapper,
  FormattedMessage,
} from 'src/components';
import { error } from 'styles/color';
import { exportXlsxFile } from 'utils/exportFile';
import { getEbomList, replaceEbomMaterial, ebomBulkUpdateStatus } from 'src/services/bom/ebom';
import { withRouter } from 'react-router-dom';
import { getQuery } from 'src/routes/getRouteParams';
import BatchUpdateMaterial from 'src/containers/eBom/base/batchUpdateMaterial';
import { getWeighingConfig } from 'src/utils/organizationConfig';
import { formatValueForUpdateMaterial, GENERATE_NEW_VERSION } from 'src/containers/eBom/util';
import { Big, getFractionString } from 'src/utils/number';
import { genArr } from 'utils/array';
import moment from 'utils/time';
import EBomPop from 'src/views/bom/eBom/EBomPop';
import styles from 'src/views/bom/eBom/index.scss';
import auth from 'src/utils/auth';
import { getSortParams, ASCEND, COLUMN_KEYS } from 'src/views/bom/eBom/utils';
import { getParams } from 'src/utils/url';
import { replaceSign, chunkSize, maxExportSize } from 'constants';

import ChangeEbomsVersionList from './changeEbomsVersionList';
import ImportModal from '../importEBom/importModal';

const LinkGroup = Link.Group;
const Popiknow = Popconfirm.Popiknow;
const ButtonWithAuth = buttonAuthorityWrapper(Button);
const RadioGroup = Radio.Group;

type props = {
  pagination: {},
};

class EbomTable extends Component<props> {
  state = {
    selectModel: false, // selectModel用来控制ebomList这个组件是否进入可选模式
    tableSelectable: false, // tableSelectable用来控制table是否是可选模式。单独添加这个state是为了做全选的功能
    selectAll: false, // 是否全选
    selectedRowKeys: [], // 选中的ebom的id
    selectedRows: [], // 选中的ebom完整数据
    showBulkOperation: false, // 批量启用停用
  };

  getColumns = () => {
    const { queryObj } = getParams();
    const { isCreatedDesc, isProductCodeDesc, columnKey } = queryObj || {};

    const columns = [
      columnKey === COLUMN_KEYS.code.value
        ? {
            title: '成品物料编号',
            dataIndex: 'productMaterialCode',
            type: 'code',
            width: 200,
            sorter: true,
            sortOrder: isProductCodeDesc === ASCEND ? 'ascend' : 'descend',
            render: text => text || replaceSign,
          }
        : {
            title: '成品物料编号',
            dataIndex: 'productMaterialCode',
            sorter: true,
            width: 200,
            type: 'code',
            render: text => text || replaceSign,
          },
      {
        title: '成品物料名称',
        dataIndex: 'productMaterialName',
        width: 200,
        render: text => text || replaceSign,
      },
      {
        title: '版本号',
        dataIndex: 'version',
        width: 100,
        render: text => text || replaceSign,
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string): React.Node =>
          status === 1 ? <Badge status="success" text="启用中" /> : <Badge status="error" text="停用中" />,
      },
      {
        title: '物料编号/名称',
        dataIndex: 'rawMaterialList',
        width: 400,
        render: (list: any): any => {
          const text = list
            .map(({ material }: any): string => material && `${_.get(material, 'code')}/${_.get(material, 'name')}`)
            .join('、');
          return text;
        },
      },
      columnKey === COLUMN_KEYS.createdAt.value
        ? {
            title: '创建时间',
            dataIndex: 'createdAt',
            sorter: true,
            sortOrder: isCreatedDesc === ASCEND ? 'ascend' : 'descend',
            width: 200,
            render: data => {
              return data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
            },
          }
        : {
            title: '创建时间',
            dataIndex: 'createdAt',
            sorter: true,
            width: 200,
            render: data => {
              return data ? moment(data).format('YYYY/MM/DD HH:mm:ss') : replaceSign;
            },
          },
    ];

    // 批量启用停用的时候不显示操作
    if (!this.state.showBulkOperation) {
      columns.push({
        title: '操作',
        key: 'operator',
        fixed: 'right',
        width: 170,
        render: (data: string, record: any): React.Node => {
          const { status } = record;
          const { fetchData } = this.props;
          return (
            <span className="child-gap" style={{ display: 'flex' }}>
              <Link
                auth={auth.WEB_VIEW_EBOM_DEF}
                onClick={() => {
                  this.context.router.history.push(`/bom/eBom/ebomdetail/${record.id}`);
                }}
              >
                查看
              </Link>
              {status === 1 ? (
                <Popiknow title="已经启用的物料清单不可编辑，请先停用该物料清单。">
                  <Link type="error">编辑</Link>
                </Popiknow>
              ) : (
                <Link
                  auth={auth.WEB_EDIT_EBOM_DEF}
                  onClick={() => {
                    this.context.router.history.push(`/bom/eBom/editebom/${record.id}`);
                  }}
                >
                  编辑
                </Link>
              )}
              <EBomPop
                style={{ display: 'inline-block' }}
                id={record.id}
                enableDom={<Link type="error">停用</Link>}
                disableDom={'启用'}
                status={status}
                ebom={record}
                refetch={fetchData}
              />
            </span>
          );
        },
      });
    }

    return columns;
  };

  getRowSelection = () => {
    const { data } = this.props;
    const { selectedRowKeys, selectModel, tableSelectable, showBulkOperation } = this.state;

    if ((selectModel && tableSelectable) || showBulkOperation) {
      return {
        hideDefaultSelections: true,
        selectedRowKeys,
        fixed: true,
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
    }
    return null;
  };

  toggleModalVisible = (importVisible: boolean) => {
    this.setState({ importVisible });
  };

  // 返回一开始的状态
  returnNormalStatus = async () => {
    const { fetchData } = this.props;
    this.setState({
      selectModel: false, // selectModel用来控制ebomList这个组件是否进入可选模式
      tableSelectable: false, // tableSelectable用来控制table是否是可选模式。单独添加这个state是为了做全选的功能
      selectAll: false, // 是否全选
      selectedRowKeys: [], // 选中的ebom的id
      showChangeVersionTable: false, // 是否展示改变版本号的table
      formValue: null,
      showBulkOperation: false,
    });

    // 如果短时间内重复的修改物料会因为上一个任务没有执行完成而报错。这个时候还是需要重新加载数据
    if (typeof fetchData === 'function') await fetchData({ rawMaterialCodeForExact: null, status: null });
  };

  // 获取选中物料的数量
  getSelectAmount = () => {
    const { selectAll, selectedRowKeys } = this.state;
    const { total } = this.props;

    // 如果全选就返回data的total
    if (selectAll) return total;

    // 如果没有全选就返回选中ebom的长度
    if (Array.isArray(selectedRowKeys)) return selectedRowKeys.length;

    return 0;
  };

  exportData = data => {
    console.log(data);
    const weighingConfig = getWeighingConfig();
    const { materialCustomFields: materialCustomFieldsConfig } = this.state;
    const headers = [
      '成品物料编号',
      '版本号',
      '成品物料数量',
      '成品物料单位',
      '工艺路线编号',
      '物料编号',
      '物料数量',
      '物料单位',
      '耗损率（%）',
      '投料管控（填是或否）',
    ];
    if (weighingConfig) {
      headers.push('需要称量（填是或否）');
    }
    const values = [];
    data.forEach(({ productMaterialCode, version, defNum, unit, currentUnit, rawMaterialList, processRoutingCode }) => {
      const _unit = currentUnit || unit;
      const value = [productMaterialCode, version, defNum, _unit && _unit.name, processRoutingCode];
      rawMaterialList.forEach(rawMaterial => {
        const {
          material: { code, unitName },
          amount,
          amountFraction,
          currentUnit,
          unit,
          lossRate,
          regulatoryControl,
          weight,
        } = rawMaterial;
        const _unit = currentUnit || unit;
        const _lossRate = new Big(lossRate).times(100).valueOf();
        const _amount =
          amountFraction && amountFraction.denominator && amountFraction.numerator
            ? getFractionString(amountFraction)
            : amount;
        const _regulatoryControl = regulatoryControl ? '是' : '否';
        const _weight = weight ? '是' : '否';
        const _value = value.concat([code, _amount, _unit ? _unit.name : unitName, _lossRate, _regulatoryControl]);
        if (weighingConfig) {
          _value.push(_weight);
        }
        values.push(_value);
      });
    });
    exportXlsxFile([headers, ...values], `物料清单导出文件${moment().format('YYYYMMDDHHmmss')}`);
    this.setState({ showBulkOperation: false, selectedRows: [], selectedRowKeys: [], allchecked: false });
  };
  fetchExportData = async pages => {
    const { match } = this.props;
    const _query = getQuery(match);
    const _params = _query;
    if (!_params.version) {
      delete _params.version;
    }
    if (!_params.eBomVersion) {
      delete _params.eBomVersion;
    }
    const res = await Promise.all(
      pages.map(page => {
        return getEbomList({
          ..._params,
          page,
          size: chunkSize,
        });
      }),
    );

    const data = _(res)
      .map(e => e.data.data)
      .flatten()
      .value();

    return data;
  };

  onBulkExport = async () => {
    const { selectedRows, allchecked, total } = this.state;
    let data = selectedRows;
    if (!allchecked && !selectedRows.length) {
      message.error('请选择需要批量导出的物料清单');
      return;
    }
    if (allchecked) {
      if (total > 5000) {
        const options = genArr(total / maxExportSize);
        let exportIndex = 0;
        openModal({
          title: `单次导出不可超过${maxExportSize}条`,
          width: '40%',
          children: (
            // openModal 会去掉第一层div
            <div>
              <div style={{ padding: '20px 40px' }}>
                <div>
                  本次选择了
                  {total}
                  条，请选择欲导出的区段
                </div>
                <RadioGroup defaultValue={0} onChange={e => (exportIndex = e.target.value)}>
                  {options.map(index => (
                    <Radio style={{ display: 'block', marginTop: 10 }} value={index}>
                      {index * maxExportSize + 1}~{Math.min(total, (index + 1) * maxExportSize)}
                    </Radio>
                  ))}
                </RadioGroup>
              </div>
            </div>
          ),
          onOk: async () => {
            this.setState({ loading: true });
            const pages = genArr(
              (Math.min(total, (exportIndex + 1) * maxExportSize) - exportIndex * maxExportSize) / chunkSize,
              (exportIndex * maxExportSize) / chunkSize + 1,
            );
            data = await this.fetchExportData(pages).finally(e => this.setState({ loading: false }));
            this.exportData(data);
          },
        });
        return;
      }
      this.setState({ loading: true });

      const pages = genArr(total / chunkSize, 1);
      data = await this.fetchExportData(pages).finally(e => this.setState({ loading: false }));
    }
    this.exportData(data);
  };

  // 批量修改物料header
  renderSelectModelHeader = () => {
    const { selectedRowKeys, selectAll, formValue } = this.state;
    const buttonStyle = {
      width: 80,
      marginLeft: 10,
    };

    return (
      <div style={{ margin: '0px 0px 10px 20px' }}>
        <Checkbox
          style={{ display: 'inline-block' }}
          onChange={e => {
            const value = e.target.checked;
            // 全选的时候不可以在table中勾选
            this.setState({ selectAll: value, tableSelectable: !value });
          }}
          checked={selectAll} // 保持显示和值的同步
        >
          全选
        </Checkbox>
        <Button
          style={buttonStyle}
          onClick={async () => {
            // 已经选择了物料清单或者全选了物料清单才可以进入改变版本号的页面
            if (!((Array.isArray(selectedRowKeys) && selectedRowKeys.length) || selectAll)) {
              message.warn('请选择物料清单');
              return;
            }

            const { generateNewVersion } = formValue || {};

            // 如果生成新的版本号那么进入版本号改变页面
            if (generateNewVersion === GENERATE_NEW_VERSION.generate) {
              this.setState({ showChangeVersionTable: true });
            } else {
              // 如果不生成新的版本号。那么就直接替换物料
              try {
                await replaceEbomMaterial(
                  formatValueForUpdateMaterial({ ...formValue, ebomIds: selectedRowKeys, checkAll: selectAll }),
                );
              } catch (e) {
                console.log(e);
              } finally {
                await this.returnNormalStatus();
              }
            }
          }}
        >
          确定
        </Button>
        <Button
          style={buttonStyle}
          type={'default'}
          onClick={async () => {
            // 返回一开始的状态
            this.returnNormalStatus();
          }}
        >
          取消
        </Button>
        <FormattedMessage
          defaultMessage={'已选择{amount}个结果'}
          values={{ amount: this.getSelectAmount() }}
          style={{ marginLeft: 10 }}
        />
      </div>
    );
  };

  // 批量操作header
  renderBulkOperationHeader = () => {
    const { selectedRowKeys, selectAll, formValue } = this.state;
    const buttonStyle = {
      width: 80,
      marginLeft: 10,
    };

    return (
      <div style={{ margin: '0px 0px 10px 10px' }}>
        <Button
          style={buttonStyle}
          ghost
          onClick={async () => {
            // 已经选择了物料清单或者全选了物料清单才可以进入改变版本号的页面
            if (!((Array.isArray(selectedRowKeys) && selectedRowKeys.length) || selectAll)) {
              message.warn('请选择物料清单');
              return;
            }

            // 如果不生成新的版本号。那么就直接替换物料
            try {
              const res = await ebomBulkUpdateStatus({ ids: selectedRowKeys, status: 1 });
              const data = _.get(res, 'data.data');
              message.info(data);
            } catch (e) {
              console.log(e);
            } finally {
              await this.returnNormalStatus();
            }
          }}
        >
          批量启用
        </Button>
        <Button
          style={buttonStyle}
          ghost
          onClick={async () => {
            // 已经选择了物料清单或者全选了物料清单才可以进入改变版本号的页面
            if (!((Array.isArray(selectedRowKeys) && selectedRowKeys.length) || selectAll)) {
              message.warn('请选择物料清单');
              return;
            }

            // 如果不生成新的版本号。那么就直接替换物料
            try {
              const res = await ebomBulkUpdateStatus({ ids: selectedRowKeys, status: 0 });
              const data = _.get(res, 'data.data');
              message.info(data);
            } catch (e) {
              console.log(e);
            } finally {
              await this.returnNormalStatus();
            }
          }}
        >
          批量停用
        </Button>
        <Button
          style={buttonStyle}
          ghost
          onClick={async () => {
            // 批量导出
            await this.onBulkExport();
          }}
        >
          批量导出
        </Button>
        <Button
          style={buttonStyle}
          type={'default'}
          onClick={async () => {
            await this.returnNormalStatus();
          }}
        >
          取消
        </Button>
        <FormattedMessage
          defaultMessage={'已选择{amount}个结果'}
          values={{ amount: this.getSelectAmount() }}
          style={{ marginLeft: 10 }}
        />
      </div>
    );
  };

  // 正常情况下的header
  renderNormalModelHeader = () => {
    return (
      <div className={styles.ebomListFunc}>
        <ButtonWithAuth
          auth={auth.WEB_CREATE_EBOM_DEF}
          icon="plus-circle-o"
          onClick={() => {
            this.context.router.history.push('/bom/eBom/createebom');
          }}
        >
          创建物料清单
        </ButtonWithAuth>
        <Button
          iconType={'gc'}
          ghost
          style={{ verticalAlign: 'bottom' }}
          icon="piliangcaozuo"
          onClick={() => {
            openModal({
              title: '修改物料',
              children: <BatchUpdateMaterial />,
              footer: null,
              onOk: async value => {
                const { fetchData } = this.props;
                const { materialsNeedToChange, materialsAfterChange } = value || {};

                // 拉取新的数据。停用中的
                if (typeof fetchData === 'function') {
                  await fetchData(
                    {
                      oldMaterialCode: materialsNeedToChange ? materialsNeedToChange.key : null,
                      newMaterialCode: materialsAfterChange ? materialsAfterChange.key : null,
                      status: 0,
                    },
                    true,
                  );
                }

                this.setState({
                  formValue: value,
                  selectModel: true, // selectModel用来控制ebomList这个组件是否进入可选模式
                  tableSelectable: true, // tableSelectable用来控制table是否是可选模式。单独添加这个state是为了做全选的功能
                });
              },
            });
          }}
        >
          批量修改物料
        </Button>
        <Button
          onClick={() => {
            this.setState({ showBulkOperation: true });
          }}
          style={{ marginRight: 20, verticalAlign: 'middle' }}
          iconType="gc"
          icon="piliangcaozuo"
          ghost
        >
          批量操作
        </Button>
        <Button
          ghost
          icon="download"
          onClick={() => {
            this.toggleModalVisible(true);
          }}
        >
          导入
        </Button>
        <Link
          icon="bars"
          onClick={() => {
            this.context.router.history.push('/bom/eBom/loglist');
          }}
        >
          查看导入日志
        </Link>
      </div>
    );
  };

  render() {
    const { data, total, pagination, fetchData, tableUniqueKey } = this.props;
    const {
      importVisible,
      selectModel,
      showChangeVersionTable,
      selectedEbomIds,
      selectedRowKeys,
      selectAll,
      formValue,
      showBulkOperation,
    } = this.state;

    const columns = this.getColumns();

    // 选择table的行
    const rowSelection = this.getRowSelection();

    // 设置key是为了做rowSelection。不可删除
    const _data = Array.isArray(data)
      ? data.map(i => {
          i.key = i.id;
          return i;
        })
      : [];

    if (showChangeVersionTable) {
      return (
        <div>
          <ChangeEbomsVersionList
            formValue={formValue}
            close={success => {
              if (success) {
                this.returnNormalStatus();
              } else {
                this.setState({ showChangeVersionTable: false });
              }
            }}
            ebomIds={selectedRowKeys}
            selectedAllEbom={selectAll}
          />
        </div>
      );
    }

    return (
      <div>
        {selectModel ? this.renderSelectModelHeader() : null}
        {showBulkOperation ? this.renderBulkOperationHeader() : null}
        {!selectModel && !showBulkOperation ? this.renderNormalModelHeader() : null}
        <Table
          tableUniqueKey={tableUniqueKey}
          useColumnConfig
          rowSelection={rowSelection}
          total={total}
          columns={columns}
          dataSource={_data}
          refetch={fetchData}
          dragable
          pagination={pagination}
          loading={this.state.loading}
          // scroll={{ x: 1500 }}
          onChange={(pagination, filters, sorter) => {
            const sortParams = getSortParams(sorter);
            if (typeof fetchData === 'function') {
              fetchData({ page: pagination.current, size: pagination.pageSize, ...sortParams });
            }
          }}
        />
        <ImportModal visible={importVisible} toggleVisible={this.toggleModalVisible} />
      </div>
    );
  }
}

EbomTable.propTypes = {
  style: PropTypes.object,
  data: PropTypes.any,
  total: PropTypes.any,
  fetchData: PropTypes.func,
};

EbomTable.contextTypes = {
  router: PropTypes.any,
};

export default withRouter(EbomTable);
