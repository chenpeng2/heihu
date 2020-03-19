import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import withForm from 'components/form';
import ProductionRecords from './productionRecords';

const intervals = [
  {
    key: 'DAY',
    display: '按天',
    value: 6,
    datePickerMode: 'day',
  },
  {
    key: 'WEEK',
    display: '按周',
    value: 7,
    datePickerMode: 'week',
  },
  {
    key: 'MONTH',
    display: '按月',
    value: 8,
    datePickerMode: 'month',
  },
  {
    key: 'QUARTER',
    display: '按季度',
    value: 9,
    datePickerMode: 'day',
  },
];

const HistoricProductionRecords = () => <ProductionRecords intervals={intervals} getCurrentRecords={false} />;

export default withForm({}, withRouter(HistoricProductionRecords));
