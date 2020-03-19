import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Badge, Popconfirm, Popover } from 'antd';
import { withRouter } from 'react-router-dom';
import { getQuery } from 'src/routes/getRouteParams';
import { exportXlsxFile } from 'utils/exportFile';
import { replaceSign } from 'src/constants';
import { genArr } from 'utils/array';
import moment from 'utils/time';
import { setLocation, getParams } from 'src/utils/url';
import { newline } from 'utils/string';
import {
  openModal,
  Spin,
  Radio,
  Link,
  Checkbox,
  Table,
  Button,
  Icon,
  Tooltip,
  message,
  buttonAuthorityWrapper,
  FormattedMessage,
} from 'src/components';
import { content, primary, error } from 'src/styles/color/index';
import { queryMaterialCustomField, queryMaterialList, updateMaterialStatus } from 'src/services/bom/material';
import FilterForMaterialList, { formatFilterValue } from 'src/containers/material/list/filter';
import log from 'src/utils/log';
import auth from 'src/utils/auth';
import QcConfigDetailModal from 'src/containers/qcConfig/detail/qcConfigDetailModal';
import { getMaterialCheckDateConfig } from 'src/utils/organizationConfig';
import { changeChineseToLocaleWithoutIntl } from 'utils/locale/utils';
import { getTablePageSizeFromLocalStorage } from 'utils/localStorage';
import styles from './styles.scss';
import LinkToCopyMaterial from '../baseComponent/linkToCopyMaterial';
import ImportMaterial from './importMaterial';
import { getSortParams, ASCEND, COLUMN_KEYS } from '../utils';
import MaterialStatus from '../baseComponent/MaterialStatus';

const RadioGroup = Radio.Group;
const chunkSize = 500;
const maxExportSize = 5000;

type Props = {
  viewer: any,
  relay: any,
  match: {},
  children: Element,
};

const ButtonWithAuth = buttonAuthorityWrapper(Button);
const tableUniqueKey = 'MaterialDefinationTableConfig';
class MaterialList extends Component {
  props: Props;
  state = {
    loading: false,
    materialId: '',
    visible: false,
    data: [],
    total: 0,
    failedPromptVisible: false,
    updateMessage: null,
    materialCustomFields: null,
    selectedRowKeys: [],
    selectedRows: [],
  };

  componentDidMount() {
    this.fetchData();
    this.fetchAndSetMaterialCustomFields();
  }

  fetchData = async params => {
    this.setState({ loading: true });
    const pageSize = getTablePageSizeFromLocalStorage(tableUniqueKey);
    const { filter, ...rest } = params || {};
    const { queryObj } = getParams();
    const { filter: lastFilter, ...lastRest } = queryObj || {};

    const nextFilter = { ...lastFilter, ...filter };
    const nextQuery = {
      isCreatedDesc: 1,
      columnKey: COLUMN_KEYS.createdAt.value,
      size: pageSize,
      ...lastRest,
      ...formatFilterValue(nextFilter),
      ...rest,
    };

    setLocation(this.props, {
      isCreatedDesc: 1,
      columnKey: COLUMN_KEYS.createdAt.value,
      size: pageSize,
      ...lastRest,
      filter: nextFilter,
      ...rest,
    });

    await queryMaterialList(nextQuery)
      .then(({ data: { data, count } }) => {
        this.setState({
          data,
          total: count,
          pagination: {
            current: (nextQuery && nextQuery.page) || 1,
            pageSize: (nextQuery && nextQuery.size) || pageSize,
            total: count,
          },
        });
      })
      .catch(e => log.error(e))
      .finally(() => {
        this.setState({
          loading: false,
        });
      });
  };

  fetchAndSetMaterialCustomFields = async () => {
    try {
      const res = await queryMaterialCustomField();
      const materialCustomFields = _.get(res, 'data.data');

      this.setState({
        materialCustomFields,
      });
    } catch (e) {
      log.error(e);
    }
  };

