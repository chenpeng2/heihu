import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import SearchSelect from 'components/select/searchSelect';
import { Select, PlainText } from 'components';
import { queryWorkstation } from 'services/workstation';
import { getProcessByCodes } from 'services/process';
import { arrayIsEmpty } from 'utils/array';

const Option = Select.Option;

class WorkstationSelect extends Component {
  props: { fetchWorkstationItems: () => {}, workstationOptions: [] };
  state = {
    type: 'WORKSTATION',
  };

  clearFilterWorkstationId = () => {
    this.setState({ filterWorkstationId: undefined });
  };

  fetchWorkstationsByWorkshopIds = async workshopIds => {
    const { workstationOptions } = this.props;
    const res = await queryWorkstation({ workshopIds });
    const data = _.get(res, 'data.data');
    const workstations = _.intersectionBy(workstationOptions, data, 'id');
    return workstations;
  };

  fetchWorkstationsByProcessCodes = async codes => {
    const { workstationOptions } = this.props;
    const res = await getProcessByCodes(codes);
    const data = _.get(res, 'data.data');
    const workstations = _.intersectionBy(workstationOptions, _.flatten(data.map(e => e.workstationDetails)), 'id');
    return workstations;
  };

  render() {
    const { fetchWorkstationItems, workstationOptions } = this.props;
    const { filterWorkstationIds, filterWorkshopIds, filterProcessCodes, type } = this.state;
    let select;
    if (type === 'WORKSHOP') {
      select = (
        <SearchSelect
          type="workshop"
          mode="multiple"
          allowClear
          placeholder=""
          value={filterWorkshopIds}
          style={{ marginLeft: 5, width: '55%' }}
          onChange={async workshopIds => {
            this.setState({ filterWorkshopIds: workshopIds });
            if (this.state.workstationFetchDelay) {
              return;
            }
            this.setState({ workshopIds });
            if (arrayIsEmpty(workshopIds)) {
              fetchWorkstationItems({ workstationIds: workstationOptions.map(e => e.id) });
            } else {
              const workstations = await this.fetchWorkstationsByWorkshopIds(workshopIds.map(e => e.key).join(','));
              fetchWorkstationItems({ workstationIds: workstations.map(e => e.id) });
            }
          }}
          onFocus={() => {
            this.setState({ workstationFetchDelay: true });
          }}
          onBlur={async workshopIds => {
            if (_.isEqual(workshopIds, this.state.workshopIds)) {
              this.setState({ workstationFetchDelay: false });
              return;
            }
            this.setState({ workstationFetchDelay: false, workshopIds });
            if (arrayIsEmpty(workshopIds)) {
              fetchWorkstationItems({ workstationIds: workstationOptions.map(e => e.id) });
            } else {
              const workstations = await this.fetchWorkstationsByWorkshopIds(workshopIds.map(e => e.key).join(','));
              fetchWorkstationItems({ workstationIds: workstations.map(e => e.id) });
            }
          }}
        />
      );
    } else if (type === 'PROCESS') {
      select = (
        <SearchSelect
          type="processName"
          mode="multiple"
          placeholder=""
          allowClear
          value={filterProcessCodes}
          style={{ marginLeft: 5, width: '55%' }}
          onChange={async processCodes => {
            this.setState({ filterProcessCodes: processCodes });
            if (this.state.workstationFetchDelay) {
              return;
            }
            this.setState({ processCodes });
            if (arrayIsEmpty(processCodes)) {
              fetchWorkstationItems({ workstationIds: workstationOptions.map(e => e.id) });
            } else {
              const workstations = await this.fetchWorkstationsByProcessCodes(processCodes.map(e => e.key));
              fetchWorkstationItems({ workstationIds: workstations.map(e => e.id) });
            }
          }}
          onFocus={() => {
            this.setState({ workstationFetchDelay: true });
          }}
          onBlur={async processCodes => {
            const { processOption } = this.state;
            if (_.isEqual(processCodes, this.state.processCodes)) {
              this.setState({ workstationFetchDelay: false });
              return;
            }
            this.setState({ workstationFetchDelay: false, processCodes });
            if (arrayIsEmpty(processCodes)) {
              fetchWorkstationItems({ workstationIds: workstationOptions.map(e => e.id) });
            } else {
              const workstations = await this.fetchWorkstationsByProcessCodes(processCodes.map(e => e.key));
              fetchWorkstationItems({ workstationIds: workstations.map(e => e.id) });
            }
          }}
        />
      );
    } else {
      select = (
        <Select
          allowClear
          mode="multiple"
          placeholder=""
          value={filterWorkstationIds}
          style={{ marginLeft: 5, width: '55%' }}
          onChange={workstationIds => {
            this.setState({ filterWorkstationIds: workstationIds });
            if (this.state.workstationFetchDelay) {
              return;
            }
            this.setState({ workstationIds });
            if (arrayIsEmpty(workstationIds)) {
              fetchWorkstationItems({ workstationIds: workstationOptions.map(e => e.id) });
            } else {
              fetchWorkstationItems({ workstationIds });
            }
          }}
          onFocus={() => {
            this.setState({ workstationFetchDelay: true });
          }}
          onBlur={workstationIds => {
            if (_.isEqual(workstationIds, this.state.workstationIds)) {
              this.setState({ workstationFetchDelay: false });
              return;
            }
            this.setState({ workstationFetchDelay: false, workstationIds });
            if (arrayIsEmpty(workstationIds)) {
              fetchWorkstationItems({ workstationIds: workstationOptions.map(e => e.id) });
            } else {
              fetchWorkstationItems({ workstationIds });
            }
          }}
        >
          {workstationOptions.map(workstation => (
            <Option key={workstation.id} title={workstation.name} value={workstation.id}>
              {workstation.name}
            </Option>
          ))}
        </Select>
      );
    }
    return (
      <div style={{ display: 'flex' }}>
        <Select
          value={type}
          placeholder=""
          style={{ width: '42%' }}
          onChange={type => {
            if (type === this.state.type) {
              return;
            }
            this.setState({
              type,
              filterProcessCodes: [],
              filterWorkshopIds: [],
              filterWorkstationIds: [],
              workshopIds: [],
              workstationIds: [],
              processCodes: [],
            });
          }}
        >
          <Option value={'WORKSTATION'}>
            <PlainText text="按工位" />
          </Option>
          <Option value={'WORKSHOP'}>
            <PlainText text="按车间" />
          </Option>
          <Option value={'PROCESS'}>
            <PlainText text="按工序" />
          </Option>
        </Select>
        {select}
      </div>
    );
  }
}

export default WorkstationSelect;
