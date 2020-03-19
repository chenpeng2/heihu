// @flow
type material_type = {
  code: string,
  name: string,
  amount: number,
  unitName: string,
};
type material_compose_type = {
  amountActual: number,
  amountPlanned: number,
  demandTime: string,
  eta: string,
  id: number,
  materialCode: string,
  orgId: number,
  projectCode: string,
  purchaseOrderCode: string,
  concernedPersonList: Array<{
    id: string,
    name: string,
  }> | null,
  status: {
    status: number,
    statusDisplay: string,
    statusCode: string,
  },
};

type input_item_type = {
  summary: material_type,
  materialList: Array<material_compose_type>,
};

type input_type = Array<input_item_type>;

type output_child_type = {
  key: string,
  material: material_type,
  amountActual: number,
  amountPlanned: number,
  demandTime: string,
  eta: string,
  id: number,
  materialCode: string,
  orgId: number,
  projectCode: string,
  purchaseOrderCode: string,
  concernedPersonList: Array<{
    id: string,
    name: string,
  }> | null,
  status: {
    status: number,
    statusDisplay: string,
    statusCode: string,
  },
};
type output_item_type = {
  key: string,
  material: material_type,
  children: Array<output_child_type>,
};
type output_type = Array<output_item_type>;

const format_material_list = (original_data: input_type): output_type => {
  const data = [];

  if (!original_data) return data;

  original_data.forEach((item: input_item_type, index: number) => {
    const { materialList, summary } = item || {};
    const { code } = summary || {};

    // const new_material_compose_list = materialList.map((item_a: material_compose_type, index: number): output_child_type => {
    //   return { ...item_a, material: summary, key: `${code}-child-${index}` };
    // });

    // data.push({ material: summary, children: new_material_compose_list, key: `${code}-${index}` });
    data.push({ material: summary, key: `${code}-${index}` });
  });

  return data;
};

export default format_material_list;
