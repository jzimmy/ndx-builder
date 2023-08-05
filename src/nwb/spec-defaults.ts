import { GroupTypeDef, DatasetTypeDef, Namespace, AttributeDec } from "./spec";

const namespace: Namespace = {
  name: "",
  doc: "",
  version: [0, 1, 0],
  authors: [],
  typedefs: [],
};

const groupTypeDef: GroupTypeDef = {
  neurodataTypeDef: "",
  neurodataTypeInc: ["None", null],
  doc: "",
  groups: [],
  datasets: [],
  attributes: [],
  links: [],
};

const datasetTypeDef: DatasetTypeDef = {
  neurodataTypeDef: "",
  neurodataTypeInc: ["None", null],
  doc: "",
  attributes: [],
  shape: [],
  dtype: ["PRIMITIVE", "f32"],
};

const attributeDec: AttributeDec = {
  name: "",
  doc: "",
  dtype: ["PRIMITIVE", "f32"],
  data: ["SCALAR", ["", false]],
  required: false,
};

export const Initializers = {
  groupTypeDef: groupTypeDef,
  datasetTypeDef: datasetTypeDef,
  namespace: namespace,
  attributeDec: attributeDec,
};
