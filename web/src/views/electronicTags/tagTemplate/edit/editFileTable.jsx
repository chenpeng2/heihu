/**
 * @description: 业务类型编辑文件表格
 *
 * @date: 2019/7/5 下午6:04
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Radio, Spin, Table, Link, Icon } from 'src/components';
import { replaceSign } from 'src/constants';
import { formatUnix } from 'src/utils/time';
import { deleteTemplate, setDefaultTemplate } from 'src/services/electronicTag/template';
import log from 'src/utils/log';
import { arrayIsEmpty } from 'src/utils/array';
import { middleGrey, error } from 'src/styles/color';

import UploadModal, { UPLOAD_TYPE } from '../uploadModal';

const RadioGroup = Radio.Group;

const getColumns = (options, refetch) => {
  const { setIsLoading, setCurrentData, setModalVisible, setUploadType } = options || {};
  return [
    {
      title: '行序列',
      key: 'seq',
      width: 100,
      render: (__, record, index) => {
        const { defaulted, id } = record || {};
        return (
          <div>
            <Icon
              style={{ cursor: defaulted ? 'not-allowed' : 'pointer' }}
              color={defaulted ? middleGrey : error}
              onClick={async () => {
                // 默认文件无法删除
                if (defaulted) return;

                // 删除文件
                setIsLoading(true);
                try {
                  await deleteTemplate(id);
                  if (typeof refetch === 'function') refetch();
                } catch (e) {
                  log.error(e);
                } finally {
                  setIsLoading(false);
                }
              }}
              type={'minus-circle'}
            />
            <span style={{ marginLeft: 10 }}>{index + 1}</span>
          </div>
        );
      },
    },
    {
      title: '文件名称',
      dataIndex: 'fileName',
      width: 100,
      render: data => data || replaceSign,
    },
    {
      title: '更新时间',
      key: 'updatedAt',
      width: 230,
      render: (__, record) => {
        const { createdAt, updatedAt } = record || {};
        // 第一次上传的时候更新时间是创建时间
        if (updatedAt) return formatUnix(updatedAt);
        if (createdAt) return formatUnix(createdAt);
        return replaceSign;
      },
    },
    {
      title: '更新人',
      width: 160,
      dataIndex: 'operatorName',
      render: data => data || replaceSign,
    },
    {
      width: 200,
      title: '默认模板',
      dataIndex: 'defaulted',
      render: (data, record, index) => {
        const { id } = record;
        return (
          <Radio
            key={`${index}-${data}`}
            onChange={async () => {
              setIsLoading(true);
              try {
                await setDefaultTemplate(id);
                if (typeof refetch === 'function') refetch();
              } catch (e) {
                log.error(e);
              } finally {
                setIsLoading(false);
              }
            }}
            defaultChecked={data}
          >
            是
          </Radio>
        );
      },
    },
    {
      title: '操作',
      width: 100,
      key: 'operation',
      render: (__, record) => {
        return (
          <Link
            onClick={() => {
              setCurrentData(record);
              setUploadType(UPLOAD_TYPE.update.value);
              setModalVisible(true);
            }}
          >
            替换
          </Link>
        );
      },
    },
  ];
};

const footer = cbForAddFile => {
  return (
    <div>
      <Link
        icon="plus-circle-o"
        onClick={() => {
          if (typeof cbForAddFile === 'function') {
            cbForAddFile();
          }
        }}
      >
        上传文件
      </Link>
    </div>
  );
};

const EditFileTable = props => {
  const { tableData, refetchData, typeId, typeName } = props || {};
  const [showModal, setModalVisible] = useState(false);
  const [currentData, setCurrentData] = useState(null);
  const [uploadType, setUploadType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Spin spinning={isLoading}>
      <div>
        <Table
          scroll={{ y: 310, x: true }}
          style={{ margin: 0, maxWidth: 800 }}
          pagination={false}
          dataSource={tableData}
          columns={getColumns(
            {
              setModalVisible,
              setCurrentData,
              setUploadType,
              setIsLoading,
            },
            refetchData,
          )}
          footer={() =>
            footer(() => {
              setUploadType(UPLOAD_TYPE.add.value);
              setModalVisible(true);
            })
          }
          {...props}
        />
        <UploadModal
          typeName={typeName}
          uploadType={uploadType}
          data={currentData}
          refetch={() => {
            if (typeof refetchData === 'function') refetchData();
            // 更新完数据后要重新将数据置空
            setCurrentData(null);
          }}
          closeModal={() => {
            setModalVisible(false);
          }}
          visible={showModal}
          type={typeId}
          maxSize={5}
        />
      </div>
    </Spin>
  );
};

EditFileTable.propTypes = {
  style: PropTypes.any,
};

export default EditFileTable;
