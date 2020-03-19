export const getImportHistoryPageUrl = () => '/bom/processRoute/importHistory';

export const getImportDetailPageUrl = id => (id ? `/bom/processRoute/importHistory/${id}/importDetail` : null);

export const toProcessRouteDetail = id => `/bom/processRoute/${encodeURIComponent(id)}/detail`;

export default 'dummy';
