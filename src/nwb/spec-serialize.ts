import {
  DatasetTypeDef,
  Dtype,
  GroupTypeDef,
  Namespace,
  Quantity,
} from "./spec";

function namespace(_: Namespace): string {
  return "";
}

function groupTypeDef(_: GroupTypeDef): string {
  return "";
}

function datasetTypeDef(_: DatasetTypeDef): string {
  return "";
}

function dtype(_: Dtype): string {
  return "";
}

function quantity(_: Quantity): string {
  return "";
}

function GroupDec(_: GroupTypeDef): string {
  return "";
}

function DatasetDec(_: DatasetTypeDef): string {
  return "";
}

function AttributeDec(_: DatasetTypeDef): string {
  return "";
}

function LinkDec(_: DatasetTypeDef): string {
  return "";
}

function asConstVariable(varname: string, tyname: string, obj: Object): string {
  return `
    const ${varname}: ${tyname} = ${JSON.stringify(obj)};
  `;
}
