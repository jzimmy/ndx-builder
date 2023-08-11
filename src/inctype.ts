import { html, css } from "lit";
import { query, customElement, state } from "lit/decorators.js";
import { ProgressState, assertNever } from "./hofs";
import {
  HasGroupIncType,
  HasDatasetIncType,
  //   HasTypeNameAndDescription,
  //   HasDefaultName,
  //   HasInstanceNameAndDescription,
  //   HasAxes,
} from "./parent";
import { DatasetType, GroupType, LinkDec, NWBType, TypeDef } from "./nwb/spec";
import { BasicFormPage } from "./basic-form";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";
import { choose } from "lit/directives/choose.js";
import { NamespaceTypesForm } from "./namespace";
import { when } from "lit/directives/when.js";
import { Initializers } from "./nwb/spec-defaults";

type Inctype<T> = {
  id: string;
  inctype: T;
};

abstract class InctypeForm<T, U> extends BasicFormPage<T> {
  formTitle: string = "Choose a base type to extend";

  abstract inctype: U;

  abstract fromTypedef(typedef: TypeDef): Inctype<U> | null;

  @state()
  selectedModule: number = 0;

  @state()
  private _selectedType: number = -1;

  get selectedType() {
    return this._selectedType;
  }

  set selectedType(val: number) {
    this._selectedType = val;
    this._selfValidate();
  }

  static coreCategory = 0;
  static myTypeCategory = 1;
  static noBaseCategory = 2;

  categories: ("Core" | "My Types" | "No Base")[] = [
    "Core",
    "My Types",
    "No Base",
  ];

  @state()
  category = 0;

  @query("input[name=inctype-name]")
  firstInput!: HTMLElement;

  // pynwb core module names
  abstract modules: [name: string, inctype: Inctype<U>[]][];

  get myTypes(): Inctype<U>[] {
    return (
      document.querySelector("namespace-types-form") as NamespaceTypesForm
    ).types
      .map(this.fromTypedef)
      .filter((t) => t !== null) as Inctype<U>[];
  }

  abstract noneTypes: Inctype<U>[];

  //   noneTypes: {
  //     inctype: NWBType;
  //     name: string;
  //   }[] = [
  //     {
  //       inctype: ["GROUP", ["None", null]],
  //       name: "Empty Group",
  //     },
  //     {
  //       inctype: ["DATASET", ["None", null]],
  //       name: "Empty Dataset",
  //     },
  //   ];

  isValid(): boolean {
    return this.selectedType != -1;
  }

  clear(): void {
    this.selectedType = -1;
    this.category = 0;
  }

  fill(
    _val: T,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.drawProgressBar(progress);
  }

  private coreMenu() {
    return html`
      <div class="coremenu-grid">
        <div class="modulemenu">
          <h3>Modules</h3>
          ${map(
            this.modules,
            ([modname, _modtypes], i) =>
              html`<div
                class=${classMap({ selected: i == this.selectedModule })}
                @click=${() => {
                  this.selectedModule = i;
                  this.selectedType = -1;
                }}
              >
                ${modname}
              </div>`
          )}
        </div>
        <div class="typelist">
          ${map(
            this.modules[this.selectedModule][1],
            ({ id, inctype }, i) =>
              html`<div
                class=${classMap({ selected: i == this.selectedType })}
                @click=${() => {
                  this.selectedType = i;
                  this.inctype = inctype;
                }}
              >
                ${id}
              </div>`
          )}
        </div>
      </div>
    `;
  }

  private mineMenu() {
    return html`
      <div class="coremenu-grid">
        ${when(
          this.myTypes.length == 0,
          () =>
            html`<div style="color: var(--color-border-alt);">
              No types defined
            </div>`,
          () =>
            html`
              <div class="typelist">
                ${map(
                  this.myTypes,
                  ({ id, inctype }, i) =>
                    html`<div
                      class=${classMap({ selected: i == this.selectedType })}
                      @click=${() => {
                        this.selectedType = i;
                        this.inctype = inctype;
                      }}
                    >
                      ${id}
                    </div>`
                )}
              </div>
            `
        )}
      </div>
    `;
  }

  private noneMenu() {
    return html`
      <div class="typelist">
        ${map(
          this.noneTypes,
          ({ id, inctype }, i) =>
            html`<div
              class=${classMap({ selected: i == this.selectedType })}
              @click=${() => {
                this.selectedType = i;
                this.inctype = inctype;
              }}
            >
              ${id}
            </div>`
        )}
      </div>
    `;
  }

  setIncType(_inctype: NWBType) {
    // TODO
  }

