export const formateQrCode = (code) => {
  if (!code) { throw new Error('formateQrCode需要传人code'); }
  const qrCodeWithDomain = {
    code,
    domain: 'black lake',
  };
  return JSON.stringify(qrCodeWithDomain);
};

export default 'dummy';
