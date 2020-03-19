import network from 'configs/Network';
import LocalStorage from 'utils/localStorage';
import request from 'src/utils/request';
import log from 'src/utils/log';
import { message } from 'components';
import { FIELDS } from 'constants';

export const wrapUrl = url => {
  const reg = /\/$/;
  const apiUrl = network.API.replace(reg, '');
  const sid = LocalStorage.get(FIELDS.TOKEN_NAME);
  return `${apiUrl}/filebase/v1/files/${encodeURIComponent(url)}/_get?sid=${sid}`;
};

export const download = (url, filename, func, onlyData) => {
  message.success('开始下载...', 10);
  request
    .get(url, {
      responseType: 'blob',
    })
    .then(({ data }) => {
      message.destroy();
      if (!onlyData) {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(new Blob([data]));
        link.download = filename;
        link.click();
      }
      if (func) {
        func(data);
      }
    })
    .catch(e => {
      log.error(e);
      message.error('下载失败！');
    });
};

export default 'dummy';
