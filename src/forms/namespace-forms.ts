import "../basic-elems";
import { PropertyValueMap, TemplateResult, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import {
  DatasetDec,
  Dtype,
  GroupDec,
  LinkDec,
  Namespace,
  TypeDef,
} from "../nwb/spec";
import { ProgressState } from "../logic/cpsform";
import { assertNever } from "../main";
import { CPSForm } from "../logic/cpsform";
import { BasicFormPage } from "./abstract-form";
import { NDXBuilderDefaultShowAndFocus } from "../parent";
import { FormStepBar, iconOf } from "../basic-elems";
import { Initializers } from "../nwb/spec-defaults";
import { when } from "lit/directives/when.js";
import { symbols } from "../styles";
import { classMap } from "lit/directives/class-map.js";
import { NameInput } from "../inputs/value-input";
import { ValueInput } from "../inputs/value-input";
import { Trigger } from "../logic/hofs";

@customElement("new-or-existing-namespace-form")
export class NamespaceStartForm extends CPSForm<Namespace> {
  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  usingExisting: boolean = false;

  formTitle: string = "";

  isValid(): boolean {
    return true;
  }

  @property({ type: Function })
  triggerUpload: () => void = () => {};

  addDebugTrigger<T>(trigger: Trigger<T>, init: T) {
    this.triggerUpload = () => {
      this.showAndFocus(false);
      trigger(
        init,
        () => {
          this.showAndFocus(true);
        },
        (v) => {
          this.showAndFocus(true);
          console.log(v);
        }
      );
    };
    return this;
  }

  render() {
    return html`
      <big-button .icon=${"feed"} @click=${this.next}
        >Create new NWB extension</big-button
      >
      <big-button .icon=${"upload"} @click=${() => this.triggerUpload()}
        >Upload existing extension</big-button
      >
    `;
  }

  @query("input[name=create-new]")
  createNewButton!: HTMLInputElement;

  get firstInput(): HTMLElement {
    return this.createNewButton;
  }

  fill(
    _val: Namespace,
    _progress?: { states: string[]; currState: number } | undefined
  ): void {}

  transform(val: Namespace): Namespace {
    return !this.usingExisting ? val : this.parseNamespace(val);
  }

  private parseNamespace(val: Namespace): Namespace {
    return val;
  }

  clear(): void {}

  static styles = [
    symbols,
    css`
      :host {
        margin: auto;
        display: flex;
        flex-wrap: wrap;
      }

      :host > big-button {
        margin: 1em;
      }
    `,
  ];
}

@customElement("namespace-metadata-form")
export class NamespaceMetadataForm extends BasicFormPage<Namespace> {
  hideQuit: boolean = true;

  formTitle: string = "Metadata for your extension";

  @state()
  _authors: [string, string][] = [["", ""]];

  get authors(): [string, string][] {
    return this._authors;
  }

  set authors(val: [string, string][]) {
    this._authors = val;
    this._selfValidate();
  }

  isValid(): boolean {
    return (
      this.authors.every(([name, contact]) => name !== "" && contact !== "") &&
      this.namespaceNameInput.value()?.match(/^ndx-/) !== null &&
      this.versionInput.value() !== null
    );
  }

  authorTable(): TemplateResult<1> {
    return html`
      <div>
        ${map(
          this.authors,
          ([name, contact], i) =>
            html`
              <label for="author-name${i}">Author name</label>
              <input
                type="text"
                name="author-name${i}"
                .value=${name}
                @input=${(e: Event) => {
                  this.authors[i][0] = (e.target as HTMLInputElement).value;
                  this._selfValidate();
                }}
              />
              <label for="author-contact${i}">Author contact</label>
              <input
                type="text"
                name="author-contact${i}"
                .value=${contact}
                @input=${(e: Event) => {
                  this.authors[i][1] = (e.target as HTMLInputElement).value;
                  this._selfValidate();
                }}
              />
              ${when(
                this.authors.length > 1,
                () => html`<input
                  type="button"
                  value="remove"
                  @click=${() => {
                    this.authors = [
                      ...this.authors.slice(0, i),
                      ...this.authors.slice(i + 1),
                    ];
                  }}
                />`
              )}
            `
        )}
      </div>
    `;
  }

  @query("name-input")
  namespaceNameInput!: NameInput;

  @query("version-input")
  versionInput!: VersionInput;

  body(): TemplateResult<1> {
    return html`
      <step-bar></step-bar>
      <name-input
        label="Name your namespace. Must start with 'ndx-'"
        .onInteraction=${() => this._selfValidate()}
      >
      </name-input>
      <version-input
        name="namespace-version"
        label="Namespace version"
        .onInteraction=${() => this._selfValidate()}
      ></version-input>

      <label for="namespace-authors">Namespace authors</label>
      ${this.authorTable()}
      <input
        type="button"
        value="add author"
        @click=${() => {
          this.authors = [...this.authors, ["", ""]];
        }}
      />
    `;
  }

  @query("input[name=namespace-name]")
  firstInput!: HTMLInputElement;

  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.drawProgressBar(progress);
    if (val.authors.length !== 0) this.authors = [...val.authors];
    this.versionInput.fill(val.version);
    if (val.name !== "") this.namespaceNameInput.fill(val.name);
    this._selfValidate();
  }

  transform(val: Namespace): Namespace {
    let name = this.namespaceNameInput.value();
    let version = this.versionInput.value();
    let authors = this.authors;
    if (name === null || version === null || authors.length == 0) return val;
    return { ...val, name, version, authors };
  }

  clear(): void {
    this.authors = [];
  }
}

