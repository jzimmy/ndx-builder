import { LitElement, html, css, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { symbols } from "./styles";
import { classMap } from "lit/directives/class-map.js";
import { TypeDef } from "./nwb/spec";
import { map } from "lit/directives/map.js";

function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}

// @ts-ignore
function debug<T>(x: T) {
  console.log(x);
  return x;
}

@customElement("playground-elems")
export class PlaygroundElems extends LitElement {
  @query("ndx-input")
  ndxInput!: NdxInput;

  @query("ndx-textarea")
  ndxTextarea!: NdxTextarea;

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    document.addEventListener("keydown", (e) => {
      e.key === "Enter" ? console.log(this.ndxInput.value) : null;
    });
    document.addEventListener("keydown", (e) => {
      e.key === "Enter" ? console.log(this.ndxTextarea.value) : null;
    });
  }

  render() {
    return html`
      <mytypes-bar></mytypes-bar>
      <inctype-browser></inctype-browser>
      <light-button>Light Button</light-button>
      <ndx-input
        .info=${"This is the name of the type"}
        .validate=${(input: string) =>
          input.match(/[-]/g)
            ? ["ERROR", "Name cannot contain a special character"]
            : ["OK", input]}
        .label=${"New Type Name"}
        name="typename"
      ></ndx-input>
      <ndx-textarea></ndx-textarea>
      <div>
        <add-typedef-button .icon=${"folder"}
          >Create group type</add-typedef-button
        >
        <add-typedef-button .icon=${"dataset"}
          >Create dataset type</add-typedef-button
        >
      </div>
      <type-def></type-def>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 100%;
    }

    :host > div {
      display: flex;
    }

    :host > div > * {
      margin: 1em;
    }

    :host > * {
      margin: 1em;
    }

    ndx-input {
      font-size: 1em;
      width: 0px;
    }
  `;
}

@customElement("ndx-input")
export class NdxInput extends LitElement {
  @property({ type: String })
  label: string = "";

  @property({ type: String })
  name: string = "";

  @property({ type: String })
  info: string = "";

  @property({ type: Function })
  validate: (value: string) => ["OK", string] | ["ERROR", string] = () => [
    "OK",
    "",
  ];

  @state()
  errmsg: string = "";

  @query("input")
  input!: HTMLInputElement;

  get value() {
    const value = this.input.value;
    const [status, s] = this.validate(value);
    if (status === "ERROR") {
      this.errmsg = s;
      return null;
    }
    return s;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.addEventListener("click", () => this.input.focus());
  }

  render() {
    const inputClasses = {
      showerr: this.errmsg,
      withinfo: this.info !== "",
    };

    return html`
      <input
        @input=${() => (this.errmsg = "")}
        name=${this.name}
        type="text"
        class=${classMap(inputClasses)}
        placeholder=" "
      />
      <div class="placeholder">${this.label}</div>
      ${this.info !== ""
        ? html`<hover-icon id="info">${this.info}</hover-icon> `
        : html``}
      <div
        id="errmsg"
        aria-label=${this.errmsg}
        class=${this.errmsg ? "showerr" : ""}
      >
        ${this.errmsg}
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        padding: 0.5em;
        height: 2.2em;
        min-width: 10em;
        position: relative;
        display: flex;
        flex-direction: column;
        --top-margin: 0.9em;
        --in-margin: 1em;
      }

      :host * {
        transition: 0.2s;
      }

      input {
        font-size: inherit;
        font-weight: inherit;
        color: inherit;
        box-sizing: border-box;
        padding: 0.5em;
        border-radius: 0.5em;
        border: 1px solid var(--color-border-alt);
        background: inherit;
        z-index: 1;
        width: 100%;
        height: 100%;
      }

      input.withinfo {
        padding-right: 1.8em;
      }

      .placeholder {
        font-weight: normal;
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        left: var(--in-margin);
        border-radius: 0.5em;
        color: var(--color-border-alt);
        background: inherit;
        z-index: 1;
      }

      input:focus + .placeholder,
      input:not(:placeholder-shown) + .placeholder {
        background: var(--color-background-alt);
        font-size: 0.7em;
        padding: 0 0.2em;
        z-index: 1;
        transform: translateY(-150%);
        left: calc(1em + var(--in-margin));
      }

      input:focus {
        border: 1.5px solid var(--clickable);
        outline: none;
      }

      input:focus + .placeholder {
        color: var(--clickable);
      }

      input.showerr {
        border: 2px solid #f44;
      }

      input:not(:placeholder-shown).showerr + .placeholder {
        color: #f44;
      }

      #info {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        right: var(--in-margin);
        color: var(--color-border-alt);
      }

      #errmsg {
        color: #f44;
        position: absolute;
      }

      #errmsg.showerr {
        top: 100%;
        left: 1em;
        right: 1em;
        font-size: 0.8em;
        transform: translateY(-20%);
        visibility: visible;
        background: var(--color-background-alt);
        z-index: 3;
      }
    `,
  ];
}

