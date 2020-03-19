import React, { useState, useRef } from 'react';
import _ from 'lodash';
import moment, { formatTodayUnderline } from 'utils/time';
import { withRouter } from 'react-router-dom';
import {
  Link,
  Badge,
  Table,
  Spin,
  message,
  openModal,
  Button,
  selectAllExport,
  Checkbox,
  FormattedMessage,
} from 'src/components';
import { replaceSign } from 'src/constants';
import { getQuery } from 'src/routes/getRouteParams';
import {
  createQcDefectRank,
  disabledQcDefectRank,
  enabledQcDefectRank,
  updateQcDefectRank,
  getQcDefectRankList,
} from 'src/services/knowledgeBase/qcModeling/qcDefectRank';
import log from 'src/utils/log';
import { primary } from 'src/styles/color';
import Edit from './edit';
import Create from './create';
import QcDefectRankImportButton from './import/importButton';
import { QCDEFECT_RANK_STATUS, qcDefectRankHeaderDesc, qcDefectRankHeader } from './constants';
import { getFormatSearchParams } from './utils';

type Props = {
  data: any,
  match: any,
  history: any,
  refreshData: () => {},
};

const List = (props: Props) => {
  const { data = {}, match, refreshData, history } = props;
  const query = getQuery(match);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isBatchOperation, setIsBatchOperation] = useState(false);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const editEl = useRef(null);
  const createEl = useRef(null);
  const getColumns = () => {
    return [
      {
        title: '编号',
        width: 200,
        dataIndex: 'code',
        render: code => code || replaceSign,
      },
      {
        title: '名称',
        width: 200,
        dataIndex: 'name',
        render: name => name || replaceSign,
      },
      {
        title: '备注',
        dataIndex: 'remark',
        render: remark => remark || replaceSign,
      },
      {
        title: '状态',
        width: 140,
        dataIndex: 'status',
        render: status =>
          (typeof status === 'number' && (
            <Badge.MyBadge
              color={QCDEFECT_RANK_STATUS[status].color}
              text={`${QCDEFECT_RANK_STATUS[status].label}中`}
            />
          )) ||
          replaceSign,
      },
      {
        title: '操作',
        key: 'action',
        width: 240,
        render: (data, record) => {
          const { status, id } = record;
          const updateQcDefectRankStatus = status ? disabledQcDefectRank : enabledQcDefectRank;
          return (
            <Spin spinning={loading}>
              <React.Fragment>
                <Link
                  style={{ color: primary }}
                  onClick={() => {
                    setLoading(true);
                    updateQcDefectRankStatus(id)
                      .then(() => {
                        message.success(`${status ? '停用' : '启用'}成功`);
                        record.status = status ? 0 : 1;
                        setLoading(false);
                      })
                      .catch(e => {
                        log.error(e);
                        setLoading(false);
                      });
                  }}
                >
                  {status ? '停用' : '启用'}
                </Link>
                <Link
                  style={{ marginLeft: 20 }}
                  onClick={() => {
                    openModal({
                      title: '编辑不良等级',
                      children: <Edit updating={updating} id={id} ref={editEl} />,
                      onOk: () => {
                        const validateFieldsAndScroll = _.get(editEl, 'current.validateFieldsAndScroll');
                        validateFieldsAndScroll((err, values) => {
                          if (err) return null;
                          setUpdating(true);
                          updateQcDefectRank(id, values)
                            .then(() => {
                              message.success('编辑不良等级成功');
                              props.refreshData(query);
                            })
                            .finally(() => {
                              setUpdating(false);
                            });
                        });
                      },
                    });
                  }}
                >
                  编辑
                </Link>
              </React.Fragment>
            </Spin>
          );
        },
      },
    ];
  };

  const formatExportData = data => {
    const _data = data.map(x => {
      const { code, name, remark } = x || {};

      return {
        code,
        name,
        remark,
      };
    });
    return _data.map(x => Object.values(x));
  };

  const handleExport = () => {
    const queryMatch = getQuery(match);
    selectAllExport(
      {
        width: '30%',
      },
      {
        selectedAmount: data.total,
        getExportData: async params => {
          const res = await getQcDefectRankList({ ...getFormatSearchParams(queryMatch), ...params });
          let exportData;
          if (isAllChecked) {
            exportData = _.get(res, 'data.data');
          } else {
            exportData = selectedRows;
          }
          const values = formatExportData(exportData);
          return [qcDefectRankHeaderDesc, qcDefectRankHeader, ...values];
        },
        fileName: `不良等级_${moment().format(formatTodayUnderline())}`,
      },
    );
  };

  const renderExport = () => {
    const total = (data && data.total) || 0;
    return (
      <div style={{ marginLeft: 20 }}>
        {isBatchOperation ? (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 20 }}>
            <Checkbox
              style={{ marginRight: 23 }}
              checked={isAllChecked}
              onChange={e => {
                const checked = e.target.checked;
                setSelectedAmount(checked ? total || 0 : 0);
                setIsAllChecked(checked);
                setSelectedRowKeys([]);
              }}
            >
              全选
            </Checkbox>
            <Button disabled={selectedAmount === 0} style={{ width: 80, height: 28 }} onClick={handleExport}>
              确定
            </Button>
            <Button
              style={{ width: 80, height: 28, margin: '0 20px' }}
              type={'default'}
              onClick={() => {
                setIsBatchOperation(false);
                setIsAllChecked(false);
              }}
            >
              取消
            </Button>
            <FormattedMessage values={{ selectedAmount }} defaultMessage={'已选{selectedAmount}个'} />
          </div>
        ) : (
          <Button
            icon="upload"
            ghost
            onClick={() => {
              setIsBatchOperation(true);
            }}
            disabled={total === 0}
          >
            批量导出
          </Button>
        )}
      </div>
    );
  };

  const handleCreate = () => {
    openModal({
      title: '创建不良等级',
      children: <Create updating={updating} ref={createEl} />,
      onOk: () => {
        const validateFieldsAndScroll = _.get(createEl, 'current.validateFieldsAndScroll');
        validateFieldsAndScroll((err, values) => {
          if (err) return null;
          setUpdating(true);
          createQcDefectRank(values)
            .then(() => {
              message.success('创建不良等级成功');
              refreshData(query);
            })
            .finally(() => {
              setUpdating(false);
            });
        });
      },
      autoClose: false,
    });
  };

  const handleTableChange = pagination => {
    props.refreshData({
      ...query,
      page: pagination && pagination.current,
      size: (pagination && pagination.pageSize) || 10,
    });
  };

  const dataSource = _.get(data, 'data', []);
  const _selectedRows = selectedRows || [];
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      const newSelectedRows = _.pullAllBy(_selectedRows, dataSource, 'id').concat(selectedRows);
      setSelectedRows(newSelectedRows);
      setSelectedRowKeys(selectedRowKeys);
      setSelectedAmount(newSelectedRows.length);
    },
    getCheckboxProps: () => ({
      disabled: isAllChecked,
    }),
    selectedRowKeys,
  };

  const columns = getColumns();
  return (
    <div>
      <div style={{ margin: '20px 0 0 20px', display: 'flex' }}>
        <Button icon="plus-circle-o" onClick={handleCreate}>
          创建不良等级
        </Button>
        {renderExport()}
        <QcDefectRankImportButton history={history} />
      </div>
      <div style={{ marginTop: 20 }}>
        <Table
          columns={columns}
          dataSource={data && Array.isArray(data.data) ? data.data : []}
          total={data && data.total}
          onChange={handleTableChange}
          rowSelection={isBatchOperation ? rowSelection : null}
          rowKey={record => record.id}
        />
      </div>
    </div>
  );
};

export default withRouter(List);
