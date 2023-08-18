import { LitElement } from "lit";
import {
  GroupType,
  DatasetType,
  Defaultable,
  Quantity,
  AttributeDec,
  Shape,
  Dtype,
} from "./nwb/spec";

export interface HasGroupIncType {
  neurodataTypeInc: GroupType;
}

export interface HasDatasetIncType {
  neurodataTypeInc: DatasetType;
}

export interface HasTypeNameAndDescription {
  neurodataTypeDef: string;
  doc: string;
}

export interface HasInstanceNameAndDescription {
  name: string;
  doc: string;
}

export interface HasDefaultName {
  name?: Defaultable<string>;
}

export interface HasRequired {
  required: boolean;
}

export interface MaybeHasValue {
  value?: Defaultable<string>;
}

export interface HasQuantityOrName {
  quantityOrName: Quantity | string;
}

export interface AttributeAndShape {
  att: AttributeDec;
  shape: Shape[];
  dtype: Dtype;
}

export function NDXBuilderDefaultShowAndFocus(
  elem: LitElement,
  visibility: boolean,
  firstInput?: HTMLElement
) {
  elem.slot = visibility ? "currForm" : "";
  if (firstInput) firstInput.focus();
}