  body() {
    return html`
      <div>
        <radio-input
          .options=${this.categories}
          .selected=${this.category}
          .onSelect=${(i: number) => {
            this.category = i;
            this.selectedType = -1;
            this._selfValidate();
          }}
        ></radio-input>
      </div>
      ${choose(this.category, [
        [InctypeForm.coreCategory, () => this.coreMenu()],
        [InctypeForm.myTypeCategory, () => this.mineMenu()],
        [InctypeForm.noBaseCategory, () => this.noneMenu()],
      ])}
    `;
  }

  static styles = [
    symbols,
    css`
      div.body {
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        min-width: 500px;
        position: relative;
      }

      div.body * {
        transition: 0.2s;
      }

      div.body > span {
        position: absolute;
        top: 0;
        right: 50%;
        transform: translate(1150%, 75%);
        cursor: pointer;
        border: 2px solid red;
      }

      h2 {
        margin: 0.5em;
      }

      div.body > div:first-child {
        // padding-bottom: 1em;
        border-bottom: 1px solid var(--color-border-alt);
        margin-bottom: 1em;
        width: 80%;
      }

      div.body > div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: auto;
        position: relative;
        width: 100%;
        transition: 0.3s;
      }

      div.body > div > h3 {
        margin: 0.5em 1em;
        min-width: 80px;
        padding: 0.3em 0.5em;
        text-align: center;
        cursor: pointer;
      }

      div.body > div > h3:hover {
        color: var(--clickable);
      }

      .selected {
        text-decoration: underline;
      }

      div.body > div > h3:not(:hover).selected {
        color: var(--clickable);
      }

      .coremenu-grid {
        padding: 1em;
        width: 100%;
        box-sizing: border-box;
        display: flex;
        justify-content: center;
      }

      .modulemenu {
        margin-right: 0.5em;
        position: relative;
        padding-right: 1em;
        border-right: 1px solid var(--color-border-alt);
      }

      .modulemenu > h3 {
        text-align: center;
        position: sticky;
        top: 0;
        margin: 0;
        padding: 0;
        background: var(--color-background-alt);
        border-bottom: 1px solid var(--color-border-alt);
      }

      .modulemenu > div {
        padding: 0.6em 0.5em;
        padding-bottom: 0.1em;
        border-bottom: 1px solid var(--color-border-alt);
        margin: 0 0.3em;
        cursor: pointer;
      }

      .modulemenu > div:hover {
        color: var(--clickable);
        border-bottom: 1px solid var(--clickable);
      }

      .modulemenu > div.selected {
        color: var(--clickable-hover);
        border-bottom: 2px solid var(--clickable-hover);
        text-decoration: none;
      }

      .modulemenu + .typelist {
        margin-right: auto;
      }

      .typelist {
        box-sizing: border-box;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        margin-bottom: auto;
        width: 400px;
        padding: 2em;
      }

      .typelist > div {
        padding: 0.3em 0.5em;
        border-radius: 0.2em;
        height: 1.5em;
        cursor: pointer;
        margin: 0.4em;
        border: 1px solid var(--color-border-alt);
      }

      .typelist > div:hover {
        color: var(--clickable);
        border: 1px solid var(--clickable);
      }

      .typelist > div.selected {
        border: 2px solid var(--clickable);
        color: var(--clickable);
        background: var(--background-light-button);
      }

      div.body > div:last-child {
        display: flex;
        padding: 0 2em;
        width: 100%;
        box-sizing: border-box;
      }

      div.body > div:last-child > dark-button {
        margin-left: auto;
      }

      .dummy {
        width: 80px;
        margin: 1em;
      }
    `,
  ];
}

@customElement("generic-inctype-form")
export class GenericInctypeForm extends InctypeForm<TypeDef, NWBType> {
  @state()
  inctype: NWBType = ["GROUP", ["None", null]];

  fromTypedef(typedef: TypeDef): Inctype<NWBType> {
    let inctype: NWBType =
      typedef[0] == "GROUP"
        ? ["GROUP", ["Typedef", typedef[1]]]
        : ["DATASET", ["Typedef", typedef[1]]];
    return { id: typedef[1].neurodataTypeDef, inctype };
  }

  modules: [name: string, inctype: Inctype<NWBType>[]][] = [];

  noneTypes: Inctype<NWBType>[] = [
    {
      inctype: ["GROUP", ["None", null]],
      id: "Empty Group",
    },
    {
      inctype: ["DATASET", ["None", null]],
      id: "Empty Dataset",
    },
  ];