@customElement("version-input")
export class VersionInput extends ValueInput<[number, number, number]> {
  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.inputElem.placeholder = "0.0.1";
  }

  isValid: () => boolean = () => {
    return this.inputElem.value.match(/\d+\.\d+\.\d+/) !== null;
  };

  fill(val: [number, number, number]): void {
    this.inputElem.value = val.join(".");
  }

  value(): [number, number, number] | null {
    if (!this.isValid) return null;
    const [major, minor, patch] = this.inputElem.value
      .split(".")
      .map((v) => parseInt(v));
    return [major, minor, patch];
  }
}

@customElement("namespace-types-form")
export class NamespaceTypesForm extends CPSForm<Namespace> {
  constructor(
    typeBuilderTrigger: Trigger<TypeDef>,
    typeEditorTrigger: Trigger<TypeDef>
  ) {
    super();
    this.triggerTypeBuilder = () => {
      this.showAndFocus(false);
      typeBuilderTrigger(
        ["GROUP", Initializers.groupTypeDef],
        () => this.showAndFocus(true),
        (v) => {
          this.showAndFocus(true);
          this.types = [...this.types, v];
        }
      );
    };

    this.triggerTypeEditor = (initializer, index) => {
      this.showAndFocus(false);
      typeEditorTrigger(
        initializer,
        () => this.showAndFocus(true),
        (v) => {
          this.types = [
            ...this.types.slice(0, index),
            v,
            ...this.types.slice(index + 1),
          ];
        }
      );
    };
  }

  @property()
  types: TypeDef[] = [];

  @query("step-bar")
  stepBar!: FormStepBar;

  fill(val: Namespace, progress?: ProgressState): void {
    this.stepBar.setProgressState(progress);
    if (val.typedefs.length !== 0) this.types = [...val.typedefs];
  }

  transform(val: Namespace): Namespace {
    val.typedefs = [...this.types];
    return val;
  }

  clear(): void {
    this.types = [];
  }

  @property({ type: Function })
  triggerTypeBuilder: () => void = () => {};

  @property({ type: Function })
  triggerTypeEditor: (initializer: TypeDef, index: number) => void = () => {};

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  get ready(): boolean {
    return this.types.length === 0;
  }

  @state()
  selected: number = -1;

