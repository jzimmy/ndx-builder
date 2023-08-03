import { TemplateResult, html, css } from "lit";
import { query, customElement, property, state } from "lit/decorators.js";
import { ProgressState, assertNever } from "./HOFS";
import {
  HasGroupIncType,
  HasDatasetIncType,
  //   HasTypeNameAndDescription,
  //   HasDefaultName,
  //   HasInstanceNameAndDescription,
  //   HasAxes,
} from "./parent";
import {
  DatasetType,
  DatasetTypeDef,
  GroupType,
  GroupTypeDef,
  TypeDef,
} from "./nwb/spec";
import { BasicFormPage } from "./basicform";
import { map } from "lit/directives/map.js";
import { classMap } from "lit/directives/class-map.js";
import { symbols } from "./styles";
import { choose } from "lit/directives/choose.js";

abstract class InctypeFormpageElem<T> extends BasicFormPage<T> {
  formTitle: string = "Choose a base type to extend";

  @state()
  selectedModule: number = 0;

  @property({ reflect: true })
  private _category: "Core" | "Typedef" | "None" = "Core";
  get category() {
    return this._category;
  }

  set category(val: "Core" | "Typedef" | "None") {
    this._category = val;
    this._selfValidate();
    if (val != "None") this.selectedType = -1;
  }

  @state()
  private _selectedType: number = -1;
  get selectedType() {
    return this._selectedType;
  }
  set selectedType(val: number) {
    this._selectedType = val;
    this._selfValidate();
  }

  isValid(): boolean {
    return this.category == "None" || this.selectedType != -1;
  }

  clear(): void {
    this.selectedType = -1;
    this.category = "Core";
  }

  @query("input[name=inctype-name]")
  firstInput!: HTMLElement;

  myTypes: string[] = [
    "mytype1",
    "mytype2",
    "mytype3",
    "mytype5",
    "mytype7",
    "mytype8",
  ];

  // pynwb core module names
  modules = [
    "core",
    "device",
    "ecephys",
    "file",
    "misc",
    "ophys",
    "processing",
    "time_series",
    "behavior",
    "ecephys",
  ];

  private coreMenu() {
    return html`
      <div class="coremenu-grid">
        <div class="modulemenu">
          <h3>Modules</h3>
          ${map(
            this.modules,
            (module, i) =>
              html`<div
                class=${classMap({ selected: i == this.selectedModule })}
                @click=${() => {
                  this.selectedModule = i;
                  this.selectedType = -1;
                }}
              >
                ${module}
              </div>`
          )}
        </div>
        <div class="typelist">
          ${map(
            this.modules.slice(0, this.modules[this.selectedModule].length),
            (module, i) =>
              html`<div
                class=${classMap({ selected: i == this.selectedType })}
                @click=${() => (this.selectedType = i)}
              >
                ${module}
              </div>`
          )}
        </div>
      </div>
    `;
  }

  private mineMenu() {
    return html`
      <div class="coremenu-grid">
        <div class="typelist">
          ${map(
            this.myTypes,
            (type, i) =>
              html`<div
                class=${classMap({ selected: i == this.selectedType })}
                @click=${() => (this.selectedType = i)}
              >
                ${type}
              </div>`
          )}
        </div>
      </div>
    `;
  }

  private noneMenu() {
    return html`
      <div class="typelist">
        <div class="dummy selected">None</div>
      </div>
    `;
  }

  private changeCategory(category: "Core" | "Typedef" | "None") {
    this.category = category;
    if (category != "None") this.selectedType = -1;
  }

  body() {
    return html`
      <div>
        <h3 class=${classMap({ selected: this.category == "Core" })}
            @click=${() => this.changeCategory("Core")}
        >
          Core Types
        </h3>
        ${
          this.myTypes.length > 0
            ? html`
                <h3
                  class=${classMap({ selected: this.category == "Typedef" })}
                  @click=${() => this.changeCategory("Typedef")}
                >
                  My Types
                </h3>
              `
            : html``
        }
        <h3 class=${classMap({ selected: this.category == "None" })}
            @click=${() => this.changeCategory("None")}
        >
          No Base
        </h3>
        <hr></hr>
      </div>
      ${choose(this.category, [
        ["Core", () => this.coreMenu()],
        ["Typedef", () => this.mineMenu()],
        ["None", () => this.noneMenu()],
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

      hr {
        position: absolute;
        top: 70%;
        width: 80%;
        transition: 0.3s;
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
export class GenericInctypeFormpageElem extends InctypeFormpageElem<TypeDef> {
  fill(val: TypeDef, progress?: ProgressState | undefined): void {
    this.drawProgressBar(progress);
  }
  transform(val: TypeDef): TypeDef {
    let [kind, def] = val;
    switch (kind) {
      case "GROUP":
        let groupInc: GroupType = ["None", null];
        let groupDef: GroupTypeDef = {
          ...(def as GroupTypeDef),
          neurodataTypeInc: groupInc,
        };
        return [kind, groupDef];
      case "DATASET":
        let datasetInc: DatasetType = ["None", null];
        return [
          kind,
          { ...(def as DatasetTypeDef), neurodataTypeInc: datasetInc },
        ];
      default:
        assertNever(kind);
    }
  }
}

@customElement("group-inctype-form")
export class GroupInctypeFormpageElem extends InctypeFormpageElem<HasGroupIncType> {
  transform = (data: HasGroupIncType) => {
    return {
      ...data,
      neurodataTypeInc: ["None", null] as GroupType,
    };
  };

  fill(data: HasGroupIncType): void {
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
  }
}

@customElement("dataset-inctype-form")
export class DatasetInctypeFormpageElem<
  T extends HasDatasetIncType
> extends InctypeFormpageElem<T> {
  transform = (data: T) => {
    return { ...data, neurodataTypeInc: ["None", null] };
  };
  fill(data: T): this {
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
