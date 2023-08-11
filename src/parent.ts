import { LitElement, html, css } from "lit";
import { customElement } from "lit/decorators.js";
import {
  GroupType,
  DatasetType,
  Dtype,
  Defaultable,
  AttributeDec,
  Shape,
  Quantity,
} from "./nwb/spec";
import { Initializers } from "./nwb/spec-defaults";
import "./basic-elems";
import { symbols } from "./styles";
import { buildFormChains } from "./formchains";

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

export interface HasAxes {
  shape: Shape[];
  dtype: Dtype;
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

// form manager
@customElement("form-parent")
export class NdxFormParent extends LitElement {
  constructor() {
    super();
    let namespaceBuilderTrigger = buildFormChains(this);

    namespaceBuilderTrigger(
      Initializers.namespace,
      () => {
        throw new Error("Quit form start, unreachable");
      },
      (_) => {
        throw new Error("Quit form end, unreachable");
      }
    );
  }

  render() {
    return html`
      <h1>NWB Extension Builder</h1>
      <a href="">Need help?</a>
      <form>
        <slot name="currForm"></slot>
      </form>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        background: var(--color-background-alt);
        width: 100%;
        height: 100%;
        flex-direction: column;
      }

      form {
        flex-shrink: 0;
        margin: auto;
        display: flex;
        justify-content: center;
      }
    `,
  ];
}