  getColumns = () => {
    const { queryObj } = getParams();
    const { isCreatedDesc, isCodeDesc, columnKey } = queryObj || {};

    let columns = [
      columnKey === COLUMN_KEYS.code.value
        ? {
            title: '编号',
            key: 'code',
            dataIndex: 'code',
            width: 150,
            sorter: true,
            sortOrder: isCodeDesc === ASCEND ? 'ascend' : 'descend',
            render: code => code || replaceSign,
          }
        : {
            title: '编号',
            key: 'code',
            width: 150,
            dataIndex: 'code',
            sorter: true,
            render: code => code || replaceSign,
          },
      {
        title: '名称',
        key: 'name',
        dataIndex: 'name',
        width: 150,
        render: (name, record) => name || replaceSign,
      },
      {
        title: '状态',
        key: 'status',
        dataIndex: 'status',
        width: 100,
        render: (status, record) => {
          const display = status === 1 ? '启用' : '停用';
          return (
            <Popover
              visible={this.state.visible && this.state.materialId === record.code}
              onVisibleChange={visible => {
                this.setState({ visible });
              }}
              overlayStyle={{ width: 116 }}
              trigger="click"
              getPopupContainer={() => document.getElementsByClassName(styles.materialList)[0]}
              content={
                <div style={{ color: content, width: 100 }}>
                  <Icon type={'check-circle'} style={{ color: primary, margin: '0 4px' }} />
                  {this.state.visible && status === 1 ? '启用成功！' : '停用成功！'}
                </div>
              }
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Badge
                  status={status === 1 ? 'success' : 'error'}
                  text={changeChineseToLocaleWithoutIntl(`${display}中`)}
                />
              </div>
            </Popover>
          );
        },
      },
      {
        title: '物料类型',
        key: 'materialTypes',
        dataIndex: 'materialTypes',
        width: 100,
        render: materialTypes =>
          Array.isArray(materialTypes) && materialTypes.length ? materialTypes.map(e => e.name).join(',') : replaceSign,
      },
      {
        title: '单位',
        key: 'unitName',
        width: 80,
        dataIndex: 'unitName',
        render: (text, record) => text || replaceSign,
      },
      {
        title: '规格描述',
        key: 'desc',
        dataIndex: 'desc',
        width: 150,
        render: (desc, record) => desc || replaceSign,
      },
      {
        title: '替代料编号/名称',
        dataIndex: 'replaceMaterialContent',
        width: 150,
        render: data => {
          return data || replaceSign;
        },
      },
      {
        title: '质检方案',
        key: 'qcConfig',
        width: 80,
        render: (__, record) => {
          const inputFactoryQcConfigDetails = record.inputFactoryQcConfigDetails || [];
          const outputFactoryQcConfigDetails = record.outputFactoryQcConfigDetails || [];
          if (inputFactoryQcConfigDetails || outputFactoryQcConfigDetails) {
            const qcConfigs = Array.isArray(inputFactoryQcConfigDetails)
              ? inputFactoryQcConfigDetails.concat(outputFactoryQcConfigDetails)
              : [];

            if (Array.isArray(qcConfigs) && qcConfigs.length) {
              return <QcConfigDetailModal qcConfigDetailData={_.compact(qcConfigs)} />;
            }
          }
          return <span>{replaceSign}</span>;
        },
      },
    ];

    // 自定义字段columns
    const { materialCustomFields } = this.state;
    if (Array.isArray(materialCustomFields)) {
      const customFieldsColumn = materialCustomFields.map(i => {
        const { keyName } = i || {};
        return {
          title: <Tooltip text={keyName} length={20} />,
          key: `customFields-${keyName}`,
          width: 100,
          render: (data, record) => {
            const { materialCustomFields } = record;
            let value = replaceSign;

            if (Array.isArray(materialCustomFields)) {
              materialCustomFields.forEach(j => {
                if (j && j.keyName === keyName) {
                  value = j ? j.keyValue : replaceSign;
                }
              });
            }

            return value || replaceSign;
          },
        };
      });
      columns = columns.concat(customFieldsColumn);
    }

    // 操作。应为要固定在右边。所有需要这么处理。和antd的fixed column的实现有关
    // 创建时间要放在操作前面
    columns = columns.concat([
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
      {
        title: '操作',
        key: 'operation',
        width: 200,
        fixed: 'right',
        render: (text, record) => {
          const { status, code } = record;
          return (
            <div key={`action-${record.code}`} style={{ whiteSpace: 'nowrap' }}>
              <Link
                auth={auth.WEB_VIEW_MATERIAL_DEF}
                style={{ marginRight: 20 }}
                onClick={() => {
                  // restId 实际上是code字段
                  this.context.router.history.push(`/bom/materials/${encodeURIComponent(code)}/detail`);
                }}
              >
                查看
              </Link>
              <Link
                auth={auth.WEB_EDIT_MATERIAL_DEF}
                style={{ marginRight: 20 }}
                onClick={() => {
                  this.context.router.history.push(`/bom/materials/${encodeURIComponent(code)}/edit`);
                }}
              >
                编辑
              </Link>
              <LinkToCopyMaterial materialCode={code} />
              <MaterialStatus {...record} callback={this.fetchData} />
            </div>
          );
        },
      },
    ]);

    return columns;
  };