  //   modules = [
  //     "core",
  //     "device",
  //     "ecephys",
  //     "file",
  //     "misc",
  //     "ophys",
  //     "processing",
  //     "time_series",
  //     "behavior",
  //     "ecephys",
  //   ];

  fill(val: TypeDef, progress?: ProgressState | undefined): void {
    super.fill(val, progress);
    this.drawProgressBar(progress);
    switch (val[0]) {
      case "GROUP":
        this.setIncType(["GROUP", val[1].neurodataTypeInc]);
        break;
      case "DATASET":
        this.setIncType(["DATASET", val[1].neurodataTypeInc]);
        break;
      default:
        assertNever(val[0]);
    }
  }

  transform(val: TypeDef): TypeDef {
    switch (this.inctype[0]) {
      case "GROUP":
        return [
          "GROUP",
          {
            ...(val[0] == "GROUP" ? val[1] : Initializers.groupTypeDef),
            neurodataTypeInc: this.inctype[1],
          },
        ];
      case "DATASET":
        return [
          "DATASET",
          {
            ...(val[0] == "DATASET" ? val[1] : Initializers.datasetTypeDef),
            neurodataTypeInc: this.inctype[1],
          },
        ];
      default:
        assertNever(this.inctype[0]);
    }
  }
}

@customElement("group-inctype-form")
export class GroupInctypeForm extends InctypeForm<HasGroupIncType, GroupType> {
  @state()
  inctype: GroupType = ["None", null];

  fromTypedef(typedef: TypeDef): Inctype<GroupType> | null {
    if (typedef[0] == "GROUP") {
      return {
        id: typedef[1].neurodataTypeDef,
        inctype: ["Typedef", typedef[1]],
      };
    } else {
      return null;
    }
  }

  modules: [name: string, inctype: Inctype<GroupType>[]][] = [];

  noneTypes: Inctype<GroupType>[] = [
    {
      inctype: ["None", null],
      id: "Empty Group",
    },
  ];

  transform = (val: HasGroupIncType) => {
    return { ...val, neurodataTypeInc: this.inctype };
  };

  fill(val: HasGroupIncType, prog?: ProgressState): void {
    super.fill(val, prog);
    const [kind, incType] = val.neurodataTypeInc;
    switch (kind) {
      case "Core":
        incType.neurodataTypeDef;
        break;
      case "Typedef":
        incType.neurodataTypeDef;
        break;
      case "None":
        break;
      default:
        assertNever(kind);
    }
  }
}

@customElement("dataset-inctype-form")
export class DatasetInctypeForm extends InctypeForm<
  HasDatasetIncType,
  DatasetType
> {
  inctype: DatasetType = ["None", null];

  fromTypedef(typedef: TypeDef): Inctype<DatasetType> | null {
    if (typedef[0] == "DATASET") {
      return {
        id: typedef[1].neurodataTypeDef,
        inctype: ["Typedef", typedef[1]],
      };
    } else {
      return null;
    }
  }

  modules: [name: string, inctype: Inctype<DatasetType>[]][] = [];
  noneTypes: Inctype<DatasetType>[] = [
    {
      inctype: ["None", null],
      id: "Empty Dataset",
    },
  ];

  transform(val: HasDatasetIncType): HasDatasetIncType {
    return { ...val, neurodataTypeInc: this.inctype };
  }
  fill(data: HasDatasetIncType, prog?: ProgressState): this {
    super.fill(data, prog);
    const [kind, incType] = data.neurodataTypeInc;
    switch (kind) {
      case "Core":
        incType.neurodataTypeDef;
        break;
      case "Typedef":
        incType.neurodataTypeDef;
        break;
      case "None":
        break;
      default:
        assertNever(kind);
    }
    return this;
  }
}

@customElement("target-inctype-browser")
export class TargetIncTypeForm extends InctypeForm<LinkDec, NWBType> {
  inctype: NWBType = ["GROUP", ["None", null]];
  fromTypedef(typedef: TypeDef): Inctype<NWBType> | null {
    if (typedef[0] == "GROUP") {
      return {
        id: typedef[1].neurodataTypeDef,
        inctype: ["GROUP", ["Typedef", typedef[1]]],
      };
    }
    return {
      id: typedef[1].neurodataTypeDef,
      inctype: ["DATASET", ["Typedef", typedef[1]]],
    };
  }
  modules: [name: string, inctype: Inctype<NWBType>[]][] = [];
  noneTypes: Inctype<NWBType>[] = [];

  fill(val: LinkDec, progress?: ProgressState | undefined): void {
    super.fill(val, progress);
    this.setIncType(val.targetType);
  }

  transform(val: LinkDec): LinkDec {
    return { ...val, targetType: this.inctype };
  }
}
