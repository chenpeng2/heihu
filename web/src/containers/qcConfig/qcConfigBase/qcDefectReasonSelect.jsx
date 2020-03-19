import React, { useState, useEffect } from 'react';
import { Select, Spin } from 'src/components';
import log from 'src/utils/log';
import { getQcDefectReasonList } from 'src/services/knowledgeBase/qcModeling/qcDefectReason';

type Props = {
  params: any,
  disabled: Boolean,
  onChange: () => {},
};

const QcDefectReasonSelect = (props: Props) => {
  const { params, disabled, onChange, ...rest } = props;
  const [data, setData] = useState([]);
  const [selectedLength, setSelectedLength] = useState(0);
  const [fetching, setFetching] = useState(false);
  const notFoundContent = fetching ? <Spin size="small" /> : null;

  const fetchQcDefectReasonListData = async search => {
    setFetching(true);
    try {
      const _params = {
        search,
        ...params,
      };
      const {
        data: { data },
      } = await getQcDefectReasonList({
        searchName: params.search,
        ..._params,
      });
      const selectData = data.map(({ id, name }) => ({
        key: id,
        label: name,
      }));
      setData(selectData);
    } catch (e) {
      log.error(e);
    } finally {
      setFetching(false);
    }
  };

  const handleChange = value => {
    if (typeof onChange === 'function') {
      onChange(value);
    }
    setSelectedLength(value.length);
  };

  useEffect(() => {
    fetchQcDefectReasonListData('');
  }, []);

  const selectData = data.slice(0, 19 + selectedLength);

  return (
    <Select
      allowClear
      disabled={disabled}
      labelInValue
      placeholder="请选择"
      onSearch={fetchQcDefectReasonListData}
      notFoundContent={notFoundContent}
      onChange={handleChange}
      {...rest}
    >
      {selectData.map(({ key, label }) => (
        <Select.Option key={key} value={key} title={label}>
          {label}
        </Select.Option>
      ))}
    </Select>
  );
};

export default QcDefectReasonSelect;
