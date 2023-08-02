import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { when } from "lit/directives/when.js";
import { FormChain } from "./HOFS";
import {
  GroupType,
  DatasetType,
  Dtype,
  Defaultable,
  GroupTypeDef,
  DatasetTypeDef,
  Namespace,
  TypeDef,
  AttributeDec,
} from "./nwb/spec";
import { GenericInctypeFormpageElem } from "./inctype";
import {
  AxesFormpageElem,
  DatasetDefVizFormpageElem,
  GroupDefVizFormpageElem,
  TypenameFormpageElem,
} from "./typedef";
import {
  NamespaceMetadataFormpageElem,
  NamespaceStartFormpageElem,
  NamespaceTypesFormpageElem,
} from "./namespace";
import { Initializers } from "./nwb/spec-defaults";
import { CodegenFormpageElem } from "./codegen";
import { AttribInfoFormpageElem } from "./attrib";

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
  shape: [number, string][];
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

// form manager
@customElement("form-parent")
export class NdxFormParent extends LitElement {
  @property({ type: Boolean, reflect: true })
  formOpen = true;

  constructor() {
    super();

    const nsbSteps = [
      "Add custom types",
      "Define extension namespace",
      "Export extension generator script",
    ];

    const tydefSteps = [
      "Pick a base type",
      "Define type properties",
      "Add subcomponents",
    ];

    const attbSteps = ["Name attribute", "Define axes"];

    const dstSteps = [
      ...tydefSteps.slice(0, 1),
      "Name dataset type",
      "Define axes",
      ...tydefSteps.slice(2),
    ];

    const grpSteps = [
      ...tydefSteps.slice(0, 1),
      "Name group type",
      ...tydefSteps.slice(2),
    ];

    let attributeBuilderForm = new FormChain<AttributeDec>(
      new AttribInfoFormpageElem<AttributeDec>(),
      attbSteps,
      0
    )
      .then(new AxesFormpageElem(), attbSteps, 1)
      .withParent(this);

    let groupBuilderForm = new FormChain<GroupTypeDef>(
      new TypenameFormpageElem(),
      grpSteps,
      1
    ).then(new GroupDefVizFormpageElem(attributeBuilderForm), dstSteps, 3);

    let datasetBuilderForm = new FormChain<DatasetTypeDef>(
      new TypenameFormpageElem(),
      dstSteps,
      1
    )
      .then(new AxesFormpageElem(), dstSteps, 2)
      .then(new DatasetDefVizFormpageElem(attributeBuilderForm), dstSteps, 3);

    let typedefBuilderForm = new FormChain<TypeDef>(
      new GenericInctypeFormpageElem(),
      tydefSteps,
      0
    )
      .branch(
        ([k, _]) => k === "GROUP",
        // branch guarantees safety, so `as` cast is okay here
        groupBuilderForm.convert(
          (v) => ["GROUP", v] as TypeDef,
          ([_, g]) => g as GroupTypeDef
        ),
        datasetBuilderForm.convert(
          (v) => ["DATASET", v] as TypeDef,
          ([_, d]) => d as DatasetTypeDef
        )
      )
      .withParent(this);

    let namespaceBuilderForm = new FormChain<Namespace>(
      new NamespaceStartFormpageElem()
    )
      .then(new NamespaceTypesFormpageElem(typedefBuilderForm), nsbSteps, 0)
      .then(new NamespaceMetadataFormpageElem(), nsbSteps, 1)
      .then(new CodegenFormpageElem(), nsbSteps, 2)
      .withParent(this);

    namespaceBuilderForm(
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
      ${when(
        !this.formOpen,
        () => html`
          <input type="button" value="new_group" />
          <input type="button" value="new_dataset" />
        `
      )}
      <form>
        ${when(this.formOpen, () => html` <slot name="currForm"></slot> `)}
      </form>
    `;
  }

  static styles = [
    css`
      :host {
      }
    `,
  ];
}
