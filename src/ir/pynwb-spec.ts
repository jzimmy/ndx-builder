/***
 * This is an equivalent to the spec module, but loses information to match
 * the python api more closely. It should ONLY be used for python code generation.
 */

export type primitive = string;

export type NWBRefSpec = {
  targetType: string;
  reftype: "object";
};

export type NWBAttributeSpec = {
  name: string;
  doc: string;
  dtype: primitive | NWBRefSpec;
  shape?: number[];
  dims?: string[];
  required?: boolean;
  value?: string;
  defaultValue?: string;
};

export type NWBLinkSpec = {
  doc: string;
  name?: string;
  targetType: string;
  quantity?: string | number;
};

export type NWBDtypeSpec = {
  name: string;
  doc: string;
  dtype: primitive | NWBDtypeSpec[] | NWBRefSpec;
};

export type NWBDatasetSpec = {
  doc: string;
  name?: string;
  dtype?: primitive | NWBDtypeSpec[] | NWBRefSpec;
  default_name?: string;
  shape?: number[];
  dims?: string[];
  attributes?: NWBAttributeSpec[];
  linkable?: "True";
  quantity?: string | number;
  neurodataTypeDef?: string;
  neurodataTypeInc?: string;
};

export type NWBGroupSpec = {
  doc: string;
  name?: string;
  shape?: number[];
  dims?: string[];
  groups?: NWBGroupSpec[];
  datasets?: NWBDatasetSpec[];
  attributes?: NWBAttributeSpec[];
  links?: NWBLinkSpec[];
  linkable?: "True";
  quantity?: string | number;
  neurodataTypeDef?: string;
  neurodataTypeInc?: string;
};

export type NWBNamespaceSpec = {
  doc: string;
  name: string;
  fullName?: string;
  version?: number[];
  author?: string[];
  contact?: string[];
};

// this typescript nonsense helps ensure that typeof string != typeof pythonID
enum _UNIQUE_PYTHONID_ {
  _ = "UNIQUE",
}

export type PythonID = string & _UNIQUE_PYTHONID_;

export type Flattened<T> = {
  id: PythonID;
  spec: T;
};
