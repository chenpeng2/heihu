/**
 * @description: 标签模版选择框
 *
 * @date: 2019/7/5 上午11:37
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Cascader } from 'antd';
import _ from 'lodash';

import { getBusinessList, getBusinessFiles } from 'src/services/electronicTag/template';
import log from 'src/utils/log';
import { arrayIsEmpty } from 'src/utils/array';

const TYPE_PREFIX = 'type';
const FILE_PREFIX = 'file';

export const formatValue = v => {
  if (typeof v === 'string') return v.split('-')[1];
  return null;
};

// 拉取业务类型数据
const searchAndFormatTemplatesData = async params => {
  try {
    const res = await getBusinessList(params);
    const data = _.get(res, 'data.data');
    return arrayIsEmpty(data)
      ? []
      : data.map(i => {
          const { typeName, type } = i || {};
          return {
            label: typeName,
            value: `${TYPE_PREFIX}-${type}`,
            isLeaf: false,
          };
        });
  } catch (e) {
    log.error(e);
  }
};

// 拉取业务类型下的文件
const fetchBusinessFiles = async type => {
  try {
    const res = await getBusinessFiles(type);
    const data = _.get(res, 'data.data.templates');
    return arrayIsEmpty(data)
      ? []
      : data.map(i => {
          const { attachmentId, fileName } = i || {};
          return {
            label: fileName,
            value: `${FILE_PREFIX}-${attachmentId}`,
            isLeaf: true,
          };
        });
  } catch (e) {
    log.error(e);
  }
};

const TagTemplateSelect = (props, context) => {
  const [options, setOptions] = useState([]);
  const { changeChineseToLocale } = context;

  useEffect(() => {
    searchAndFormatTemplatesData().then(data => {
      setOptions(data);
    });
  }, []);

  const displayRender = label => {
    if (!Array.isArray(label)) return;
    return label[label.length - 1];
  };

  return (
    <Cascader
      allowClear
      placeholder={changeChineseToLocale('请选择标签模版')}
      options={options || []}
      displayRender={displayRender}
      expandTrigger={'hover'}
      notFoundContent={changeChineseToLocale('没有数据')}
      loadData={selectedOptions => {
        if (!Array.isArray(selectedOptions)) return;
        const targetOption = selectedOptions[selectedOptions.length - 1];
        const { value } = targetOption || {};

        targetOption.loading = true;
        fetchBusinessFiles(formatValue(value))
          .then(data => {
            if (arrayIsEmpty(data)) {
              // 如果没有模板文件。那么父级不可选
              targetOption.disabled = true;
            }
            targetOption.children = data;
            targetOption.loading = false;
            setOptions(_.cloneDeep(options));
          })
          .catch(e => log.error(e));
      }}
      {...props}
    />
  );
};

TagTemplateSelect.propTypes = {
  style: PropTypes.any,
};

TagTemplateSelect.contextTypes = {
  changeChineseToLocale: PropTypes.any,
};

export default TagTemplateSelect;
