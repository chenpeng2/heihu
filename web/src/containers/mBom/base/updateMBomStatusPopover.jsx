import React, { Component } from 'react';
import { notification } from 'antd';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Link, FormattedMessage } from 'src/components';
import { error, blacklakeGreen } from 'src/styles/color/index';
import moment from 'src/utils/time';
import { updateMBomStatus } from 'src/services/bom/mbom';
import auth from 'src/utils/auth';
import Popiknow from 'components/popconfirm/popiknow';
import { changeChineseToLocaleWithoutIntl } from '../../../utils/locale/utils';

const baseStyle = { marginRight: 10, cursor: 'pointer', color: blacklakeGreen };

type Props = {
  mBom: any,
  style: any,
  callback: () => {},
};

class UpdateProcessRoutingStatus extends Component {
  props: Props;
  state = {
    id: null,
    showPopConfirm: false,
    popConfirmText: null,
  };

  componentDidMount() {
    const { mBom } = this.props;
    const { id, status } = mBom;
    this.setState({
      id,
    });
  }

  showPopConfirm = (text, button) => {
    this.setState({
      showPopConfirm: true,
      popConfirmText: text,
    });
  };

  render() {
    const { callback } = this.props;
    const { id, showPopConfirm, popConfirmText } = this.state;
    const { style, mBom, beforeClick, finallyCallback } = this.props;
    const inUse = mBom && mBom.status === 1;
    if (showPopConfirm) {
      return (
        <Popiknow
          visible
          content={popConfirmText}
          onVisibleChange={visible => {
            if (!visible) {
              this.setState({ showPopConfirm: false });
            }
          }}
          onConfirm={() => this.setState({ showPopConfirm: false })}
        >
          <FormattedMessage
            style={{ ...baseStyle, color: inUse ? blacklakeGreen : error, ...style }}
            defaultMessage={inUse ? '停用' : '发布'}
          />
        </Popiknow>
      );
    }

    return (
      <Link
        auth={auth.WEB_EDIT_MBOM_DEF}
        style={{ ...baseStyle, color: blacklakeGreen, ...style }}
        onClick={async () => {
          const { validFrom, validTo, status } = mBom;
          if (
            status === 1 &&
            (moment.unix(validFrom / 1000).diff(moment()) > 0 || moment.unix(validTo / 1000).diff(moment() < 0))
          ) {
            this.showPopConfirm('发布失败，该生产BOM不在有效期内');
          } else {
            if (typeof beforeClick === 'function') {
              beforeClick();
            }
            const res = await updateMBomStatus({
              id,
              status: inUse ? 0 : 1,
            }).finally(() => {
              if (typeof finallyCallback === 'function') {
                finallyCallback();
              }
            });
            const { statusCode, message } = _.get(res, 'data') || {};

            if (statusCode === 201) {
              this.showPopConfirm(message);
              return;
            }

            if (statusCode === 200) {
              // 成功了
              if (callback) {
                callback({
                  id,
                  status: inUse ? 0 : 1,
                });
              }
              notification.open({
                message: changeChineseToLocaleWithoutIntl('{action}生产BOM', { action: inUse ? '停用' : '发布' }),
                description: changeChineseToLocaleWithoutIntl('{action}成功', { action: inUse ? '停用' : '发布' }),
              });
            }
          }
        }}
      >
        {inUse ? '停用' : '发布'}
      </Link>
    );
  }
}

UpdateProcessRoutingStatus.propTypes = {
  callback: PropTypes.func,
  finallyCallback: PropTypes.func,
  beforeClick: PropTypes.func,
};

export default UpdateProcessRoutingStatus;
