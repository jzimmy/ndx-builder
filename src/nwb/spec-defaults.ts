import {
  GroupTypeDef,
  DatasetTypeDef,
  Namespace,
  AttributeDec,
  GroupDec,
  AnonymousGroupTypeDec,
  LinkDec,
  DatasetDec,
  AnonymousDatasetDec,
  IncGroupDec,
  IncDatasetDec,
} from "./spec";

// const _exampleGroup: GroupTypeDef = {
//   neurodataTypeDef: "ExampleGroupType",
//   neurodataTypeInc: ["None", null],
//   doc: "This is an example group type definition. It is not intended to be used in a real schema. It is only used to test the schema compiler. It is a group type definition that contains all possible fields.",
//   groups: [],
//   datasets: [],
//   attributes: [],
//   links: [],
// };

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
  value: ["SCALAR", ["", false]],
  required: false,
};

const anonymousGroupDec: AnonymousGroupTypeDec = {
  doc: "",
  name: "",
  groups: [],
  datasets: [],
  attributes: [],
  links: [],
};

const incGroupDec: IncGroupDec = {
  doc: "",
  neurodataTypeInc: ["None", null],
  quantityOrName: "",
};

const groupDec: GroupDec = ["ANONYMOUS", anonymousGroupDec];

const anonymousDatasetDec: AnonymousDatasetDec = {
  doc: "",
  name: "",
  shape: [],
  dtype: ["PRIMITIVE", "f32"],
  attributes: [],
};

const incDatasetDec: IncDatasetDec = {
  doc: "",
  neurodataTypeInc: ["None", null],
  quantityOrName: "",
};

const datasetDec: DatasetDec = ["ANONYMOUS", anonymousDatasetDec];

const linkDec: LinkDec = {
  doc: "",
  targetType: ["GROUP", ["None", null]],
  quantityOrName: "",
};

export const Initializers = {
  namespace: namespace,

  groupTypeDef: groupTypeDef,
  datasetTypeDef: datasetTypeDef,

  groupDec: groupDec,
  anonymousGroupDec: anonymousGroupDec,
  incGroupDec: incGroupDec,

  datasetDec: datasetDec,
  anonymousDatasetDec: anonymousDatasetDec,
  incDatasetDec: incDatasetDec,

  attributeDec: attributeDec,
  linkDec: linkDec,
};
