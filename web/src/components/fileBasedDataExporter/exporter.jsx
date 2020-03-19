import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import m, { Moment } from 'moment';
import { Spin, Row, Col, Calendar, Divider } from 'antd';
import _ from 'lodash';

import { changeChineseToLocale } from 'src/utils/locale/utils';
import request from 'utils/request';
import log from 'src/utils/log';

type Props = {
  baseUrl: string,
  type: string,
  generateForPast: boolean,
};

const subpathConfig = {
  GENERATE_PUBLIC_URL: '/_generate_public_url',
  REFRESH: '/_refresh',
  GENERATE: '/_generate',
  LIST: '/_list_by_day',
};

class Exporter extends Component {
  props: Props;
  state: {
    year: number,
    month: number,
    days: {
      [key: String]: [String],
    },
    loading: boolean,
  };

  state = { loading: false, year: m().year(), month: m().month() + 1, days: {} };

  componentWillMount() {
    this.list(this.state.year, this.state.month);
  }

  componentWillUpdate(nextProps, nextState): void {
    if (nextState.year !== this.state.year) {
      this.list(nextState.year, nextState.month);
      return true;
    }
    if (nextState.month !== this.state.month) {
      this.list(nextState.year, nextState.month);
      return true;
    }
    if (JSON.stringify(nextState.days) !== JSON.stringify(this.state.days)) {
      return true;
    }
    return false;
  }

  setYearAndMonth = (year, month) => this.setState({ year, month });

  setYearAndMonthFromMoment = (mo: Moment) => {
    this.setYearAndMonth(mo.year(), mo.month() + 1);
  };

  dateCellRender = value => {
    const { intl } = this.props;
    const day = value;
    const files = this.state.days[value.format('YYYY-MM-DD')] || [];
    if (day.month() + 1 !== this.state.month || day.isAfter(m())) {
      return <div />;
    }
    const generated = files.length !== 0;
    const isBefore = day.isBefore(m(), 'day');
    const generateView = <a onClick={() => this.generate(day.year(), day.month() + 1, day.date())}>{changeChineseToLocale('生成', intl)}</a>;
    const refreshView = <a onClick={() => this.refresh(this.state.year, this.state.month, day.date())}>{changeChineseToLocale('刷新', intl)}</a>;
    const emptyView = <p style={{ color: 'transparent' }}>{changeChineseToLocale('空', intl)}</p>;

    // | generateForPast | generated | pastdays | sameday | futuredays |
    // | --------------- | --------- | -------- | ------- | ---------- |
    // | T               | T         | G        | G       | X          |
    // | T               | F         | R        | R       | X          |
    // | F               | T         | X        | G       | X          |
    // | F               | F         | X        | R       | X          |
    // G：生成，R：刷新，X：空
    return (
      <Col>
        <Row>
          {this.props.generateForPast
            ? generated
              ? refreshView
              : generateView
            : isBefore
              ? emptyView
              : generated
                ? refreshView
                : generateView}
        </Row>
        <Divider dashed style={{ marginTop: '5px', marginBottom: '5px' }} />
        {
          <Row>
            {Array((files.length * 2 || 1) - 1)
              .fill(null)
              .map((_, idx) => {
                if (idx % 2 === 0) {
                  const file = files[idx / 2];
                  return <a key={`${file}`} onClick={() => this.download(file)}>{`${changeChineseToLocale('文件')} ${idx / 2 + 1}`}</a>;
                }
                return <Divider type="vertical" key={`${files[(idx - 1) / 2]}-divider`} />;
              })}
          </Row>
        }
      </Col>
    );
  };

  monthCellRender() {
    return null;
  }

  render() {
    return (
      <Spin spinning={this.state.loading}>
        <div>
          <Calendar
            mode={'month'}
            dateCellRender={this.dateCellRender}
            monthCellRender={this.monthCellRender}
            onChange={date => this.setYearAndMonthFromMoment(date)}
            onSelect={date => this.setYearAndMonthFromMoment(date)}
            onPanelChange={(date, _) => this.setYearAndMonthFromMoment(date)}
          />
        </div>
      </Spin>
    );
  }

  list = async (year, month) => {
    this.setState({ loading: true });
    const d = await request
      .get(`${this.props.baseUrl}${subpathConfig.LIST}`, {
        params: { year, month },
      })
      .catch(e => log.error(e));
    this.setState({ loading: false, days: _.get(d, 'data.data', {}) });
  };

  generate = async (year, month, day) => {
    this.setState({ loading: true });
    await request
      .post(
        `${this.props.baseUrl}${subpathConfig.GENERATE}`,
        {},
        {
          params: { year, month, day },
        },
      )
      .catch(e => log.error(e));

    this.setState({ loading: false });
    await this.list(year, month);
  };

  refresh = async (year, month, day) => {
    this.setState({ loading: true });
    await request
      .post(
        `${this.props.baseUrl}${subpathConfig.REFRESH}`,
        {},
        {
          params: { year, month, day },
        },
      )
      .catch(e => log.error(e));
    this.setState({ loading: false });
    await this.list(year, month);
  };

  generatePublicUrl = async filename => {
    this.setState({ loading: true });
    const d = await request
      .post(
        `${this.props.baseUrl}${subpathConfig.GENERATE_PUBLIC_URL}`,
        {},
        {
          params: { filename },
        },
      )
      .catch(e => log.error(e));
    this.setState({ loading: false });
    return d.data.data;
  };

  download = async filename => {
    const publicUrl = await this.generatePublicUrl(filename);
    window.open(publicUrl);
  };
}

export default injectIntl(Exporter);
