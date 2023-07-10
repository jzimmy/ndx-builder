import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { symbols } from "../../styles";
import { map } from "lit/directives/map.js";
import { NdxTypes } from "./ndx-types";
import {
  DatasetTypeDef,
  Defaultable,
  Dtype,
  GroupTypeDef,
  PrimitiveDtype,
  TypeDef,
} from "../../nwb/spec";
import { TypedefKind } from "./typedef";

const coreModules: IncTypeGroup[] = [
  {
    name: "ElectricalSeries",
    types: [
      {
        typename: "ElectricalSeries1",
        dtype: ["PRIMITIVE", PrimitiveDtype.f32],
      },
      { typename: "ElectricalSeries2" },
      { typename: "ElectricalSeries3" },
      { typename: "ElectricalSeries4" },
    ],
  },
  {
    name: "Behavioral",
    types: [
      { typename: "Behavioral1" },
      { typename: "Behavioral2" },
      { typename: "Behavioral3" },
      { typename: "Behavioral4" },
    ],
  },
  {
    name: "LabMetadata",
    types: [
      { typename: "Metadata1" },
      { typename: "Metadata2" },
      { typename: "Metadata3" },
      { typename: "Metadata4" },
    ],
  },
];

type IncTypeInfo = {
  typename: string;
  name?: Defaultable<string>;
  shape?: [number, string][];
  dtype?: Dtype;
};

type IncTypeGroup = {
  name: string;
  types: IncTypeInfo[];
};

const noneIncType: IncTypeInfo = {
  typename: "None",
};

@customElement("group-inctype-browser")
export class GroupIncTypeBrowser extends LitElement {
  @property({ type: Function })
  returnCallback = (_incType: IncTypeInfo) => {
    console.log("GOT", _incType);
    this.remove();
    throw new Error("DELETE ME!!!");
  };

  @state()
  typeCategory: "CORE" | "MINE" | "NONE" = "CORE";

  @state()
  types: ["TYPES", IncTypeInfo[]] | ["CORE_MODULES", IncTypeGroup[]] = [
    "CORE_MODULES",
    coreModules,
  ];

  @state()
  selectedIdx: number = -1;

  readonly kind: TypedefKind = "GROUP";

  parent = document.querySelector("ndx-types-builder")! as NdxTypes;

  private continueFn() {
    const [tableKind, tableItems] = this.types;
    switch (tableKind) {
      case "CORE_MODULES":
        this.types = ["TYPES", tableItems[this.selectedIdx].types];
        this.selectedIdx = -1;
        break;
      case "TYPES":
        switch (this.typeCategory) {
          case "NONE":
            return this.returnCallback({ ...noneIncType });
          case "MINE":
          case "CORE":
            if (this.selectedIdx != -1)
              this.returnCallback(tableItems[this.selectedIdx]);
        }
    }
  }

  private canContinue() {
    return this.typeCategory == "NONE" || this.selectedIdx != -1;
  }

  private pickCoreType() {
    this.typeCategory = "CORE";
    this.types = ["CORE_MODULES", coreModules];
  }

  private pickMyType() {
    this.typeCategory = "MINE";
    if (this.parent) {
      this.types = [
        "TYPES",
        this.convertTypedefsToIncTypeInfos(this.parent.typesEnvironment),
      ];
    }
  }

  convertTypedefsToIncTypeInfos(ts: TypeDef[]): IncTypeInfo[] {
    const convertGroup: (t: TypeDef) => IncTypeInfo = ([_, t]) => {
      const g = t as GroupTypeDef;
      return {
        typename: g.neurodataTypeDef,
        name: g.name,
      };
    };

    const convertDataset: (t: TypeDef) => IncTypeInfo = ([_, t]) => {
      const d = t as DatasetTypeDef;
      return {
        typename: d.neurodataTypeDef,
        name: d.name,
        shape: d.shape,
        dtype: d.dtype,
      };
    };

    return ts
      .filter(([k, _]: TypeDef) => k == this.kind)
      .map(this.kind == "GROUP" ? convertGroup : convertDataset);
  }