@customElement("ndx-textarea")
export class NdxTextarea extends LitElement {
  @query("textarea")
  textarea!: HTMLTextAreaElement;

  @state()
  required: boolean = true;

  @state()
  errmsg: string = "";

  @property()
  placeholder: string = "";

  render() {
    const classes = {
      showerr: this.errmsg,
    };
    return html`
      <textarea
        @input=${() => (this.errmsg = "")}
        class=${classMap(classes)}
        placeholder=" "
      ></textarea>
      <div id="placeholder">Description</div>
      <div id="errmsg" class=${classMap(classes)}>${this.errmsg}</div>
    `;
  }

  get value(): string | null {
    if (!this.textarea.value.match(/[a-zA-Z0-9]/g)) {
      this.errmsg = "Required";
      return null;
    }
    return this.textarea.value;
  }

  protected firstUpdated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    this.addEventListener("click", () => this.textarea.focus());
  }

  static styles = css`
    :host {
      display: flex;
      position: relative;
      font-size: 0.8em;
      padding: 0.6em;
      box-sizing: border-box;
    }

    :host * {
      transition: 0.2s;
    }

    textarea {
      font-size: inherit;
      font-family: inherit;
      padding: 0.6em;
      resize: vertical;
      min-height: 3em;
      width: 100%;
      background: var(--color-background-alt);
      border-radius: 0.3em;
      box-sizing: border-box;
      outline: 1px solid var(--color-border-alt);
      border: none;
    }

    #placeholder {
      position: absolute;
      font-size: 1.2em;
      top: 0.6em;
      left: 0.8em;
      color: var(--color-border-alt);
      padding: 0 0.2em;
    }

    textarea:focus + #placeholder {
      color: var(--clickable);
    }

    textarea:focus + #placeholder,
    textarea:not(:placeholder-shown) + #placeholder {
      background: var(--color-background-alt);
      z-index: 1;
      transform: translate(0.8em, -0.8em);
      left: calc(1em + var(--in-margin));
      font-size: 1em;
    }

    textarea:focus,
    textarea.show:focus {
      outline: 1.5px solid var(--clickable);
    }

    textarea.showerr {
      outline: 2px solid #f44;
    }

    textarea:not(:placeholder-shown):not(:focus).show + #placeholder {
      color: #f44;
    }

    #errmsg {
      left: 1em;
      visibility: hidden;
      color: #f44;
    }

    #errmsg.showerr {
      visibility: visible;
      position: absolute;
      top: 100%;
      transform: translateY(-30%);
      background: var(--color-background-alt);
      z-index: 3;
    }

    #errmsg.showerr + textarea {
      border: 1px solid #f44;
    }
  `;
}

@customElement("hover-icon")
export class HoverInfo extends LitElement {
  @property({ type: String })
  tip: string = "";

  @property({ type: String })
  icon: string = "info";

  render() {
    return html`
      <div class="tooltip"><slot></slot></div>
      <span class="material-symbols-outlined">${this.icon}</span>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        font-size: inherit;
        position: relative;
        --tooltip-background: var(--clickable);
        cursor: pointer;
        z-index: 2;
        display: flex;
      }

      :host > * {
        transition: 0.3s;
      }

      :host > span {
        font-weight: 300;
        font-size: 1.2em;
        color: inherit;
      }

      :host(:hover) .tooltip {
        opacity: 0.95;
        visibility: visible;
      }

      :host(:hover) span {
        color: var(--tooltip-background);
      }

      .tooltip {
        left: 50%;
        top: 0%;
        transform: translate(-50%, -110%);
        position: absolute;
        color: #fff;
        opacity: 0;
        visibility: hidden;
        cursor: default;
        font-size: 15px;
        padding: 0.5em;
        background: var(--color-background-alt);
        color: var(--clickable-hover);
        border: 2px solid var(--tooltip-background);
        border-radius: 0.5em;
        min-width: 200px;
        max-width: 500px;
        z-index: 2;
      }

      .tooltip::before {
        --size: 0.5em;
        content: "";
        position: absolute;
        top: 100%;
        left: calc(50% - var(--size));
        width: 0;
        border-top: var(--size) solid var(--tooltip-background);
        border-left: var(--size) solid transparent;
        border-right: var(--size) solid transparent;
      }
    `,
  ];
}

