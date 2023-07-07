// TODO refactor TypedefConstructor into abstract class
// add implementations for group and dataset
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { shadowRootCss, symbols } from "../../styles";
import { map } from "lit/directives/map.js";
import { DatasetTypeDef, Defaultable, GroupTypeDef } from "../../nwb/spec";
import { NdxTypesBuilder } from "./types-builder";

type TypedefKind = "GROUP" | "DATASET";
type Typedef = ["GROUP", GroupTypeDef] | ["DATASET", DatasetTypeDef];

export abstract class TypedefConstructor extends LitElement {
  @property()
  minimize = true;

  @state()
  private disableSubtree = true;

  abstract capitalizedName: string;
  abstract kind: TypedefKind;
  abstract icon: string;
  abstract requiredFields(): TemplateResult<1>;
  abstract advancedFields(): TemplateResult<1>;
  abstract subtree(): TemplateResult<1>;
  abstract readFields(): Typedef;
  hasRequiredFields = true;

  private destroy() {
    const parent = document.querySelector(
      "ndx-types-builder"
    )! as NdxTypesBuilder;
    parent.destroyTypedefConstructor();
  }

  private renderAdvancedFields() {
    if (this.minimize) return html``;
    return html`
      ${this.hasRequiredFields
        ? html`<div class="optional-fields">
            <div>Properties:</div>
            ${this.requiredFields()}
          </div>`
        : html``}
      <div class="optional-fields">
        <div>Optional fields:</div>
        ${this.advancedFields()}
      </div>
    `;
  }

  protected render() {
    return html`
      <!-- Top row with minimize and close buttons -->
      <div class="row">
        <span
          class="material-symbols-outlined"
          title=${this.minimize ? "Show more" : "Minimize"}
          @click=${() => {
            this.minimize = !this.minimize;
          }}
          >${this.minimize ? "expand_content" : "minimize"}</span
        >
        <span
          class="material-symbols-outlined"
          title="Close"
          @click=${this.destroy}
          >close</span
        >
      </div>
      <!-- Central grid with typedef parameters -->
      <div id="type" class=${this.minimize ? "" : "grid"}>
        <div id="standard-fields">
          <!-- Top row with kind, typename -->
          <div class="row">
            <span class="material-symbols-outlined" title=${this.kind}
              >${this.icon}</span
            >
            <input
              name="typename"
              type="text"
              placeholder="New ${this.capitalizedName.toLowerCase()} type name"
            />
          </div>
          <!-- Description -->
          <span class="description">
            <textarea
              name="description"
              placeholder="Describe this ${this.capitalizedName.toLowerCase()}"
            ></textarea>
          </span>
          <!-- Extends -->
          <div class="row">
            <div id="extends">extends</div>
            <div id="incType">Pick a type</div>
          </div>
        </div>
        <!-- vertical line break for advanced fields -->
        <!-- Required fields appears below descriptions -->
        ${this.renderAdvancedFields()}
      </div>
      <!-- subtree -->
      ${this.disableSubtree
        ? html`<span style="opacity:0.3">${this.subtree()}</span>`
        : this.subtree()}
      <!-- save button fixed to bottom right corner -->
      <div id="savebtn">Save</div>
    `;
  }

  static styles = [
    shadowRootCss,
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: min-content;
        height: min-content;
        margin: 5em;
        margin-top: 1.5em;
      }

      :host([minimize]) {
        transform: scaleX(30);
      }

