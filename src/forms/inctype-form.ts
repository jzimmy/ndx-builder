import { html, css } from "lit";
import { state, query, customElement } from "lit/decorators.js";
import { choose } from "lit/directives/choose.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";
import { modules, coreQuery } from "../data/nwbcore";
import { ProgressState } from "../logic/cpsform.ts";
import { assertNever } from "../main";
import { NamespaceTypesForm } from "./namespace-forms";
import {
  CoreType,
  TypeDef,
  NWBType,
  CoreDatasetType,
  CoreGroupType,
  GroupType,
  DatasetType,
  LinkDec,
} from "../nwb/spec";
import { Initializers } from "../nwb/spec-defaults";
import { symbols } from "../styles";
import { BasicTypeBuilderFormPage } from "./abstract-form";
import { HasDatasetIncType, HasGroupIncType } from "../index.ts";

// @rly or @oruebel TODO: fill me
// check src/data/nwbcore.ts for the list of core types
const commonTypes = new Set([]);

type Inctype<T> = {
  id: string;
  kind: "GROUP" | "DATASET";
  inctype: T;
};

function collectModulesIntoInctypeGetter(): {
  modname: string;
  inctypes: Inctype<() => CoreType>[];
}[] {
  let res = [];
  for (const modname in modules) {
    res.push({
      modname,
      inctypes: modules[modname].map(([kind, id]) => ({
        id,
        kind,
        inctype: () => coreQuery(id),
      })),
    });
  }
  return res;
}

function generateReverseInctypeMap<T>(
  modules: [string, Inctype<() => T>[]][]
): Map<string, { modIndex: number; tyIndex: number }> {
  let res = new Map();
  for (let i = 0; i < modules.length; i++) {
    let inctypes = modules[i][1];
    for (let j = 0; j < inctypes.length; j++) {
      res.set(inctypes[j].id, { modIndex: i, tyIndex: j });
    }
  }
  return res;
}

function addCommonModule<T>(
  modules: [string, Inctype<() => T>[]][],
  commonTypes: Set<string>
): typeof modules {
  return [
    [
      "Common",
      modules
        .flatMap(([_, inctypes]) => inctypes)
        .filter(({ id }) => commonTypes.has(id)),
    ],
    ...modules,
  ];
}

abstract class InctypeForm<T, U> extends BasicTypeBuilderFormPage<T> {
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

  // types within modules are retrieved lazily
  abstract modules: [name: string, inctype: Inctype<() => U>[]][];
  abstract noneTypes: Inctype<U>[];

  coreModulesLookupMap: Map<
    string,
    {
      modIndex: number;
      tyIndex: number;
    }
  > | null = null;

  // beware this one is hacky!
  // To do properly, bundle the data with the environment in the formchain
  get myTypes(): Inctype<U>[] {
    return (
      document.querySelector("namespace-types-form") as NamespaceTypesForm
    ).types
      .map(this.fromTypedef)
      .filter((t) => t !== null) as Inctype<U>[];
  }

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

  private renderIcon(kind?: "GROUP" | "DATASET") {
    if (kind == undefined) return html``;
    return html`<span class="material-symbols-outlined"
      >${kind == "GROUP" ? "folder" : "dataset"}</span
    >`;
  }