  private handleDelete(index: number) {
    let tyname = this.types[index][1].neurodataTypeDef;
    for (let type of this.types) {
      if (referenceCollision(type, tyname)) {
        alert(
          `Cannot delete type ${tyname} that is referenced in somewhere in other type ${type[1].neurodataTypeDef}.\nEdit ${type[1].neurodataTypeDef} to remove the reference first.`
        );
        return;
      }
    }
    this.types = [
      ...this.types.slice(0, index),
      ...this.types.slice(index + 1),
    ];
  }

  render() {
    return html`
      <back-or-quit-bar
        .back=${() => this.back()}
        .hideQuit=${true}
      >
        <step-bar></step-bar>
      </back-or-quit-bar>
      <div class="body">
        <div class="typesbar">
          <h2>My Types</h2>
          <hr />
          <ul>
            ${when(
              this.types.length === 0,
              () => html`<li class="nonemsg">No types yet</li>`
            )}
        ${map(
          this.types,
          ([kind, ty], i) => html` <li
            class=${classMap({ selected: i == this.selected })}
            @click=${() => (this.selected = i)}
          >
            <span class="material-symbols-outlined">${iconOf(kind)}</span>
            ${ty.neurodataTypeDef}
          </li>`
        )}
          </ul>
        </div>
        <div class="sidespace">
            ${when(
              this.selected !== -1,
              () => html`
                <div class="inspector">
                  <span
                    class="material-symbols-outlined"
                    id="close"
                    @click=${() => (this.selected = -1)}
                    >close</span
                  >
                  <span
                    class="material-symbols-outlined"
                    @click=${() =>
                      this.triggerTypeEditor(
                        this.types[this.selected],
                        this.selected
                      )}
                    >edit</span
                  >
                  <span
                    class="material-symbols-outlined"
                    @click=${() => this.handleDelete(this.selected)}
                    >delete</span
                  >
                </div>
                <div class="preview">
                  <h2>${this.types[this.selected][1].neurodataTypeDef}</h2>
                  <div class="extends">
                    <div class="keyword">extends</div>
                    <div class="inctype">
                      ${this.types[this.selected][1].neurodataTypeInc[1]
                        ?.neurodataTypeDef || "None"}
                    </div>
                  </div>
                  <div class="description">
                    ${this.types[this.selected][1].doc}
                  </div>
                </div>
              `,
              () =>
                html`<light-button @click=${() => this.triggerTypeBuilder()}
                  >Create a type &nbsp;
                  <span class="material-symbols-outlined"
                    >add</span
                  ></light-button
                >`
            )}
        </div>
      </div>
      <continue-bar
        type="button"
        .disabled=${this.ready}
        value="continue"
        .continue=${() => this.next()}
      />
      </continue-bar>
    `;
  }

