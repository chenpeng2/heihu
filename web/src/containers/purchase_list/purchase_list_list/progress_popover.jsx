import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import { Popover, Spin, Icon, PlainText } from 'src/components';
import { changeChineseToLocale } from 'src/utils/locale/utils';
import { primary, black, middleGrey } from 'src/styles/color';
import { get_purchase_list_detail } from 'src/services/cooperate/purchase_list';
import MaterialListTreeTable from 'src/containers/purchase_list/base/material_list_tree_table';
import format_purchase_list from 'src/containers/purchase_list/util/format_material_list';

type Props = {
  style: {},
  data: {},
  intl: any,
};

class ProgressPopover extends Component {
  props: Props;
  state = {
    purchase_list_detail: null,
    loading: false,
  };

  fetch_detail = code => {
    this.setState({ loading: true });
    get_purchase_list_detail(code)
      .then(res => {
        const { data } = res || {};
        const { data: detail_data } = data || {};
        this.setState({
          purchase_list_detail: detail_data,
        });
      })
      .finally(() => {
        this.setState({ loading: false });
      });
  };

  render_content = () => {
    const { purchase_list_detail, loading } = this.state;

    const { materials } = purchase_list_detail || {};
    return (
      <Spin spinning={loading}>
        <MaterialListTreeTable key={JSON.stringify(materials)} material_data={materials || []} />
      </Spin>
    );
  };

  render() {
    const { data } = this.props;
    const { amountFinished, amountPlanned, id } = data || {};

    return (
      <Popover
        onMouseEnter={() => {
          this.fetch_detail(id);
        }}
        title={<PlainText text="进度" style={{ fontSize: 16, color: black }} />}
        content={this.render_content()}
      >
        <span style={{ color: primary, cursor: 'pointer' }}>
          {`${amountFinished}/${amountPlanned}`}
          <Icon type={'down'} size={8} style={{ margin: '0 5px' }} />
        </span>
      </Popover>
    );
  }
}

ProgressPopover.contextTypes = {
  changeChineseToLocale: PropTypes.func,
};

export default ProgressPopover;
