import React, { Component } from 'react';
import _ from 'lodash';
import moment from 'utils/time';
import { withRouter } from 'react-router-dom';
import { DatePicker, Button, Icon, withForm, Tabs } from 'src/components';
import { white, fontSub, border } from 'src/styles/color/index';
import { setLocation } from 'utils/url';
import { injectIntl } from 'react-intl';
import { changeChineseToLocale } from 'utils/locale/utils';
import { getQuery } from 'src/routes/getRouteParams';
import CostAnalysis from './costAnalysis';
import DowntimeAnalysis from './downtimeAnalysis';
import FailureAnalysis from './failureAnalysis';
import MaintainIndex from './maintainIndex';

const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;

type Props = {
  form: any,
  intl: any,
  data: [],
  match: any,
  search: any,
  isSearch: boolean,
};

class EquipCharts extends Component {
  props: Props;
  state = {
    searchData: {},
  };

  componentWillMount() {
    const { match } = this.props;
    const query = getQuery(match);
    if (!query.time) {
      query.time = [moment().subtract(7, 'd'), moment().subtract(1, 'd')];
    }
    this.setState({ searchData: query });
  }

  renderButton = () => {
    return (
      <div>
        <Button
          style={{ width: 86 }}
          icon={'search'}
          onClick={() => {
            const { form } = this.props;
            const { getFieldsValue } = form;
            const value = getFieldsValue();
            this.setState({ searchData: value, isSearch: true }, () => {
              this.setState({ isSearch: false });
            });
            setLocation(this.props, p => ({ ...p, ...value }));
          }}
        >
          查询
        </Button>
      </div>
    );
  };

  renderConfirm = () => {
    const { intl } = this.props;
    return (
      <div
        style={{
          border: `1px solid ${border}`,
          backgroundColor: white,
          height: 260,
          lineHeight: '260px',
          textAlign: 'center',
          marginBottom: '10%',
        }}
      >
        <span style={{ color: fontSub }}>{changeChineseToLocale('暂无数据', intl)}</span>
      </div>
    );
  };

  render() {
    const { form, match, search, isSearch: isDeviceSearch, intl } = this.props;
    const { searchData, isSearch: isTimeSearch } = this.state;
    const isSearch = isDeviceSearch || isTimeSearch;
    const { getFieldDecorator } = form;
    const tabPaneStyle = { paddingBottom: 50 };
    const query = getQuery(match);
    if (query.time) {
      query.time[0] = moment(query.time[0]);
      query.time[1] = moment(query.time[1]);
    }

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Tabs style={{ padding: 20, width: '100%' }}>
          <TabPane tab={changeChineseToLocale('维修指标', intl)} key={'1'} style={tabPaneStyle}>
            {!(searchData.time && searchData.time[0]) ? (
              this.renderConfirm()
            ) : (
              <MaintainIndex match={match} search={{ ...search, ...searchData, isSearch }} />
            )}
          </TabPane>
          <TabPane tab={changeChineseToLocale('停机分析', intl)} key={'2'} style={tabPaneStyle}>
            {!(searchData.time && searchData.time[0]) ? (
              this.renderConfirm()
            ) : (
              <DowntimeAnalysis match={match} search={{ ...search, ...searchData, isSearch }} />
            )}
          </TabPane>
          <TabPane tab={changeChineseToLocale('成本分析', intl)} key={'3'} style={tabPaneStyle}>
            {!(searchData.time && searchData.time[0]) ? (
              this.renderConfirm()
            ) : (
              <CostAnalysis match={match} search={{ ...search, ...searchData, isSearch }} />
            )}
          </TabPane>
          <TabPane tab={changeChineseToLocale('故障分析', intl)} key={'4'} style={tabPaneStyle}>
            {!(searchData.time && searchData.time[0]) ? (
              this.renderConfirm()
            ) : (
              <FailureAnalysis match={match} search={{ ...search, ...searchData, isSearch }} />
            )}
          </TabPane>
        </Tabs>
        <div style={{ display: 'flex', marginTop: 30, position: 'absolute', right: 20 }}>
          {getFieldDecorator('time', {
            initialValue: query.time || [moment().subtract(7, 'd'), moment().subtract(1, 'd')],
          })(<RangePicker style={{ width: 200, height: 32, marginRight: 20 }} />)}
          {this.renderButton()}
        </div>
      </div>
    );
  }
}

export default withForm({}, withRouter(injectIntl(EquipCharts)));