@customElement("dark-button")
export class DarkButton extends LitElement {
  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    return html`<slot></slot><span></span>`;
  }

  static styles = [
    symbols,
    css`
      :host {
        background: var(--clickable);
        color: var(--color-background-alt);
        padding: 0.3em 1em;
        border-radius: 0.2em;
        transition: 0.2s;
        cursor: pointer;
        position: relative;
        display: flex;
      }

      :host([disabled]) {
        cursor: default;
        pointer-events: none;
        opacity: 0.4;
      }

      :host(:not([disabled]):hover) {
        background: var(--clickable-hover);
      }
    `,
  ];
}

@customElement("light-button")
export class LightButton extends LitElement {
  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    return html`<slot></slot>`;
  }

  static styles = [
    symbols,
    css`
      :host {
        border: 2px solid var(--clickable);
        color: var(--clickable);
        padding: 0.3em 1em;
        border-radius: 0.2em;
        transition: 0.2s;
        cursor: pointer;
        display: flex;
      }

      :host([disabled]) {
        cursor: default;
        pointer-events: none;
        border: 1px solid var(--color-border-alt);
        color: var(--color-border-alt);
      }

      :host(:hover) {
        border: 2px solid var(--clickable-hover);
        color: var(--clickable-hover);
      }

      :host(:not([disabled]):hover) {
        background: var(--background-light-hover);
      }
    `,
  ];
}

@customElement("add-typedef-button")
export class AddTypedefButton extends LitElement {
  icon = "folder";

  render() {
    return html`
      <span class="material-symbols-outlined">${this.icon}</span>
      <span class="material-symbols-outlined">add</span>
      <div><slot></slot></div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        padding: 1em 1.5em;
        border-radius: 0.5em;
        border: 2px solid var(--color-border);
        position: relative;
        cursor: pointer;
        transition: 0.2s;
      }

      :host(:hover) {
        color: var(--clickable);
        border: 2px solid var(--clickable);
      }

      span.material-symbols-outlined {
        font-size: 70px;
      }

      div {
        position: absolute;
        padding: 0 0.2em;
        background: var(--color-background-alt);
        top: 0;
        left: 0;
        transform: translate(0.5em, -0.8em);
      }
    `,
  ];
}

@customElement("type-def")
export class GroupTypedef extends LitElement {
  @state()
  minimize = true;

  fill(_typedef: TypeDef) {}

  private body() {
    return html`
      <div class=${classMap({ body: true, minimize: this.minimize })}>
        <div class="body-section">
            <div class="row">
                <span class="material-symbols-outlined">folder</span>
                <ndx-input .label=${"New type name"} id="typename"><ndx-input>
            </div>
            <ndx-textarea></ndx-textarea>
            <div class="row">
                <div>extends</div>
                <light-button>Pick a type</light-button>
            </div>
        </div>
        ${this.requiredFields()}
        ${this.optionalFields()}
      </div>
    `;
  }

  private requiredFields() {
    return html``;
  }

  private optionalFields() {
    return html`
    <div class=${classMap({
      "body-section": true,
      minimize: this.minimize,
    })}
        >
        <div>Optional properties:</div>
        <ndx-input info="The default name will be applied when you declare an instance of this type" label="Default instance name"></ndx-input>
        <label class="checkbox" for="fixed-name">Fixed name
            <input name="fixed-name" type="checkbox"></input>
            <hover-icon>If checked, the name of the instance will be fixed and cannot be changed.</hover-icon>
        </label>
    </div>
    `;
  }

  private subtree(enabled: boolean) {
    const disabled = !enabled;
    return html`
      <subtree-branch ?disabled=${disabled} id="groups">
        <span slot="icon" class="material-symbols-outlined large">folder</span>
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="datasets">
        <span slot="icon" class="material-symbols-outlined large">dataset</span>
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="attributes">
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
      </subtree-branch>
      <subtree-branch ?disabled=${disabled} id="links" lastBranch="true">
        <span slot="icon" class="material-symbols-outlined large">link</span>
      </subtree-branch>
    `;
  }

