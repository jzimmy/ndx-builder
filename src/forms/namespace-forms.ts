import "../basic-elems";
import { PropertyValueMap, TemplateResult, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { Namespace } from "../nwb/spec";
import { CPSForm } from "../logic/cps-form";
import { BasicFormPage } from "./abstract-form";
import { NDXBuilderDefaultShowAndFocus } from "..";
import { when } from "lit/directives/when.js";
import { symbols } from "../styles";
import {
  DocInput,
  NamespaceNameInput,
  StringInput,
} from "../inputs/value-input";
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
      this.namespaceNameInput.isValid() &&
      this.versionInput.isValid() &&
      this.docInput.isValid() &&
      this.fullNameInput.isValid()
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

  @query("namespace-name-input")
  namespaceNameInput!: NamespaceNameInput;

  @query("version-input")
  versionInput!: VersionInput;

  @query("doc-input")
  docInput!: DocInput;

  @query("string-input")
  fullNameInput!: StringInput;

  body(): TemplateResult<1> {
    return html`
      <namespace-name-input
        label="Name your namespace. Must start with 'ndx-'"
        .onInteraction=${() => this._selfValidate()}
      >
      </namespace-name-input>
      <string-input
        name="full-name"
        label="Full name of the namespace"
        .onInteraction=${() => this._selfValidate()}
      ></string-input>
      <version-input
        name="namespace-version"
        label="Namespace version (e.g. 0.1.3)"
        .onInteraction=${() => this._selfValidate()}
      ></version-input>
      <doc-input
        label="Describe your extension"
        .onInteraction=${() => this._selfValidate()}
      ></doc-input>

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
    if (val.doc !== "") this.docInput.fill(val.doc);
    this._selfValidate();
  }

  transform(val: Namespace): Namespace {
    let name = this.namespaceNameInput.value();
    let version = this.versionInput.value();
    let authors = this.authors;
    let doc = this.docInput.value();
    let fullname = this.fullNameInput.value();
    if (
      name === null ||
      version === null ||
      fullname === null ||
      doc === null ||
      authors.length == 0
    )
      return val;
    return { ...val, name, version, authors, doc, fullname };
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