  private coreMenu() {
    return html`
      <div class="coremenu-grid">
        <div class="modulemenu">
          <h3>Modules</h3>
          ${map(
            this.modules,
            ([modname, _modtypes], i) => html`<div
              class=${classMap({
                inctype: true,
                selected: i == this.selectedModule,
              })}
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
          ${when(
            this.selectedModule != -1 && this.modules[this.selectedModule],
            () => html`
              ${map(
                this.modules[this.selectedModule][1],
                ({ id, inctype, kind }, i) => html`<div
                  class=${classMap({
                    inctype: true,
                    selected: i == this.selectedType,
                  })}
                  @click=${() => {
                    this.selectedType = i;
                    this.inctype = inctype();
                  }}
                >
                  ${this.renderIcon(kind)}
                  <div>${id}</div>
                </div>`
              )}
            `
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
          () => html`<div style="color: var(--color-border-alt);">
            No types defined
          </div>`,
          () => html`
            <div class="typelist">
              ${map(
                this.myTypes,
                ({ id, kind, inctype }, i) => html`<div
                  class=${classMap({
                    inctype: true,
                    selected: i == this.selectedType,
                  })}
                  @click=${() => {
                    this.selectedType = i;
                    this.inctype = inctype;
                  }}
                >
                  ${this.renderIcon(kind)}
                  <div>${id}</div>
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
          ({ id, kind, inctype }, i) => html`<div
            class=${classMap({
              selected: i == this.selectedType,
              inctype: true,
            })}
            @click=${() => {
              this.selectedType = i;
              this.inctype = inctype;
            }}
          >
            ${this.renderIcon(kind)}
            <div>${id}</div>
          </div>`
        )}
      </div>
    `;
  }

  setIncType(nwbtype: NWBType) {
    if (this.coreModulesLookupMap == null) {
      this.coreModulesLookupMap = generateReverseInctypeMap(this.modules);
    }

    let inctype = nwbtype[1];

    if (this.firstVisit && inctype[0] == "None") {
      this.category = InctypeForm.coreCategory;
      this.selectedModule = 0;
      this.selectedType = -1;
    } else if (inctype[0] == "Core") {
      this.category = InctypeForm.coreCategory;
      const indices = this.coreModulesLookupMap.get(
        inctype[1].neurodataTypeDef
      )!;
      this.selectedModule = indices.modIndex;
      this.selectedType = indices.tyIndex;
    } else if (inctype[0] == "None") {
      this.category = InctypeForm.noBaseCategory;
      this.selectedModule = -1;
      return;
    } else if (inctype[0] == "Typedef") {
      this.category = InctypeForm.myTypeCategory;
      this.selectedType = this.myTypes.findIndex(
        (t) => (t.id = inctype[1]!.neurodataTypeDef)
      );
    } else {
      assertNever(inctype[0]);
    }
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
      }

      .body > h2 {
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
        grid-template-columns: repeat(3, auto);
        margin-bottom: auto;
        width: 100%;
        height: 100%;
        padding: 2em;
      }

      .typelist > .inctype {
        display: flex;
        padding: 0.3em 0.5em;
        border-radius: 0.2em;
        cursor: pointer;
        margin: 0.4em;
        border: 1px solid var(--color-border-alt);
      }

      .typelist > .inctype > div {
        margin-left: 0.5em;
      }

      .typelist > .inctype.selected > div {
        text-decoration: underline;
      }

      .typelist > .inctype:hover {
        color: var(--clickable);
        border: 1px solid var(--clickable);
      }

      .typelist > .inctype.selected {
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
    `,
  ];
}
function collectModulesAsNWBTypes(): [string, Inctype<() => NWBType>[]][] {
  return collectModulesIntoInctypeGetter().map(({ modname, inctypes }) => [
    modname,
    inctypes.map((i) => {
      let { inctype, id, kind } = i;
      switch (kind) {
        case "DATASET":
          const incDst: Inctype<() => NWBType> = {
            id,
            kind,
            inctype: () => [
              "DATASET",
              ["Core", inctype()[1] as CoreDatasetType],
            ],
          };
          return incDst;
        case "GROUP":
          const incGrp: Inctype<() => NWBType> = {
            id,
            kind,
            inctype: () => ["GROUP", ["Core", inctype()[1] as CoreGroupType]],
          };
          return incGrp;
        default:
          throw new Error(`Unknown kind: ${kind}`);
      }
    }),
  ]);
}

@customElement("generic-inctype-form")
export class GenericInctypeForm extends InctypeForm<TypeDef, NWBType> {
  constructor() {
    super();
    this.modules = addCommonModule(collectModulesAsNWBTypes(), commonTypes);
  }
  @state()
  inctype: NWBType = ["GROUP", ["None", null]];