  static styles = [
    symbols,
    css`
      :host,
      .typesbar {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1em;
      }

      .typesbar {
        flex: 0 0 auto;
        border-right: 1px solid var(--color-border-alt);
      }

      :host * {
        transition: 0.2s;
      }

      .body {
        display: flex;
        margin: 2em;
      }

      .sidespace {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 1;
        min-width: 20em;
        padding: 2em;
      }

      h2 {
        margin: 0;
      }

      hr {
        position: relative;
        border: 0.5px solid var(--color-border-alt);
        width: 100%;
      }

      ul {
        margin: 0;
        padding: 0em;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      li {
        list-style: none;
        border-bottom: 1px solid var(--color-border-alt);
        padding: 0.2em;
        margin: 0.3em;
        cursor: pointer;
      }

      li,
      li > span.material-symbols-outlined {
        font-size: 1.5em;
      }

      li:hover {
        color: var(--clickable);
        border-color: var(--clickable);
      }

      li.selected {
        border-bottom: 3px solid var(--clickable-hover);
        color: var(--clickable-hover);
      }

      li.nonemsg {
        opacity: 0.5;
        border: none;
        margin: 1em 0;
      }

      .inspector {
        display: flex;
        width: 100%;
      }

      .inspector > span {
        margin: 0.25em;
        padding: 0.1em;
        padding-bottom: 0.3em;
        cursor: pointer;
        transition: 0.2s;
        border-radius: 0.2em;
      }

      .inspector > span.material-symbols-outlined:hover:not(:last-child) {
        color: var(--clickable);
        padding: 0.2em;
        background-color: var(--background-light-button);
      }

      .inspector > span.material-symbols-outlined:hover {
        padding: 0.2em;
        background-color: #ffb3b3;
      }

      .inspector > span#close {
        margin-left: auto;
      }

      .inspector > span:last-child {
        margin-left: 1em;
      }

      .preview {
        border: 1px solid var(--color-border-alt);
        border-radius: 0.5em;
        padding: 1em;
        background: var(--color-background);
        // box-shadow: 0 0 0.5em var(--color-border-alt);
      }

      .extends {
        display: flex;
        font-size: 1.2em;
        align-items: center;
        border-bottom: 1px solid var(--color-border-alt);
        padding-bottom: 0.5em;
      }

      .keyword {
        margin-left: auto;
        color: var(--clickable);
        font-weight: bold;
      }

      .inctype {
        margin-left: 0.5em;
        border: 1px solid var(--color-border-alt);
        padding: 0.1em 0.3em;
      }
    `,
  ];
}

// recursively check if a typedef contains a reference to another type name
function referenceCollision(type: TypeDef, name: string): boolean {
  // nested function to check groups
  function referenceCollisionGroupDec(type: GroupDec, name: string): boolean {
    switch (type[0]) {
      case "INC":
        return type[1].neurodataTypeInc[1]?.neurodataTypeDef === name;
      case "ANONYMOUS":
        return (
          type[1].groups.some((g) => referenceCollisionGroupDec(g, name)) ||
          type[1].datasets.some((d) => referenceCollisionDatasetDec(d, name)) ||
          type[1].links.some((l) => referenceCollisionLinkDec(l, name)) ||
          type[1].attributes.some((a) => referenceCollisionDtype(a.dtype, name))
        );
      default:
        assertNever(type[0]);
    }
  }

  // nested function to check datasets
  function referenceCollisionDatasetDec(
    type: DatasetDec,
    name: string
  ): boolean {
    switch (type[0]) {
      case "INC":
        return type[1].neurodataTypeInc[1]?.neurodataTypeDef === name;
      case "ANONYMOUS":
        return (
          referenceCollisionDtype(type[1].dtype, name) ||
          type[1].attributes.some((a) => referenceCollisionDtype(a.dtype, name))
        );
      default:
        assertNever(type[0]);
    }
  }

  // nested function to check dtypes
  function referenceCollisionDtype(type: Dtype, name: string): boolean {
    switch (type[0]) {
      case "PRIMITIVE":
        return false;
      case "COMPOUND":
        return type[1].some((f) => referenceCollisionDtype(f.dtype, name));
      case "REFSPEC":
        return type[1][1][1]?.neurodataTypeDef === name;
      default:
        assertNever(type[0]);
    }
  }

  // nested function to check links
  function referenceCollisionLinkDec(type: LinkDec, name: string): boolean {
    return type.targetType[1][1]?.neurodataTypeDef === name;
  }

  // now we are ready to check the top level typedef

  switch (type[0]) {
    case "GROUP":
      return (
        type[1].neurodataTypeInc[1]?.neurodataTypeDef === name ||
        type[1].groups.some((g) => referenceCollisionGroupDec(g, name)) ||
        type[1].datasets.some((d) => referenceCollisionDatasetDec(d, name))
      );
    case "DATASET":
      return (
        type[1].neurodataTypeInc[1]?.neurodataTypeDef === name ||
        referenceCollisionDtype(type[1].dtype, name) ||
        type[1].attributes.some((a) => referenceCollisionDtype(a.dtype, name))
      );
    default:
      assertNever(type[0]);
  }
}
