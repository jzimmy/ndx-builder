import { TemplateResult, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { Namespace, TypeDef } from "./nwb/spec";
import { BasicFormPage, NdxFormParent } from "./form-elem";
import { CPSForm } from "./HOFS";

@customElement("new-or-existing-namespace-form")
export class NamespaceStartFormpageElem extends CPSForm<Namespace> {
  showAndFocus(visible: boolean): void {
    NdxFormParent.showAndFocus(this, visible);
  }

  usingExisting: boolean = false;

  formTitle: string = "";

  isValid(): boolean {
    return true;
  }

  body(): TemplateResult<1> {
    return html`
      <input
        type="button"
        name="create-new"
        value="Create new namespace"
        @click=${this.next}
      />
      <input
        type="button"
        name="upload-old"
        value="Upload an existing namespace"
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
  formTitle: string = "Metadata for your extension";

  @state()
  authors: [string, string][] = [["", ""]];

  isValid(): boolean {
    throw new Error("Method not implemented.");
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
                @input=${(e: Event) =>
                  (this.authors[i][0] = (e.target as HTMLInputElement).value)}
              />
              <label for="author-contact${i}">Author contact</label>
              <input
                type="text"
                name="author-contact${i}"
                .value=${contact}
                @input=${(e: Event) =>
                  (this.authors[i][1] = (e.target as HTMLInputElement).value)}
              />
            `
        )}
      </div>
    `;
  }

  body(): TemplateResult<1> {
    return html`
      <label for="namespace-name">Namespace name</label>
      <input type="text" name="namespace-name" />

      <label for="namespace-version">Namespace version</label>
      <input type="text" name="namespace-version" />

      <label for="namespace-authors">Namespace authors</label>
    `;
  }

  firstInput!: HTMLInputElement;

  fill(
    _val: Namespace,
    _progress?: { states: string[]; currState: number } | undefined
  ): void {
    throw new Error("Method not implemented.");
  }

  transform(_val: Namespace): Namespace {
    return _val;
  }

  clear(): void {
    throw new Error("Method not implemented.");
  }
}

@customElement("namespace-types-form")
export class NamespaceTypesFormpageElem extends CPSForm<Namespace> {
  @state()
  types: TypeDef[] = [];

  fill(
    val: Namespace,
    progress?: { states: string[]; currState: number } | undefined
  ): void {
    this.types = [...val.typedefs];
  }

  transform(val: Namespace): Namespace {
    val.typedefs = [...this.types];
    return val;
  }

  clear(): void {
    this.types = [];
  }

  showAndFocus(visible: boolean): void {
    NdxFormParent.showAndFocus(this, visible);
  }

  render() {
    return html`<h1>Types</h1>
    <input type="button" .value="back" @click=${this.back}></input>
    <input type="button" .value="continue" @click=${this.next}></input>
    `;
  }
}
