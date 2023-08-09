import { LitElement, TemplateResult, html } from "lit";
import { BasicFormPage } from "./basic-form";
import { ProgressState } from "./hofs";
import { HasQuantityOrName } from "./parent";
import { customElement, property, query } from "lit/decorators.js";
import { quantityOrNameString } from "./typeviz";
import { classMap } from "lit/directives/class-map.js";
import {
  CoreDatasetType,
  CoreGroupType,
  DatasetType,
  DatasetTypeDef,
  Defaultable,
  Dtype,
  GroupType,
  GroupTypeDef,
  Quantity,
  Shape,
} from "./nwb/spec";
import { CoreTypeId } from "./data/nwbcore";

type OK = "OK";

abstract class NdxInputElem<T> extends LitElement {
  abstract isValid(): boolean;
  abstract firstElement?: HTMLElement;
  abstract fill(val: T): void;
  abstract value(): T | null;
  abstract clear(): void;
}

@customElement("quantity-or-name-input")
export class QuantityOrNameInput extends NdxInputElem<Quantity | string> {
  isValid(): boolean {
    return true;
  }
  firstElement?: HTMLElement | undefined;
  fill(val: string | Quantity): void {
    throw new Error("Method not implemented.");
  }
  value(): string | Quantity | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("value-input")
export class ValueInput extends NdxInputElem<string> {
  isValid(): boolean {
    return true;
  }
  firstElement?: HTMLElement | undefined;
  fill(val: string): void {
    throw new Error("Method not implemented.");
  }
  value(): string | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("shape-input")
export class ShapeInput extends NdxInputElem<Shape[]> {
  isValid(): boolean {
    throw new Error("Method not implemented.");
  }
  firstElement?: HTMLElement | undefined;
  fill(val: Shape[]): void {
    throw new Error("Method not implemented.");
  }
  value(): Shape[] | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("inctype-input")
export class IncTypeInput extends NdxInputElem<GroupType | DatasetType> {
  isValid(): boolean {
    throw new Error("Method not implemented.");
  }
  firstElement?: HTMLElement | undefined;
  fill(
    val:
      | ["Core", CoreGroupType]
      | ["Typedef", GroupTypeDef]
      | ["None", null]
      | ["Core", CoreDatasetType]
      | ["Typedef", DatasetTypeDef]
  ): void {
    throw new Error("Method not implemented.");
  }
  value():
    | ["Core", CoreGroupType]
    | ["Typedef", GroupTypeDef]
    | ["None", null]
    | ["Core", CoreDatasetType]
    | ["Typedef", DatasetTypeDef]
    | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("shape-or-scalar-input")
export class ShapeOrScalarInput extends NdxInputElem<
  ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>]
> {
  isValid(): boolean {
    throw new Error("Method not implemented.");
  }
  firstElement?: HTMLElement | undefined;
  fill(val: ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>]): void {
    throw new Error("Method not implemented.");
  }
  value(): ["SHAPE", Shape[]] | ["SCALAR", Defaultable<string>] | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("checkbox-input")
export class CheckboxInput extends NdxInputElem<boolean> {
  isValid(): boolean {
    throw new Error("Method not implemented.");
  }
  firstElement?: HTMLElement | undefined;
  fill(val: boolean): void {
    throw new Error("Method not implemented.");
  }
  value(): boolean | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("dtype-input")
export class DtypeInput extends NdxInputElem<Dtype> {
  isValid(): boolean {
    throw new Error("Method not implemented.");
  }
  firstElement?: HTMLElement | undefined;
  fill(val: Dtype): void {
    throw new Error("Method not implemented.");
  }
  value(): Dtype | null {
    throw new Error("Method not implemented.");
  }
  clear(): void {
    throw new Error("Method not implemented.");
  }
}
