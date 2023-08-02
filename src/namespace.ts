import { TemplateResult, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { Namespace, TypeDef } from "./nwb/spec";
import { CPSForm, FormTrigger, ProgressState } from "./HOFS";
import { BasicFormPage, NDXBuilderDefaultShowAndFocus } from "./forms";
import "./basic-elems";
import { FormStepBar } from "./basic-elems";
import { Initializers } from "./nwb/spec-defaults";
import { when } from "lit/directives/when.js";

@customElement("new-or-existing-namespace-form")
export class NamespaceStartFormpageElem extends CPSForm<Namespace> {
  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  usingExisting: boolean = false;

  formTitle: string = "";

  isValid(): boolean {
    return true;
  }

  render() {
    return html`
      <input
        type="button"
        name="create-new"
        value="Create new extended NWB types"
        @click=${this.next}
      />
      <input
        type="button"
        name="upload-old"
        value="Modify an existing extension namespace"
        @click=${this.next}
      />
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
}

@customElement("namespace-metadata-form")
export class NamespaceMetadataFormpageElem extends BasicFormPage<Namespace> {
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
      this.namespaceNameInput.value !== "" &&
      this.namespaceVersionInput.value !== ""
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
                    console.log("removing", i);
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

  @query("input[name=namespace-name]")
  namespaceNameInput!: HTMLInputElement;

  @query("input[name=namespace-version]")
  namespaceVersionInput!: HTMLInputElement;

  body(): TemplateResult<1> {
    return html`
      <step-bar></step-bar>
      <label for="namespace-name">Namespace name</label>
      <input type="text" name="namespace-name" />

      <label for="namespace-version">Namespace version</label>
      <input type="text" name="namespace-version" />

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
    if (val.version.every((v) => v === -1)) {
      this.namespaceVersionInput.value = val.version
        .map((v) => v.toString())
        .join(".");
    }
    if (val.name !== "") this.namespaceNameInput.value = val.name;
  }

  transform(_val: Namespace): Namespace {
    return _val;
  }

  clear(): void {
    this.authors = [];
  }
}

@customElement("namespace-types-form")
export class NamespaceTypesFormpageElem extends CPSForm<Namespace> {
  constructor(typeBuilderTrigger: FormTrigger<TypeDef>) {
    super();
    this.triggerTypeBuilder = () => {
      this.showAndFocus(false);
      typeBuilderTrigger(
        ["GROUP", Initializers.groupTypeDef],
        () => {
          this.showAndFocus(true);
        },
        (v) => {
          this.showAndFocus(true);
          this.types = [...this.types, v];
        }
      );
    };
  }

  @state()
  types: TypeDef[] = [];

  @query("step-bar")
  stepBar!: FormStepBar;

  fill(val: Namespace, progress?: ProgressState): void {
    if (val.typedefs.length !== 0) this.types = [...val.typedefs];
    this.stepBar.setProgressState(progress);
  }

  transform(val: Namespace): Namespace {
    val.typedefs = [...this.types];
    return val;
  }

  clear(): void {
    this.types = [];
  }

  @property({ type: Function })
  triggerTypeBuilder = () => {};

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  get ready(): boolean {
    return this.types.length === 0;
  }

  render() {
    return html`
    <step-bar></step-bar>
    <h1>My Types</h1>
    ${map(
      this.types,
      ([kind, ty]) => html`<h2>${kind}, ${ty.neurodataTypeDef}</h2>`
    )}
    <input type="button" value="add new type" @click=${
      this.triggerTypeBuilder
    }></input>
    <input type="button" value="back" @click=${this.back}></input>
    <input type="button" .disabled=${this.ready} value="continue" @click=${
      this.next
    }></input>
    `;
  }
}
