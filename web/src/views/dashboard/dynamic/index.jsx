import React, { Component } from 'react';
import { Icon, Spin } from 'src/components';
import { getDashboardList } from 'src/services/dashboard/dashboard';
import Select from 'components/select';
import { primary, greyWhite, orange } from 'src/styles/color';
import styles from './styles.scss';

const Option = Select.Option;
const hideStyle = {
  position: 'absolute',
  right: '50%',
  top: '-13px',
  fontSize: 26,
  opacity: 0.3,
};
class DynamicDashboard extends Component {
  props: {
    match: any,
  };

  state = {
    dashboardList: [],
    showSingleSelect: false,
    showMultipleSelect: false,
    visible: false,
    loading: false,
    isPlay: false,
    fakeLoading: false,
    url: '',
    urls: [],
    int: null,
  };

  componentDidMount() {
    this.fetchData();
    const layoutHeader = document.getElementsByClassName('layoutHeader___3oRfs')[0];
    layoutHeader.style.display = 'none';
  }

  componentWillUnmount() {
    const layoutHeader = document.getElementsByClassName('layoutHeader___3oRfs')[0];
    layoutHeader.style.display = 'block';
  }

  fetchData = async params => {
    const {
      data: { data },
    } = await getDashboardList(params);
    this.setState({
      dashboardList: data,
      url: data[0] && data[0].url,
    });
  };

  onPlay = () => {
    const { urls, url, isPlay } = this.state;
    let num = 0;
    if (!urls.includes(url) || urls.indexOf(url) !== 0) {
      this.setState({ url: urls[0], fakeLoading: true });
      setTimeout(() => {
        this.setState({ fakeLoading: false });
      }, 5000);
      num = urls.length === 1 ? 0 : 1;
    }
    const int = self.setInterval(() => {
      this.setState({ url: urls[num], fakeLoading: true });
      if (num === urls.length - 1) {
        num = 0;
      } else {
        num += 1;
      }
      setTimeout(() => {
        this.setState({ fakeLoading: false });
      }, 5000);
    }, 65000);
    this.setState({ isPlay: true, int });
  };

  onPause = () => {
    clearInterval(this.state.int);
    this.setState({ isPlay: false, fakeLoading: false });
  };

  renderSingleSelect = dashboardList => {
    const { showSingleSelect, isPlay } = this.state;

    return (
      <div style={{ display: 'flex', position: 'absolute', top: 18, left: 2, zIndex: 10 }}>
        <Icon
          type={'bars'}
          onClick={() => {
            this.setState({ showSingleSelect: !showSingleSelect, showMultipleSelect: false });
          }}
          style={{
            width: 24,
            height: 27,
            cursor: 'pointer',
            backgroundColor: 'black',
            color: 'white',
            opacity: 0.3,
            fontSize: 24,
          }}
        />
        <Select
          style={{ width: 186, display: showSingleSelect ? 'block' : 'none', transition: 'all 0.5s' }}
          value={this.state.url}
          disabled={isPlay}
          onChange={url => {
            this.setState({ url, showSingleSelect: false });
          }}
        >
          {dashboardList.map(({ id, title, url }) => (
            <Option key={id} value={url}>
              {title}
            </Option>
          ))}
        </Select>
      </div>
    );
  };

  renderMultipleSelect = dashboardList => {
    const { showMultipleSelect, urls, isPlay } = this.state;
    const func = isPlay ? this.onPause : this.onPlay;

    return (
      <div style={{ display: 'flex', position: 'absolute', top: 48, left: 2, zIndex: 10 }}>
        <Icon
          iconType="gc"
          type={'duoxuanbaise'}
          onClick={() => {
            this.setState({ showMultipleSelect: !showMultipleSelect, showSingleSelect: false });
          }}
          style={{
            width: 24,
            height: 27,
            lineHeight: '27px',
            cursor: 'pointer',
            backgroundColor: 'black',
            color: 'white',
            opacity: 0.3,
            fontSize: 24,
          }}
        />
        <Select
          style={{ width: 186, display: showMultipleSelect ? 'block' : 'none', transition: 'all 0.5s' }}
          mode={'multiple'}
          onChange={urls => {
            this.setState({ urls });
          }}
          disabled={isPlay}
        >
          {dashboardList.map(({ id, title, url }) => (
            <Option key={id} value={url}>
              {title}
            </Option>
          ))}
        </Select>
        <Icon
          type={isPlay ? 'pause-circle' : 'play-circle'}
          onClick={func}
          style={{
            color: primary,
            display: showMultipleSelect ? 'block' : 'none',
            fontSize: 21,
            cursor: 'pointer',
            marginLeft: 5,
            lineHeight: '27px',
          }}
        />
      </div>
    );
  };

  renderAllScreen = () => {
    return (
      <div style={{ display: 'flex', position: 'absolute', top: 88, left: 2, zIndex: 10 }}>
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            const dashBoard = document.getElementById('dashBoardIframe');
            if (dashBoard) dashBoard.requestFullscreen();
          }}
        >
          全屏
        </div>
      </div>
    );
  };

  render() {
    const { fakeLoading, dashboardList } = this.state;
    if (!(dashboardList && dashboardList.length)) {
      return (
        <div style={{ color: primary, fontSize: '16px', textAlign: 'center', margin: '20px auto' }}>
          <Icon type={'info-circle'} style={{ color: orange }} />
          <span style={{ marginLeft: 10 }}>没有配置看板，请联系管理员</span>
        </div>
      );
    }

    return (
      <div className={styles.dashboard}>
        <Spin size="large" spinning={fakeLoading}>
          {this.renderSingleSelect(dashboardList)}
          {this.renderMultipleSelect(dashboardList)}
          {this.renderAllScreen()}
          {/* key用来让iframe重新mount 不然更改src 不能刷新iframe */}
          <div
            id={'dashBoardIframe'}
            key={this.state.url}
            style={{
              width: '100%',
              height: '100%',
              margin: '0 auto',
              position: 'absolute',
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              transition: 'all 0.5s',
            }}
          >
            <iframe width="100%" height="100%" ref={e => (this.container = e)} src={this.state.url} />
          </div>
        </Spin>
      </div>
    );
  }
}

export default DynamicDashboard;
