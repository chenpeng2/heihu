import request from 'utils/request';

const baseUrl = 'send_message/v1';

export const sendMessage = data => {
  return request.post(`${baseUrl}/messages`, data, { loading: true });
};
