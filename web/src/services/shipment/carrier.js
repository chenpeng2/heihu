import request from 'utils/request';

const baseURL = 'ab_shipment/v1';

const carrierBase = `${baseURL}/logistics_carriers`;
const driverBase = `${baseURL}/logistics_drivers`;
const plateNumberBase = `${baseURL}/plate_numbers`;
const parkingBase = `${baseURL}/logistics_parking`;

export const getCarriers = params => request.get(`${carrierBase}`, { params });
export const getDrivers = params => request.get(`${driverBase}`, { params });
export const getPlateNumbers = params => request.get(`${plateNumberBase}`, { params });
export const getParkingList = params => request.get(`${parkingBase}`, { params });
export const getCustomers = params => request.get('order/v1/customer', { params });

export default getCarriers;
