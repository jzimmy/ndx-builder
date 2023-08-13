import { TemplateResult, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { map } from "lit/directives/map.js";
import { Namespace, TypeDef } from "./nwb/spec";
import { CPSForm, Trigger, ProgressState } from "./hofs";
import { BasicFormPage, NDXBuilderDefaultShowAndFocus } from "./basic-form";
import "./basic-elems";
import { FormStepBar, iconOf } from "./basic-elems";
import { Initializers } from "./nwb/spec-defaults";
import { when } from "lit/directives/when.js";
import { symbols } from "./styles";
import { classMap } from "lit/directives/class-map.js";

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
  triggerUpload: () => void = () => {
    console.log("hi");
  };

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
export class NamespaceTypesForm extends CPSForm<Namespace> {
  constructor(typeBuilderTrigger: Trigger<TypeDef>) {
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

  @property()
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
  triggerTypeBuilder: () => void = () => {};

  showAndFocus(visible: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, visible);
  }

  get ready(): boolean {
    return this.types.length === 0;
  }

  @state()
  selected: number = -1;

  render() {
    return html`
      <back-or-quit-bar
        .back=${() => this.back()}
        .hideQuit=${true}
        .quit=${() => console.log("FUCK")}
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
          <light-button
              @click=${this.triggerTypeBuilder}
            >Create a type &nbsp;
            <span
              class="material-symbols-outlined"
              >add</span
            ></light-button
          >
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
        justify-content: center;
        align-items: center;
        flex: 1;
        min-width: 20em;
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
    `,
  ];
}