  render() {
    return html`
      <div class="row">
        <span
          class="material-symbols-outlined"
          @click=${() => (this.minimize = !this.minimize)}
          >${this.minimize ? "expand_content" : "minimize"}</span
        >
        <span class="material-symbols-outlined">close</span>
      </div>
      ${this.body()} ${this.subtree(true)}
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        padding: 0.5em;
      }

      :host * {
        transition: 0.2s;
      }

      .row {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      :host > .row:first-child > span:first-child {
        margin-left: auto;
      }

      :host > .row:first-child {
        margin-bottom: 0.5em;
        margin-right: 0.5em;
      }

      :host > .row:first-child > span {
        cursor: pointer;
        user-select: none;
        margin: 0 0.3em;
      }

      :host > .row:first-child > span:hover {
        color: var(--clickable-hover);
        background: var(--background-light-hover);
        padding: 0.05em;
        border-radius: 0.2em;
      }

      .body {
        display: flex;
        border: 1px solid var(--color-border);
        padding: 1em;
        border-radius: 0.8em;
        box-shadow: 0 0 20px 5px #eee;
      }

      .body-section {
        display: flex;
        flex-direction: column;
        border-left: 1px solid var(--color-border-alt);
        padding: 0.5em;
      }

      .body-section:first-child {
        border-left: none;
        padding: 0;
      }

      .body-section.minimize {
        display: none;
      }

      .body-section > .row > span {
        font-size: 40px;
        margin-left: 0.2em;
      }

      .body-section > .row > #typename {
        flex: 1 1 auto;
        font-size: 1.2em;
        width: 100%;
        font-weight: 600;
      }

      .body-section > ndx-textarea {
        flex: 1 1 auto;
        font-size: 1em;
        width: 100%;
      }

      .body-section > .row:last-child {
        margin-left: auto;
      }

      .body-section > .row:last-child > light-button {
        margin: 0.3em 0.5em;
      }

      .body-section:not(:first-child) > div:first-child {
        margin-left: 0.5em;
      }

      .checkbox {
        margin-left: 1em;
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .checkbox > input {
        margin-top: auto;
        margin-bottom: 0.4em;
        margin-left: 0.5em;
        border: 1px solid var(--color-border-alt);
      }

      .checkbox > input:checked {
        background: var(--clickable);
      }

      .checkbox > input:checked:hover {
        background: var(--clickable-hover);
      }

      label {
        color: var(--color-border);
      }

      label > hover-icon {
        margin-left: 0.3em;
      }
    `,
  ];
}

@customElement("subtree-branch")
export class SubtreeBranch extends LitElement {
  @property({ type: Boolean })
  lastBranch = false;

  @property()
  elems = [];

  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    return html`
      <div class="branchline">
        <div class="elbow">
          <span class="icon">
            <slot name="icon"></slot>
          </span>
        </div>
        ${this.lastBranch ? `` : html` <div class="vert"></div>`}
      </div>
      ${map(
        this.elems,
        (elem) =>
          html`
            <div class="branchelement">${elem}</div>
            <div class="branchelement"><div class="horizontal"></div></div>
          `
      )}
      <div class="branchelement">
        <light-button ?disabled=${this.disabled}>
          <span class="material-symbols-outlined" style="font-size:1.3em"
            >add</span
          >
        </light-button>
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: row;
        --upper-break: 3em;
        padding-left: 4em;
      }

      :host([disabled]) {
        opacity: 0.4;
      }

      :host > div {
        display: flex;
        flex-direction: column;
      }

      :host > * {
        margin-right: 0.5em;
      }

      .branchline {
        display: flex;
        flex-direction: column;
      }

      .branchline > .elbow {
        min-height: var(--upper-break);
        width: 4em;
        border-bottom: 2px solid var(--color-border);
        border-left: 2px solid var(--color-border);
        display: flex;
      }

      .branchline > .vert {
        height: 100%;
        border-left: 2px solid var(--color-border);
      }

      .branchelement > .horizontal {
        padding-top: 1em;
        width: 2em;
        border-bottom: 2px solid var(--color-border);
      }

      .branchelement {
        margin-top: calc(var(--upper-break) - 1em);
      }

      /* add button */
      .branchelement:last-child {
        margin-top: calc(var(--upper-break) - 0.8em);
        margin-bottom: auto;
        cursor: pointer;
        opacity: 0.8;
      }

      .branchelement:last-child > light-button {
        padding: 0.1em 0.3em;
      }

      .typedec {
        height: 200px;
        background: lightblue;
      }

      .icon {
        margin-top: auto;
        margin-left: auto;
        margin-right: 0.5em;
        margin-bottom: 0.3em;
        cursor: default;
      }
    `,
  ];
}

@customElement("inctype-browser")
export class InctypeBrowser extends LitElement {
  private _continuation() {
    const incType = () => {
      switch (this.category) {
        case "core":
          return this.modules[this.selectedModule][this.selectedType];
        case "mine":
          return this.myTypes[this.selectedType][1];
        case "none":
          return "None";
        default:
          assertUnreachable(this.category);
      }
    };
    this.continuation(incType());
    this.remove();
  }

