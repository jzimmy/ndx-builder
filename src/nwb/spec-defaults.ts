import { GroupTypeDef, DatasetTypeDef, Namespace, AttributeDec } from "./spec";

export const Initializers = {
  groupTypeDef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    groups: [],
    datasets: [],
    attributes: [],
    links: [],
  } as GroupTypeDef,
  datasetTypeDef: {
    neurodataTypeDef: "",
    neurodataTypeInc: ["Core", "None"],
    doc: "",
    attributes: [],
    shape: [],
    dtype: ["PRIMITIVE", "f32"],
  } as DatasetTypeDef,
  namespace: {
    name: "",
    doc: "",
    version: [0, 1, 0],
    authors: [],
    typedefs: [],
  } as Namespace,
  attributeDec: {
    name: "",
    doc: "",
    dtype: ["PRIMITIVE", "f32"],
    shape: [],
    required: false,
  } as AttributeDec,
};