  fromTypedef(typedef: TypeDef): Inctype<NWBType> {
    let inctype: NWBType =
      typedef[0] == "GROUP"
        ? ["GROUP", ["Typedef", typedef[1]]]
        : ["DATASET", ["Typedef", typedef[1]]];
    return { id: typedef[1].neurodataTypeDef, inctype, kind: typedef[0] };
  }

  modules: [name: string, inctype: Inctype<() => NWBType>[]][];

  noneTypes: Inctype<NWBType>[] = [
    {
      inctype: ["GROUP", ["None", null]],
      kind: "GROUP",
      id: "Empty Group",
    },
    {
      inctype: ["DATASET", ["None", null]],
      kind: "DATASET",
      id: "Empty Dataset",
    },
  ];

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
  constructor() {
    super();
    const modules: typeof this.modules = collectModulesIntoInctypeGetter().map(
      ({ modname, inctypes }) => [
        modname,
        inctypes
          .filter(({ kind }) => kind == "GROUP")
          .map((t) => {
            let { id, kind, inctype } = t;
            return {
              id,
              kind,
              inctype: () => ["Core", inctype()[1]] as GroupType,
            };
          }),
      ]
    );
    this.modules = modules.filter((mod) => mod[1].length > 0);
  }

  @state()
  inctype: GroupType = ["None", null];

  fromTypedef(typedef: TypeDef): Inctype<GroupType> | null {
    if (typedef[0] == "GROUP") {
      return {
        id: typedef[1].neurodataTypeDef,
        kind: typedef[0],
        inctype: ["Typedef", typedef[1]],
      };
    } else {
      return null;
    }
  }

  modules: [name: string, inctype: Inctype<() => GroupType>[]][];

  noneTypes: Inctype<GroupType>[] = [
    {
      inctype: ["None", null],
      kind: "GROUP",
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
  constructor() {
    super();
    const modules: typeof this.modules = collectModulesIntoInctypeGetter().map(
      ({ modname, inctypes }) => [
        modname,
        inctypes
          .filter(({ kind }) => kind == "DATASET")
          .map((t) => {
            let { id, kind, inctype } = t;
            return {
              id,
              kind,
              inctype: () => ["Core", inctype()[1]] as DatasetType,
            };
          }),
      ]
    );
    this.modules = modules.filter((mod) => mod[1].length > 0);
  }

  inctype: DatasetType = ["None", null];

  fromTypedef(typedef: TypeDef): Inctype<DatasetType> | null {
    if (typedef[0] == "DATASET") {
      return {
        id: typedef[1].neurodataTypeDef,
        kind: typedef[0],
        inctype: ["Typedef", typedef[1]],
      };
    } else {
      return null;
    }
  }

  modules: [name: string, inctype: Inctype<() => DatasetType>[]][];
  noneTypes: Inctype<DatasetType>[] = [
    {
      inctype: ["None", null],
      kind: "DATASET",
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
  constructor() {
    super();
    this.modules = collectModulesAsNWBTypes();
  }

  inctype: NWBType = ["GROUP", ["None", null]];
  fromTypedef(typedef: TypeDef): Inctype<NWBType> | null {
    if (typedef[0] == "GROUP") {
      return {
        id: typedef[1].neurodataTypeDef,
        kind: typedef[0],
        inctype: ["GROUP", ["Typedef", typedef[1]]],
      };
    }
    return {
      id: typedef[1].neurodataTypeDef,
      kind: typedef[0],
      inctype: ["DATASET", ["Typedef", typedef[1]]],
    };
  }

  modules: [name: string, inctype: Inctype<() => NWBType>[]][] = [];
  noneTypes: Inctype<NWBType>[] = [];

  fill(val: LinkDec, progress?: ProgressState | undefined): void {
    super.fill(val, progress);
    this.setIncType(val.targetType);
  }

  transform(val: LinkDec): LinkDec {
    return { ...val, targetType: this.inctype };
  }
}