  exportMaterials = data => {
    console.log('data', data);
    const { materialCustomFields: materialCustomFieldsConfig } = this.state;
    const remark = [
      [
        `填写说明${newline}物料类型：非必填，若填写请填写启用中的物料类型编号，多个时用英文逗号隔开。${newline}替代物料编号：已启用的物料编号，多个时以英文逗号隔开。先进先出：非必填，若填写请填写是或否，若不填写导入后默认为否。${newline}存储有效期：非必填，必须是小于等于 100000 的正整数，单位为天。${newline}预警提前期：非必填，必须是小于等于 100000 的正整数，单位为天，不大于存储有效期。${newline}是否根据任务请料：可填写是或否，若不填写导入后默认为是${newline}转换比例分子：主单位对应的比例${newline}转换比例分母：转换单位对应的比例${newline}入厂规格数量、单位：支持大于0整数和小数；单位可填写范围为物料已添加的主单位以及转换范围。导入时最多可导入5组，若不满5组，请勿删除列。${newline}物料审核日期、审核预警提前期：需启用物料审核才需填写该字段。物料审核日期非必填，若填写，格式固定为yyyy-MM-dd，例如：2019-09-09；审核预警提前期非必填，若填写必须为小于等于 100000 的自然数。${newline}请勿删除该行，可隐藏。`,
      ],
    ];
    let headers = [
      '*物料编号',
      '*物料名称',
      '*主单位',
      '规格描述',
      '存储有效期',
      '预警提前期',
      '*先进先出',
      '物料类型',
      '替代料编号',
      '物料审核日期',
      '审核预警提前期',
      '是否根据任务请料',
      '冻结时间',
      '投料单位',
      '产出单位',
      '入厂单位',
    ];

    headers = headers.concat([
      '转换单位1',
      '转换比例分子1',
      '转换比例分母1',
      '转换单位2',
      '转换比例分子2',
      '转换比例分母2',
      '转换单位3',
      '转换比例分子3',
      '转换比例分母3',
      '转换单位4',
      '转换比例分子4',
      '转换比例分母4',
      '转换单位5',
      '转换比例分子5',
      '转换比例分母5',
      '入厂规格数量1',
      '入厂规格单位1',
      '入厂规格数量2',
      '入厂规格单位2',
      '入厂规格数量3',
      '入厂规格单位3',
      '入厂规格数量4',
      '入厂规格单位4',
      '入厂规格数量5',
      '入厂规格单位5',
    ]);
    // 设置自定义字段
    if (Array.isArray(materialCustomFieldsConfig) && materialCustomFieldsConfig.length) {
      headers = headers.concat(materialCustomFieldsConfig.map(e => e.keyName));
    }
    const values = [];
    data.forEach(
      ({
        code,
        name,
        materialTypes,
        unitName,
        desc,
        replaceMaterialList,
        fifo,
        validTime,
        warningTime,
        unitConversions,
        specifications,
        materialCustomFields,
        checkDate,
        preCheckDays,
        needRequestMaterial,
        frozenTime,
        proUseUnitName,
        proHoldUnitName,
        inputFactoryUnitName,
      }) => {
        let value = [
          code,
          name,
          unitName,
          desc,
          validTime,
          warningTime,
          fifo ? '是' : '否',
          materialTypes.map(e => e.code).join(','),
          replaceMaterialList.join(','),
          checkDate ? moment(checkDate).format('YYYY-MM-DD') : null,
          typeof preCheckDays === 'number' ? preCheckDays : null,
          needRequestMaterial ? '是' : '否',
          frozenTime,
          proUseUnitName,
          proHoldUnitName,
          inputFactoryUnitName,
        ];

        // 转换单位
        const sortedUnitConversions = unitConversions ? unitConversions.sort((a, b) => a.createdAt - b.createdAt) : [];
        for (let i = 0; i < 5; i += 1) {
          const unitConversion = sortedUnitConversions[i];
          if (!unitConversion) {
            value = value.concat('', '', '');
          } else {
            const { slaveUnitName, slaveUnitCount, masterUnitCount } = unitConversion;
            value = value.concat(slaveUnitName, masterUnitCount, slaveUnitCount);
          }
        }

        // 入厂规格
        const sortedSpecifications = specifications ? specifications.sort((a, b) => a.createdAt - b.createdAt) : [];
        for (let i = 0; i < 5; i += 1) {
          const specification = sortedSpecifications[i];
          if (!specification) {
            value = value.concat('', '');
          } else {
            const { numerator, unitName } = specification;
            value = value.concat(numerator, unitName);
          }
        }

        if (Array.isArray(materialCustomFieldsConfig) && materialCustomFieldsConfig.length) {
          materialCustomFieldsConfig.forEach(({ keyName }) => {
            let v = '';

            if (Array.isArray(materialCustomFields)) {
              materialCustomFields.forEach(j => {
                if (j && j.keyName === keyName) {
                  v = j ? j.keyValue : '';
                }
              });
            }
            value.push(v);
          });
        }

        // 自定义字段
        values.push(value);
      },
    );
    exportXlsxFile([remark, headers, ...values], `物料导出文件${moment().format('YYYYMMDDHHmmss')}`);
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
        return queryMaterialList({
          ..._params,
          ...formatFilterValue(_params.filter),
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
      message.error('请选择需要批量导出的物料');
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
            this.exportMaterials(data);
          },
        });
        return;
      }
      this.setState({ loading: true });

      const pages = genArr(total / chunkSize, 1);
      data = await this.fetchExportData(pages).finally(e => this.setState({ loading: false }));
    }
    this.exportMaterials(data);
  };

  renderBulkOperation = () => {
    const { selectedRowKeys, allchecked, total } = this.state;
    const buttonStyle = {
      width: 80,
      marginLeft: 10,
    };
    return (
      <Fragment>
        <Checkbox
          checked={allchecked}
          style={{ display: 'inline-block' }}
          onClick={async e => {
            if (e.target.checked) {
              this.setState({
                allchecked: true,
                // selectedRows: mboms,
                // selectedRowKeys: mboms.map(e => `${e.materialCode}-${e.version}`),
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
        <Button style={buttonStyle} ghost onClick={this.onBulkExport}>
          确定
        </Button>
        <Button
          style={buttonStyle}
          type={'default'}
          onClick={() => {
            this.setState({
              showBulkOperation: false,
              allchecked: false,
              selectedRows: [],
              selectedRowKeys: [],
            });
          }}
        >
          取消
        </Button>
        <FormattedMessage
          defaultMessage={'已选{selectedAmount}个'}
          style={{ margin: '0 5px' }}
          values={{
            selectedAmount: allchecked ? total : selectedRowKeys.length,
          }}
        />
      </Fragment>
    );
  };

  render() {
    const { data, total, loading, showBulkOperation, allchecked, selectedRows: _selectedRows, pagination } = this.state;
    const columns = this.getColumns();

    const rowSelection = {
      selectedRowKeys: this.state.selectedRowKeys,
      getCheckboxProps: record => {
        const res = {};
        if (allchecked) {
          res.disabled = true;
        }
        return res;
      },
      onChange: (selectedRowKeys, selectedRows) => {
        const newSelectedRows = _.pullAllBy(_selectedRows, data, 'code').concat(selectedRows);
        this.setState({
          selectedRowKeys,
          selectedRows: newSelectedRows,
          allchecked: false,
        });
      },
    };

    return (
      <Spin spinning={loading}>
        <FilterForMaterialList fetchData={this.fetchData} />
        <div id="materials_list" className={styles.materialList}>
          <div className={styles.operationLine}>
            {!showBulkOperation ? (
              <Fragment>
                <ButtonWithAuth
                  auth={auth.WEB_CREATE_MATERIAL_DE}
                  icon="plus-circle-o"
                  style={{ marginRight: '20px' }}
                  onClick={() => {
                    this.context.router.history.push('/bom/materials/create');
                  }}
                >
                  创建物料
                </ButtonWithAuth>
                <ImportMaterial />
                <Link
                  icon="eye"
                  style={{ lineHeight: '30px', height: '28px', marginRight: 20 }}
                  onClick={() => {
                    this.context.router.history.push('/bom/materials/logs/import');
                  }}
                >
                  查看导入日志
                </Link>
                <Button
                  icon="upload"
                  ghost
                  onClick={() => {
                    this.setState({ showBulkOperation: true });
                  }}
                >
                  批量导出
                </Button>
              </Fragment>
            ) : (
              this.renderBulkOperation()
            )}
          </div>
          <Table
            tableUniqueKey={tableUniqueKey}
            useColumnConfig
            refetch={this.fetchData}
            pagination={pagination}
            rowSelection={showBulkOperation ? rowSelection : null}
            dataSource={data}
            total={total}
            dragable
            rowKey={record => record.code}
            columns={columns}
            bordered
            onChange={(pagination, filters, sorter) => {
              const sortParams = getSortParams(sorter);
              this.fetchData({ page: pagination.current, size: pagination.pageSize, ...sortParams });
            }}
          />
        </div>
      </Spin>
    );
  }
}

MaterialList.contextTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(MaterialList);
