import React from 'react';
import { withRouter } from 'react-router-dom';
import withForm from 'components/form';
import ProductionRecords from './productionRecords';

const intervals = [
  {
    key: 'HOUR',
    display: '按每个小时',
    value: 1,
  },
  {
    key: 'TWO_HOUR',
    display: '按每两小时',
    value: 2,
  },
  {
    key: 'FOUR_HOUW',
    display: '按每四小时',
    value: 3,
  },
  {
    key: 'SIX_HOUR',
    display: '按每六小时',
    value: 4,
  },
  {
    key: 'EIGHT_HOUR',
    display: '按每八小时',
    value: 5,
  },
];

const CurrentProductionRecords = () => <ProductionRecords intervals={intervals} disableTimeSelect getCurrentRecords />;

export default withForm({}, withRouter(CurrentProductionRecords));
