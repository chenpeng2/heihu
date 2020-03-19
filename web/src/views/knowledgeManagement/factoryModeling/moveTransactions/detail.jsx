import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { FormItem, Spin } from 'src/components';
import { getMoveTransactionDetail } from 'src/services/knowledgeBase/moveTransactions';
import { replaceSign } from 'src/constants';
import log from 'src/utils/log';
import { findModuleNameByValue } from './constants';

type Props = {
  match: any,
};

const Detail = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const { match } = props;

  const fetchData = async () => {
    setLoading(true);
    const { code } = _.get(match, 'location.query', {});
    try {
      const res = await getMoveTransactionDetail({ code });
      const data = _.get(res, 'data.data');
      setData(data);
      setLoading(false);
    } catch (e) {
      log.error(e);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const { name, code, remark, module } = data;
  const moduleName = findModuleNameByValue(`${module}`) || {};

  return (
    <Spin spinning={loading}>
      <div style={{ margin: '20px 0 30px 20px' }}>
        <div
          style={{
            fontSize: 16,
            display: 'inline-block',
          }}
        >
          移动事务详情
        </div>
      </div>
      <FormItem label="模块功能">{moduleName.name || replaceSign}</FormItem>
      <FormItem label="事务名称">{name || replaceSign}</FormItem>
      <FormItem label="事务编码">{code || replaceSign}</FormItem>
      <FormItem label="备注">{remark || replaceSign}</FormItem>
      {/* <div>老黑提示：字段后面的必须按钮代表着功能在执行时相应字段必须填写！</div> */}
    </Spin>
  );
};

export default Detail;
