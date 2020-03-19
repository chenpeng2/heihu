import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import { Spin } from 'src/components';
import { getToolingListDetail, getToolingLogList } from 'src/services/equipmentMaintenance/base';
import log from 'src/utils/log';
import { setLocation } from 'utils/url';
import ToolingInfo from './toolingInfo';
import MachiningMaterialInfo from './machiningMaterialInfo';
import EquipBind from './equipBind';
import ToolingPlanInfo from './toolingPlanInfo';
import ToolingLog from './toolingLog';
import ToolingMetric from './toolingMetric';
import ToolingStrategy from './toolingStrategy';

type Props = {
  match: any,
  history: any,
};

const Detail = (props: Props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [logLoading, setLogLoading] = useState(false);
  const [logData, setLogData] = useState({});
  const { match, history } = props;

  const fetchData = async () => {
    setLoading(true);
    const { id } = _.get(match, 'location.query', '');
    try {
      const res = await getToolingListDetail({ id });
      const data = _.get(res, 'data.data');
      setData(data);
      setLoading(false);
    } catch (e) {
      log.error(e);
      setLoading(false);
    }
  };

  const fetchToolingOperationLog = (value = {}) => {
    const params = { mouldUnitCode: data && data.code, ...value };
    setLocation(props, () => params);
    setLogLoading(true);
    getToolingLogList(params)
      .then(res => {
        setLogData(_.get(res, 'data'));
      })
      .catch(e => {
        log.error(e);
      })
      .finally(() => {
        setLogLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [match.location.query.id]);

  useEffect(() => {
    if (data && data.code) {
      fetchToolingOperationLog({ page: 1, size: 10 });
    }
  }, [data && data.code]);

  return (
    <Spin spinning={loading}>
      <div style={{ marginBottom: 100 }}>
        <ToolingInfo data={data} history={history} fetchToolingOperationLog={fetchToolingOperationLog} />
        <MachiningMaterialInfo machiningMaterial={data && data.machiningMaterial} />
        <EquipBind data={data} />
        <ToolingPlanInfo data={data} fetchToolingOperationLog={fetchToolingOperationLog} />
        <ToolingMetric data={data} />
        <ToolingStrategy data={data} fetchToolingOperationLog={fetchToolingOperationLog} />
        <ToolingLog data={logData} loading={logLoading} fetchData={fetchToolingOperationLog} />
      </div>
    </Spin>
  );
};

export default Detail;
