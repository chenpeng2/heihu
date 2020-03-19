import React, { useState } from 'react';
import PropTypes from 'prop-types';

import { Link, openModal, Badge, Tooltip, Table as BasicTable } from 'src/components';
import { replaceSign } from 'src/constants';
import { arrayIsEmpty } from 'src/utils/array';
import { primary } from 'src/styles/color';
import auth from 'src/utils/auth';

import Edit from '../edit';
import UpdateState from '../baseComponent/updateStatus';
import { findDefectCategory } from '../util';

const getColumns = fetchFn => {
  return [
    {
      title: '名称',
      width: 150,
      dataIndex: 'name',
      render: data => data || replaceSign,
    },
    {
      title: '状态',
      width: 150,
      dataIndex: 'state',
      render: data => {
        const { name, color } = findDefectCategory(data) || {};
        return <Badge.MyBadge text={name} color={color} />;
      },
    },
    {
      title: '次品项列表',
      dataIndex: 'defectList',
      width: 350,
      render: data => {
        return arrayIsEmpty(data) ? replaceSign : data.map(i => i && i.name).join(',');
      },
    },
    {
      title: '操作',
      width: 150,
      render: (__, record) => {
        const { id, state } = record || {};

        return (
          <div>
            <UpdateState
              id={id}
              stateNow={state}
              cbForUpdateSuccess={() => {
                if (typeof fetchFn === 'function') fetchFn();
              }}
            />
            <Link
              auth={auth.WEB_DEFECT_GROUP_EDIT}
              style={{ color: primary, cursor: 'pointer', marginLeft: 5 }}
              onClick={() => {
                openModal({
                  title: '编辑次品分类',
                  children: (
                    <Edit
                      cbForSuccess={() => {
                        if (typeof fetchFn === 'function') fetchFn();
                      }}
                      id={id}
                    />
                  ),
                  footer: null,
                });
              }}
            >
              编辑
            </Link>
          </div>
        );
      },
    },
  ];
};

const Table = props => {
  const { tableData, refetch, pagination, tableUniqueKey } = props || {};
  const columns = getColumns(refetch);

  return (
    <div>
      <BasicTable
        tableUniqueKey={tableUniqueKey}
        dragable
        pagination={pagination}
        refetch={refetch}
        dataSource={tableData}
        columns={columns}
      />
    </div>
  );
};

Table.propTypes = {
  style: PropTypes.any,
  tableData: PropTypes.any,
  refetch: PropTypes.any,
  pagination: PropTypes.any,
};

export default Table;
