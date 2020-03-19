/**
 * @description: 业务类型标签模板编辑页
 *
 * @date: 2019/7/5 下午4:37
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { black } from 'src/styles/color';
import { HorizontalItem } from 'src/components';
import { getBusinessFiles } from 'src/services/electronicTag/template';
import { arrayIsEmpty } from 'src/utils/array';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';

import EditFileTable from './editFileTable';

const Item = HorizontalItem.DetailpageItem;

// 拉取业务类型下的文件
const fetchBusinessFiles = async type => {
  try {
    const res = await getBusinessFiles(type);
    return _.get(res, 'data.data') || {};
  } catch (e) {
    log.error(e);
  }
};

const Edit = (props: { match: any }) => {
  const { match } = props;
  const typeId = _.get(match, 'params.id');

  const [data, setData] = useState([]);

  useEffect(() => {
    fetchBusinessFiles(typeId).then(data => {
      setData(data);
    });
  }, []);

  const { typeName, templates } = data || {};
  return (
    <div style={{ margin: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ color: black, fontSize: 20 }}>标签模板详情</span>
      </div>
      <Item label={'业务类型'} content={typeName} />
      <Item
        label={'物料'}
        content={
          <EditFileTable
            typeName={typeName}
            refetchData={() => {
              fetchBusinessFiles(typeId).then(data => {
                setData(_.cloneDeep(data));
              });
            }}
            typeId={typeId}
            tableData={templates || []}
          />
        }
      />
    </div>
  );
};

Edit.propTypes = {
  style: PropTypes.any,
};

export default Edit;
