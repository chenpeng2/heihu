import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Button, Table, Spin, withForm, Input, FilterSortSearchBar, FormattedMessage } from 'src/components';
import useFetch from 'src/utils/hookUtils/fetchHooks';
import { getDefects } from 'src/services/knowledgeBase/defect';
import { replaceSign, BASE_STATUS } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import DefectCategorySearchSelect from 'src/containers/defectCategory/defectCategorySearchSelect';
import { DEFECT_CATEGORY_STATUS } from 'views/knowledgeManagement/defectCategory/util';
import { middleGrey } from 'styles/color';

const { ItemList, Item } = FilterSortSearchBar;

export const formatFilterValue = value => {
  if (!value) return null;

  const { defectGroup, ...rest } = value || {};
  return {
    defectGroupIds: defectGroup ? defectGroup.key : null,
    ...rest,
  };
};

const getColumns = () => {
  return [
    {
      title: '编号',
      dataIndex: 'code',
      render: data => data || replaceSign,
      width: 250,
    },
    {
      title: '名称',
      dataIndex: 'name',
      render: data => data || replaceSign,
      width: 250,
    },
    {
      title: '分类',
      dataIndex: 'defectGroupName',
      render: data => data || replaceSign,
      width: 150,
    },
  ];
};

const DefectsTableSelect = props => {
  const { selectedDefects, onCancel, cbForConfirm, onClose, form } = props || {};
  const { getFieldDecorator, getFieldsValue } = form || {};
  const [searchParams, setSearchParams] = useState({});
  // 拉数据
  const [{ data, isLoading }, setParams] =
    useFetch(async params => {
      const p = {
        ...searchParams,
        ...params,
        status: BASE_STATUS.use.value,
      };
      setSearchParams(p);
      return getDefects(p);
    }) || [];

  // selectedRows
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  useEffect(() => {
    setParams({ page: 1, size: 10 });
  }, []);

  useEffect(() => {
    // 第一次设置初始值选中的时候要设置key
    const _selectedDefects = arrayIsEmpty(selectedDefects)
      ? []
      : selectedDefects
          .map(i => {
            if (i) {
              i.key = i.id;
              return i;
            }
            return null;
          })
          .filter(i => i);
    setSelectedRows(_selectedDefects);
    setSelectedRowKeys(arrayIsEmpty(_selectedDefects) ? [] : selectedDefects.map(i => i && i.id).filter(i => i));
  }, [selectedDefects]);

  const { data: tableData, count: total, page, size } = _.get(data, 'data') || {};

  const _tableData = arrayIsEmpty(tableData)
    ? []
    : tableData.map(i => {
        i.key = i && i.id;
        return i;
      });

  const rowSelections = {
    selectedRowKeys,
    onChange: (selectedRowKeys, _selectedRows) => {
      const newSelectedRows = _.pullAllBy(selectedRows, _tableData, 'key').concat(_selectedRows);
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(newSelectedRows);
    },
  };

  return (
    <Spin spinning={isLoading}>
      <div>
        <div style={{ display: 'flex', margin: '0px 20px', border: 'none' }}>
          <ItemList>
            <Item wrapperStyle={{ padding: 0 }} label={'名称'}>
              {getFieldDecorator('search')(<Input />)}
            </Item>
            <Item wrapperStyle={{ padding: 0 }} label={'分类'}>
              {getFieldDecorator('defectGroup')(
                <DefectCategorySearchSelect params={{ status: DEFECT_CATEGORY_STATUS.inUse.value }} />,
              )}
            </Item>
          </ItemList>
          <Button
            icon="search"
            onClick={() => {
              setParams({ ...formatFilterValue(getFieldsValue()), size: 10, page: 1 });
            }}
          >
            查询
          </Button>
          <FormattedMessage
            defaultMessage={'重置'}
            style={{ color: middleGrey, margin: '0px 10px', lineHeight: '28px', cursor: 'pointer' }}
            onClick={() => {
              form.resetFields();
              setParams({ ...formatFilterValue(getFieldsValue()), page: 1 });
            }}
          />
        </div>
        <Table
          refetch={setParams}
          total={total}
          rowSelection={rowSelections}
          scroll={{ y: 220 }}
          columns={getColumns()}
          dataSource={_tableData}
        />
        <div style={{ display: 'inline-block', position: 'relative', left: 20, top: 20 }}>
          <FormattedMessage
            defaultMessage={'已选{amount}条'}
            values={{ amount: arrayIsEmpty(selectedRowKeys) ? 0 : selectedRowKeys.length }}
          />
        </div>
        <div style={{ marginTop: 60, display: 'flex', justifyContent: 'center' }}>
          <Button
            type="default"
            onClick={() => {
              if (typeof onCancel === 'function') onCancel();
            }}
            style={{ width: 110 }}
          >
            取消
          </Button>
          <Button
            type={'primary'}
            style={{
              width: 110,
              marginLeft: 10,
            }}
            onClick={() => {
              cbForConfirm(selectedRows);
              if (typeof onClose === 'function') onClose();
            }}
          >
            确定
          </Button>
        </div>
      </div>
    </Spin>
  );
};

DefectsTableSelect.propTypes = {
  style: PropTypes.any,
  onCancel: PropTypes.any,
  cbForConfirm: PropTypes.any,
  onClose: PropTypes.any,
  selectedDefects: PropTypes.any,
};

export default withForm({}, DefectsTableSelect);