  @property({ type: Function })
  continuation: (incType: string) => void = (t) => {
    console.log(t);
    throw new Error("inctype browser form continuation unset");
  };

  @property({ type: String })
  kind: "GROUP" | "DATASET" = "GROUP";

  @state()
  category: "core" | "mine" | "none" = "core";

  @state()
  selectedModule: number = 0;

  @state()
  selectedType: number = -1;

  @property()
  // 8 dummy entries
  myTypes: ["GROUP" | "DATASET", string][] = [
    ["GROUP", "mytype1"],
    ["GROUP", "mytype2"],
    ["GROUP", "mytype3"],
    ["DATASET", "mytype4"],
    ["GROUP", "mytype5"],
    ["DATASET", "mytype6"],
    ["GROUP", "mytype7"],
    ["GROUP", "mytype8"],
  ];
  //   myTypes: ["GROUP" | "DATASET", string][] = [];

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

  private menu() {
    switch (this.category) {
      case "core":
        return this.coreMenu();
      case "mine":
        return this.mineMenu();
      case "none":
        return html``;
    }
  }

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
          ${map(this.myTypes, ([k, type], i) =>
            k == this.kind
              ? html`<div
                  class=${classMap({ selected: i == this.selectedType })}
                  @click=${() => (this.selectedType = i)}
                >
                  ${type}
                </div>`
              : html``
          )}
        </div>
      </div>
    `;
  }

  render() {
    return html`
      <span 
        @click=${this.remove}
        class="close material-symbols-outlined">close</span>
      <h2>Pick a base ${this.kind.toLocaleLowerCase()} type to extend</h2>
      <div>
        <h3 class=${classMap({ selected: this.category == "core" })}
            @click=${() => {
              this.category = "core";
              this.selectedType = -1;
            }}
        >
          Core Types
        </h3>
        ${
          this.myTypes.length > 0
            ? html`
                <h3
                  class=${classMap({ selected: this.category == "mine" })}
                  @click=${() => {
                    this.category = "mine";
                    this.selectedType = -1;
                  }}
                >
                  My Types
                </h3>
              `
            : html``
        }
        <h3 class=${classMap({ selected: this.category == "none" })}
            @click=${() => {
              this.category = "none";
            }}
        >
          No Base
        </h3>
        <hr></hr>
      </div>
      ${this.menu()}
      <div>
        <dark-button ?disabled=${
          this.category != "none" && this.selectedType == -1
        } @click=${this._continuation}>Continue</dark-button>
      </div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        box-sizing: border-box;
        min-width: 500px;
        position: relative;
      }

      :host * {
        transition: 0.2s;
      }

      :host > span {
        position: absolute;
        top: 0;
        right: 50%;
        transform: translate(1150%, 75%);
        cursor: pointer;
      }

      h2 {
        margin: 0.5em;
      }

      :host > div {
        display: flex;
        flex-direction: row;
        justify-content: center;
        padding: auto;
        position: relative;
        width: 100%;
        transition: 0.3s;
      }

      :host > div > h3 {
        margin: 0.5em 1em;
        min-width: 80px;
        padding: 0.3em 0.5em;
        text-align: center;
        cursor: pointer;
      }

      :host > div > h3:hover {
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

      :host > div > h3:not(:hover).selected {
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

      :host > div:last-child {
        display: flex;
        padding: 1em 2em;
        width: 100%;
        box-sizing: border-box;
      }

      :host > div:last-child > dark-button {
        margin-left: auto;
      }
    `,
  ];
}

@customElement("mytypes-bar")
export class MyTypesBar extends LitElement {
  @property()
  myTypes: ["GROUP" | "DATASET", string][] = [
    ["GROUP", "mytype1"],
    ["DATASET", "mytype2"],
    ["GROUP", "mytype3"],
  ];

  @state()
  selected: number = -1;

  render() {
    return html`<h2>My Types</h2>
      <hr />
      <ul>
        ${map(
          this.myTypes,
          ([kind, name], i) => html` <li
            class=${classMap({ selected: i == this.selected })}
            @click=${() => (this.selected = i)}
          >
            <span class="material-symbols-outlined">${iconOf(kind)}</span>
            ${name}
          </li>`
        )}
      </ul>`;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1em;
        flex: 0 0 auto;
        border-right: 1px solid var(--color-border-alt);
      }

      :host * {
        transition: 0.2s;
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
    `,
  ];
}

function iconOf(kind: "GROUP" | "DATASET") {
  switch (kind) {
    case "GROUP":
      return "folder";
    case "DATASET":
      return "dataset";
    default:
      assertUnreachable(kind);
  }
}