      #savebtn {
        position: fixed;
        bottom: 10%;
        right: 10%;
        background: var(--clickable-hover);
        color: #fff;
        font-weight: bold;
        padding: 0.3em 1em;
        border-radius: 0.5em;
        cursor: pointer;
      }

      #type {
        border-radius: 1em;
        border: 2px solid var(--border-dark);
        background: #fff;
        padding: 1em;
      }

      :host > .row:first-child {
        box-sizing: border-box;
        padding: 0.3em 0.8em;
      }

      :host > .row:first-child > .material-symbols-outlined:first-child {
        margin-left: auto;
        margin-right: 0.5em;
      }

      :host > .row:first-child > .material-symbols-outlined {
        font-weight: 500;
        cursor: pointer;
      }

      #standard-fields > * {
        margin-bottom: 0.5em;
        min-width: 350px;
      }

      #standard-fields > .row:last-child {
        margin-bottom: 0;
      }

      #standard-fields > .row:first-child > span {
        font-size: 2.5em;
        margin-right: 0.3em;
      }

      .grid {
        display: flex;
        flex-direction: row;
      }

      .row {
        display: flex;
        flex-direction: row;
        width: 100%;
        align-items: center;
      }

      #kind {
        display: flex;
        flex-direction: row;
        flex-wrap: none;
        border: 1.5px solid #aaa;
        padding: 0.5em;
        padding-right: 0.1em;
        border-radius: 0.3em;
        margin-right: 1em;
        cursor: pointer;
      }

      input[name="typename"] {
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        font-weight: 700;
        color: #333;
        padding: 0.1em 0.2em;
        font-size: 1.4em;
      }

      .description {
        display: flex;
      }

      .description > textarea {
        padding: 0.3em 0.5em;
        height: 3em;
        width: 100%;
        resize: vertical;
        font-family: inherit;
        font-size: 1em;
      }

      click-dropdown {
        color: var(--clickable-hover);
        border: 2px solid var(--clickable);
        box-shadow: 0.05em 0.05em 0.2em #ddd;
      }

      click-dropdown:hover {
        border: 2px solid var(--clickable-hover);
      }

      #incType {
        padding: 0 0.7em;
        font-size: 1.5em;
        border: 2px solid var(--clickable);
        box-shadow: 0.05em 0.05em 0.2em #ddd;
        border-radius: 0.3em;
        color: var(--clickable-hover);
        cursor: pointer;
      }

      #incType:hover {
        color: var(--clickable-hover);
        border: 2px solid var(--clickable-hover);
        outline: 1px solid var(--clickable-hover);
      }

      #extends {
        margin-left: auto;
        margin-right: 0.5em;
        font-size: 1.5em;
      }

      .optional-fields {
        display: flex;
        flex-direction: column;
        padding: 0.5em 1em;
        margin-left: 1em;
        border-left: 1px solid #888;
      }

      .optional-fields > input {
        margin-bottom: 0.5em;
      }

      .optional-fields > div:first-child {
        margin-top: -0.5em;
        margin-bottom: 0.5em;
      }

      .optional-fields > label {
        text-decoration: underline;
      }

      .material-symbols-outlined.large {
        font-size: 30px;
      }

      #kind {
        position: relative;
      }

      .selector {
        display: flex;
        flex-direction: column;
        top: -0.2em;
        left: -0.2em;
        width: 120px;
        padding: 0.5em;
        background: #fff;
        border: 2px solid #555;
        border-radius: 0.5em;
        box-shadow: 3px 3px 10px #99a;
        position: absolute;
      }

      .menuitem {
        display: flex;
        flex-direction: row;
      }

      .menuitem > span {
        margin-right: 0.2em;
      }

      .selector > div {
        display: flex;
        flex-direction: row;
      }

      .selector > div.selected,
      .selector > div.selected > span {
        font-weight: bold;
      }

      .selector:hover > div,
      .selector:hover > div > span {
        font-weight: 300;
      }

      .selector:hover > div:hover,
      .selector:hover > div:hover > span {
        font-weight: bold;
      }

      .selector > div > span {
        margin-right: 0.5em;
      }
    `,
  ];
}

@customElement("group-typedef-constructor")
export class GroupTypedefConstructor extends TypedefConstructor {
  kind: TypedefKind = "GROUP";
  icon = "folder";
  capitalizedName = "Group";
  hasRequiredFields = false;

  groups: HTMLElement[] = [];
  attribs: HTMLElement[] = [];
  datasets: HTMLElement[] = [];
  links: HTMLElement[] = [];

  requiredFields() {
    return html``;
  }

  readFields(): never {
    throw new Error("Method not implemented.");
  }

  advancedFields() {
    return html`<label for="name">Name</label>
      <input name="name" type="text" />
      <label for="default-name">Default Name</label>
      <input name="default-name" type="checkbox" />`;
  }

  fillGroupFields(groupTypedef: GroupTypeDef): void {
    const [groupName, isDefaultName] = groupTypedef.name as Defaultable<string>;
    const query = this.renderRoot.querySelector;
    const nameInput = query('input[name="name"]')! as HTMLInputElement;
    const defaultbox = query('input[name="default-name"]')! as HTMLInputElement;
    nameInput.value = groupName;
    defaultbox.checked = isDefaultName;
  }

  subtree() {
    return html`
      <subtree-branch .elems=${this.groups} id="groups">
        <span slot="icon" class="material-symbols-outlined large">folder</span>
      </subtree-branch>
      <subtree-branch .elems=${this.datasets} id="datasets">
        <span slot="icon" class="material-symbols-outlined large">dataset</span>
      </subtree-branch>
      <subtree-branch .elems=${this.attribs} id="attributes">
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
      </subtree-branch>
      <subtree-branch .elems=${this.links} id="links" lastBranch="true">
        <span slot="icon" class="material-symbols-outlined large">link</span>
      </subtree-branch>
    `;
  }
}

@customElement("dataset-typedef-constructor")
export class DatasetTypedefConstructor extends TypedefConstructor {
  kind: TypedefKind = "DATASET";
  icon = "dataset";
  capitalizedName = "Dataset";

  attribs: HTMLElement[] = [];

  requiredFields() {
    return html`
      <label for="dtype">Data Type</label>
      <input name="dtype" type="text" />
      <br />
      <label for="shape">Axes sizes</label>
      <input name="shape" type="text" />
      <br />
      <label for="dims">Axes labels</label>
      <input name="dims" type="text" />
    `;
  }

  readFields(): never {
    throw new Error("Method not implemented.");
  }

  advancedFields() {
    return html`<label for="name">Default instance name</label>
      <input name="name" type="text" />
      <label for="default-name">Name Fixed</label>
      <input name="default-name" type="checkbox" /> `;
  }

  fillGroupFields(groupTypedef: GroupTypeDef): void {
    const [groupName, isDefaultName] = groupTypedef.name as Defaultable<string>;
    const query = this.renderRoot.querySelector;
    const nameInput = query('input[name="name"]')! as HTMLInputElement;
    const defaultbox = query('input[name="default-name"]')! as HTMLInputElement;
    nameInput.value = groupName;
    defaultbox.checked = isDefaultName;
  }

  subtree() {
    return html`
      <subtree-branch .elems=${this.attribs} id="attributes" lastBranch="true">
        <span slot="icon" class="material-symbols-outlined large"
          >edit_note</span
        >
      </subtree-branch>
    `;
  }
}

@customElement("subtree-branch")
export class SubtreeBranch extends LitElement {
  @property({ type: Boolean })
  lastBranch = false;

  @property()
  elems = [];

  render() {
    console.log(this.elems, this.elems.length);
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
            <div class="branchelement">
              <div class="horizontal"></div>
            </div>
          `
      )}
      <div class="branchelement">
        <span class="material-symbols-outlined">add</span>
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
        border-bottom: 8px solid #aaa;
        border-left: 8px solid #aaa;
        display: flex;
      }

      .branchline > .vert {
        height: 100%;
        border-left: 8px solid #aaa;
      }

      .branchelement > .horizontal {
        padding-top: 1em;
        width: 2em;
        border-bottom: 8px solid #aaa;
      }

      .branchelement {
        margin-top: calc(var(--upper-break) - 1em);
      }

      /* add button */
      .branchelement:last-child {
        margin-top: calc(var(--upper-break) - 0.6em);
        border: 2px solid #aaa;
        margin-bottom: auto;
        border-radius: 10%;
        cursor: pointer;
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
