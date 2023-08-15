/***
 * This is an equivalent to the spec module, but loses information to match
 * the python api more closely. It should ONLY be used for python code generation.
 */

// typescript hack to ensure CoreTypeName != string
enum __UNIQUE__ {
  _ = "",
}
export type CoreTypeName = string & __UNIQUE__;

export type primitive = string;

export type NWBRefSpec = {
  target_type: string;
  reftype: "object";
};

export type NWBAttributeSpec = {
  name: string;
  doc: string;
  dtype: primitive | NWBRefSpec;
  shape?: (number | "None")[][];
  dims?: string[][];
  required?: boolean;
  value?: string;
  default_value?: string;
};

export type NWBLinkSpec = {
  doc: string;
  name?: string;
  target_type: string;
  quantity?: string | number;
};

export type NWBDtypeSpec = {
  name: string;
  doc: string;
  dtype: primitive | NWBRefSpec;
};

export type NWBDatasetSpec = {
  doc: string;
  name?: string;
  dtype?: primitive | NWBDtypeSpec[] | NWBRefSpec;
  default_name?: string;
  shape?: (number | "None")[][];
  dims?: string[][];
  attributes?: NWBAttributeSpec[];
  linkable?: "True";
  quantity?: string | number;
  neurodata_type_def?: string;
  neurodata_type_inc?: string;
};

export type NWBGroupSpec = {
  doc: string;
  name?: string;
  default_name?: string;
  groups?: NWBGroupSpec[];
  datasets?: NWBDatasetSpec[];
  attributes?: NWBAttributeSpec[];
  links?: NWBLinkSpec[];
  linkable?: "True";
  quantity?: string | number;
  neurodata_type_def?: string;
  neurodata_type_inc?: string;
};

export type NWBNamespaceSpec = {
  doc: string;
  name: string;
  full_name?: string;
  version?: number[];
  author?: string[];
  contact?: string[];
};
