/**
 * @description: 业务类型的标签模板详情
 *
 * @date: 2019/7/5 下午4:33
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { Link, HorizontalItem } from 'src/components';
import { black } from 'src/styles/color';
import { getBusinessFiles } from 'src/services/electronicTag/template';
import { arrayIsEmpty } from 'src/utils/array';
import log from 'src/utils/log';
import { replaceSign } from 'src/constants';

import { getEditPageUrl } from '../utils';
import Table from './fileTable';

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

const Detail = (props: { match: any }, context) => {
  const { match } = props;
  const typeId = _.get(match, 'params.id');
  const { changeChineseToLocale } = context;

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
        <span style={{ color: black, fontSize: 20 }}>{changeChineseToLocale('标签模板详情')} </span>
        <Link icon={'edit'} to={getEditPageUrl(typeId)}>
          编辑
        </Link>
      </div>
      <Item label={'业务类型'} content={typeName} />
      <Item label={'物料'} content={<Table tableData={templates || []} />} />
    </div>
  );
};

Detail.propTypes = {
  style: PropTypes.any,
};

Detail.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default Detail;
