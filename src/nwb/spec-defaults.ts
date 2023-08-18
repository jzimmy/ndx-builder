import {
  GroupTypeDef,
  DatasetTypeDef,
  Namespace,
  AttributeDec,
  GroupDec,
  AnonymousGroupDec,
  LinkDec,
  DatasetDec,
  AnonymousDatasetDec,
  IncGroupDec,
  IncDatasetDec,
} from "./spec";

const exampleAttrib: AttributeDec = {
  name: "Example attribute",
  doc: "This is an example attribute",
  required: false,
  value: ["SCALAR", ["Volts", false]],
  dtype: ["PRIMITIVE", "f32"],
};

const exampleGroupTypeDef: GroupTypeDef = {
  neurodataTypeDef: "ExampleGroupTypeDef",
  neurodataTypeInc: [
    "Core",
    {
      neurodataTypeDef: "TimeSeries",
      doc: "A base class for time series data",
    },
  ],
  doc: "This is an example time series",
  groups: [],
  datasets: [],
  attributes: [exampleAttrib],
  links: [],
};

const exampleDatasetTypeDef: DatasetTypeDef = {
  neurodataTypeDef: "ExampleDatasetTypeDef",
  neurodataTypeInc: [
    "Core",
    {
      neurodataTypeDef: "TimeSeriesDset",
      doc: "A base class for time series data",
      shape: [
        [
          [1, "label"],
          ["None", "label"],
        ],
      ],
      dtype: ["PRIMITIVE", "f32"],
    },
  ],
  doc: "This is an example time series dataset",
  shape: [
    [
      [1, "label"],
      ["None", "label2"],
    ],
  ],
  dtype: ["PRIMITIVE", "f32"],
  attributes: [exampleAttrib],
};

const exampleNamespace: Namespace = {
  fullname: "MyExampleNamespace",
  name: "ndx-example",
  doc: "This is an example namespace used to test the app",
  version: [0, 0, 1],
  authors: [
    ["John Doe", "jdoe@gmail.com"],
    ["Jane Doe", "janedoe@gmail.com"],
  ],
  typedefs: [
    ["GROUP", exampleGroupTypeDef],
    ["DATASET", exampleDatasetTypeDef],
  ],
};

const namespace: Namespace = {
  name: "ndx-",
  fullname: "",
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

const anonymousGroupDec: AnonymousGroupDec = {
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

  exampleNamespace: exampleNamespace,
};
