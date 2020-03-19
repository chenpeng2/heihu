import React, { useState, useEffect } from 'react';
import _ from 'lodash';

import ProdProgressViewModel from 'models/cooperate/planWorkOrder/ProdProgressViewModel';
import { queryWorkOrderTreeProdProgress } from 'services/cooperate/plannedTicket';
import log from 'utils/log';

import DimensionToggle from './DimensionToggle';
import ProdProgressTable from './ProdProgressTable';
import { Dimension } from './constants';
import styles from './styles.scss';

type ProductionProgressPropsType = {
  workOrderCode: String,
};

export default function ProductionProgress(props: ProductionProgressPropsType) {
  const { workOrderCode } = props || {};
  const [model, setModel] = useState(
    ProdProgressViewModel.fromApi({
      dimensionToggle: Dimension.WORK_ORDER,
      prodProgressData: [],
    }),
  );

  function queryProdProgressData(workOrderCode, dimension) {
    if (workOrderCode) {
      queryWorkOrderTreeProdProgress(workOrderCode, dimension)
        .then(res => {
          const data = _.get(res, 'data.data');
          const newModel = ProdProgressViewModel.fromApi({
            ...model,
            prodProgressData: data,
          });
          setModel(newModel);
        })
        .catch(err => log.error(err));
    }
  }

  const { dimensionToggle, prodProgressData } = model || {};

  useEffect(() => {
    queryProdProgressData(workOrderCode, dimensionToggle);
  }, [workOrderCode, dimensionToggle]);

  function onToggleChange(v) {
    const newModel = ProdProgressViewModel.fromApi({
      ...model,
      dimensionToggle: v,
    });
    setModel(newModel);
  }

  return (
    <div className={styles['work-order-prod-progress-info']}>
      <DimensionToggle value={dimensionToggle} onToggleChange={onToggleChange} />
      <ProdProgressTable workOrderCode={workOrderCode} dimension={dimensionToggle} data={prodProgressData} />
    </div>
  );
}