  private pickNoType() {
    this.typeCategory = "NONE";
    this.types = ["TYPES", []];
  }

  private table() {
    // preconstruct the table to appease typescript exhaustive typechecking
    const [tableKind, tableItems] = this.types;
    switch (tableKind) {
      case "TYPES":
        return html` ${this.typeCategory != "NONE"
            ? html`<h2>Types</h2>`
            : html``}
          <div class="table">
            ${map(
              tableItems,
              (t, i) => html`<div
                class=${this.selectedIdx == i ? "picked" : ""}
                @click=${() => (this.selectedIdx = i)}
              >
                ${t.typename}
              </div>`
            )}
          </div>`;
      case "CORE_MODULES":
        return html`<h2>Modules</h2>
          <div class="table">
            ${map(
              tableItems,
              (t, i) => html`<div
                class=${this.selectedIdx == i ? "picked" : ""}
                @click=${() => (this.selectedIdx = i)}
              >
                ${t.name}
              </div>`
            )}
          </div>`;
    }
  }

  render() {
    const canContinue = this.canContinue();
    return html`<h1>
        Pick a ${this.kind.toLocaleLowerCase()} to extend
        <span @click=${this.remove} class="material-symbols-outlined"
          >close</span
        >
      </h1>
      <div class="core-or-mine">
        <div
          @click=${this.pickCoreType}
          class=${this.typeCategory == "CORE" ? "picked" : ""}
        >
          NWB Core Types
        </div>
        ${this.parent.typesEnvironment.length > 0
          ? html`<div
              @click=${this.pickMyType}
              class=${this.typeCategory == "MINE" ? "picked" : ""}
            >
              MyTypes
            </div>`
          : html``}
        <div
          @click=${this.pickNoType}
          class=${this.typeCategory == "NONE" ? "picked" : ""}
        >
          No Base Type
        </div>
      </div>
      ${this.table()}
      <div
        @click=${canContinue ? this.continueFn : () => {}}
        class=${canContinue ? "enabled" : ""}
      >
        Continue
      </div> `;
  }

  static styles = [
    symbols,
    css`
      :host {
        position: absolute;
        background: var(--color-background-alt);
        border: 2px solid var(--color-border-alt);
        border-radius: 2em;
        display: flex;
        flex-direction: column;
        padding-bottom: 2em;
      }

      :host > * {
        display: flex;
        flex-direction: row;
        justify-content: center;
      }

      h1 {
        box-sizing: border-box;
        background: var(--color-background);
        padding: 1em 2em;
        border-bottom: 1px solid var(--color-border-alt);
      }

      h1,
      h2 {
        margin: 0;
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      h1 > span {
        margin-left: auto;
        margin-right: 0.5em;
        cursor: pointer;
      }

      :host > .core-or-mine {
        margin: 1em 3em;
        font-size: 2em;
        gap: 6%;
      }

      .core-or-mine > div {
        padding: 0.3em 0.5em;
        color: var(--clickable);
        cursor: pointer;
        border-radius: 0.5em;
        background: var(--color-background);
        border: 1px solid var(--color-border-alt);
      }

      .core-or-mine > div.picked,
      .table .picked {
        text-decoration: underline;
        border: 2px solid var(--clickable-hover);
        color: var(--clickable-hover);
      }
      .table .picked {
        font-weight: bold;
      }

      .table {
        margin: 0 auto;
        max-width: 600px;
        min-width: 400px;
        flex-wrap: wrap;
      }

      .table > div {
        padding: 2em 1em;
        min-width: 5em;
        border: 2px solid var(--color-border-alt);
        margin: 0.2em;
        background: var(--color-background);
      }

      :host > div:last-child {
        margin-top: 2em;
        margin-left: auto;
        margin-right: 4em;
        padding: 0.3em 0.8em;
        color: #fff;
        background: var(--clickable);
        border-radius: 0.3em;
        font-weight: 600;
        opacity: 50%;
        cursor: default;
      }
      :host > div:last-child.enabled:hover {
        background: var(--clickable-hover);
      }

      :host > div:last-child.enabled {
        cursor: pointer;
        opacity: 100%;
      }
    `,
  ];
}
