import React, { useState, Fragment } from 'react';
import _ from 'lodash';
import classNames from 'classnames';

import { Select, Searchselect } from 'components';
import SelectWithIntl from 'components/select/selectWithIntl';

import {
  processTypeMap,
  PROCESS_TYPE_PROCESS_ROUTE,
  PROCESS_TYPE_MBOM,
  PROCESS_TYPE_EBOM,
  PROCESS_TYPE_PROCESS_ROUTE_AND_EBOM,
} from '../constants';
import styles from '../styles.scss';

const { Option } = Select;

type TypeSelectPropsType = {
  typeSelectDisabled: Boolean,
  processType: String,
};

type SelectCompPropsType = {
  disabled: Boolean,
  materialCode: String,
};

function ProcessRouteSelect(props: SelectCompPropsType) {
  return (
    <Searchselect
      allowClear={false}
      type="processRouting"
      params={{ status: 1 }}
      placeholder={'工艺路线编号／名称'}
      className={styles['large-select']}
      {...props}
    />
  );
}

function MbomSelect(props: SelectCompPropsType) {
  const { materialCode, ...rest } = props || {};
  return (
    <Searchselect
      allowClear={false}
      type="mbom"
      params={{ materialCode, status: 1 }}
      placeholder="生产bom版本号"
      className={styles.select}
      {...rest}
    />
  );
}

function EbomSelect(props: SelectCompPropsType) {
  const { materialCode, ...rest } = props || {};

  return (
    <Searchselect
      allowClear={false}
      placeholder="物料清单版本号"
      type="ebomExact"
      params={{ productMaterialCode: materialCode, status: 1 }}
      className={styles.select}
      {...rest}
    />
  );
}

function ProcessRouteAndEbomSelect(props: SelectCompPropsType) {
  const { disabled, ...rest } = props || {};

  return (
    <Fragment>
      <EbomSelect style={{ marginRight: 5 }} {...props} />
      <ProcessRouteSelect disabled={disabled} />
    </Fragment>
  );
}

export function renderSelectComp(props) {
  const { processType } = props || {};

  switch (processType) {
    case PROCESS_TYPE_PROCESS_ROUTE:
      return <ProcessRouteSelect {...props} />;
    case PROCESS_TYPE_MBOM:
      return <MbomSelect {...props} />;
    case PROCESS_TYPE_EBOM:
      return <EbomSelect {...props} />;
    default:
      return null;
  }
}

function TypeSelect(props: TypeSelectPropsType) {
  const { typeSelectDisabled, processType, className } = props || {};
  const [type, setType] = useState(processType);

  return (
    <SelectWithIntl
      allowClear={false}
      value={type}
      onChange={v => setType(v)}
      disabled={typeSelectDisabled}
      className={classNames(styles['inline-block'], styles.select, className)}
    >
      {Object.keys(processTypeMap).map(v => (
        <Option value={v}>{processTypeMap[v]}</Option>
      ))}
    </SelectWithIntl>
  );
}

export default function ProcessCascader(props) {
  return (
    <Fragment>
      <TypeSelect {...props} />
      {/* <SelectComp {...props} /> */}
    </Fragment>
  );
}

ProcessCascader.TypeSelect = TypeSelect;
ProcessCascader.EbomSelect = EbomSelect;
ProcessCascader.MbomSelect = MbomSelect;
ProcessCascader.ProcessRouteSelect = ProcessRouteSelect;
