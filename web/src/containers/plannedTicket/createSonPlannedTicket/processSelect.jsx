import * as React from 'react';
import _, { debounce } from 'lodash';

import { Select } from 'src/components';
import { getSubProcessAndAmounts } from 'src/services/cooperate/plannedTicket';
import { replaceSign } from 'src/constants';

const Option = Select.Option;

type ProcessSelectType = {
  style: any,
  className: string,
  disabledValues: Array<string>,
  hideCreateButton: boolean,
  params: {
    from: Number,
    first: Number,
    code: String,
    name: String,
    search: String,
    status: 'all' | 1 | 0,
  },
  value: any,
  onChange: any,
  plannedTicketCode: string,
  materialCode: string,
};

type ProcessSelectStateType = {
  process: Array<mixed>,
  search: string,
};

class ProcessSelect extends React.Component<ProcessSelectType, ProcessSelectStateType> {
  constructor(props) {
    super(props);
    this.getProcess = debounce(this.getProcess, 800);
    this.lastFetchId = 0;
  }

  state = {
    process: [],
    basicInfo: {},
    search: '',
    value: undefined,
  };

  componentDidMount() {
    if (!this.props.loadOnFocus) {
      this.getProcess(null, this.props, this.setDefaultValue);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(this.props.materialCode, nextProps.materialCode) ||
      !_.isEqual(this.props.plannedTicketCode, nextProps.plannedTicketCode)
    ) {
      this.getProcess(null, nextProps, this.setDefaultValue);
    }
  }

  getProcess = (search, props, cb) => {
    const { plannedTicketCode, materialCode } = props || this.props;
    console.log(plannedTicketCode, materialCode);

    this.lastFetchId += 1;
    const fetchId = this.lastFetchId;
    this.setState({ search });
    if (fetchId !== this.lastFetchId) {
      return null;
    }
    let process = [];

    if (plannedTicketCode && materialCode) {
      getSubProcessAndAmounts(plannedTicketCode, materialCode).then(res => {
        const _process = _.get(res, 'data.data.seqs');
        process = _process.map(i => {
          const { processCode, processName, processSeq } = i || {};
          return {
            label: `${processCode || replaceSign}/${processName || replaceSign}`,
            value: processSeq,
          };
        });

        this.setState(
          {
            process,
          },
          cb,
        );
      });
    }
  };

  getDefaultValue = () => {
    const { process } = this.state;
    if (Array.isArray(process) && process.length === 1) {
      const { value, label } = process[0] || {};
      return { key: value, label };
    }
  };

  setDefaultValue = () => {
    const defaultValue = this.getDefaultValue();
    if (!defaultValue) return;

    this.setState({ value: defaultValue });
    if (this.props.onChange) {
      this.props.onChange(defaultValue);
    }
  };

  getOptions = () => {
    const { process } = this.state;

    return Array.isArray(process)
      ? process.map(node => {
          const { label, value } = node || {};

          return (
            <Option key={value} value={value}>
              {label}
            </Option>
          );
        })
      : [];
  };

  render() {
    const options = this.getOptions();

    return (
      <Select
        style={{ width: 200 }}
        placeholder="请选择物料"
        value={this.state.value}
        // onSearch={this.handleSearch}
        labelInValue
        filterOption={false}
        {...this.props}
        onChange={value => {
          this.setState({ value });
          if (this.props.onChange) {
            this.props.onChange(value);
          }
        }}
        onFocus={() => {
          if (this.props.loadOnFocus) {
            console.log(this.props);
            this.getProcess(null, this.props, this.setDefaultValue);
          }
        }}
      >
        {options}
      </Select>
    );
  }
}

export default ProcessSelect;
