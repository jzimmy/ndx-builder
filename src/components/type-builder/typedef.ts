// TODO refactor TypedefConstructor into abstract class
// add implementations for group and dataset
import { LitElement, html, css, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { symbols } from "../../styles";
import { map } from "lit/directives/map.js";
import { DatasetTypeDef, Defaultable, GroupTypeDef } from "../../nwb/spec";
import { NdxTypesBuilder } from "./types-builder";
import { assertUnreachable } from "../../main";

type TypedefKind = "GROUP" | "DATASET";
type Typedef = ["GROUP", GroupTypeDef] | ["DATASET", DatasetTypeDef];

abstract class TypedefConstructor extends LitElement {
  @property({ type: Boolean })
  minimize = false;

  @state()
  showKindSelector = false;

  abstract capitalizedName: string;
  abstract kind: TypedefKind;
  abstract icon: TemplateResult<1>;
  abstract requiredFields(): TemplateResult<1>;
  abstract advancedFields(): TemplateResult<1>;
  abstract subtree(): TemplateResult<1>;
  abstract readFields(): Typedef;

  private switchKind(kind: TypedefKind) {
    // if switch is called
    // delete this element and create another typedef constructor in the parent
    if (kind == this.kind) return;

    const parent = document.querySelector(
      "ndx-types-builder"
    )! as NdxTypesBuilder;
    parent.destroyTypedefConstructor();

    switch (kind) {
      case "GROUP":
        return parent.addGroupTypedefConstructor();
      case "DATASET":
        return parent.addDatasetTypedefConstructor();
      default:
        assertUnreachable(kind);
    }
  }

  private destroy() {
    const parent = document.querySelector(
      "ndx-types-builder"
    )! as NdxTypesBuilder;
    parent.destroyTypedefConstructor();
  }

  private kindSelector() {
    return html`<div class="selector">
      <div
        class=${this.kind == "GROUP" ? "selected" : ""}
        @click=${() => this.switchKind("GROUP")}
      >
        <span class="material-symbols-outlined">folder</span>Group
      </div>
      <div
        class=${this.kind == "DATASET" ? "selected" : ""}
        @click=${() => this.switchKind("DATASET")}
      >
        <span class="material-symbols-outlined">dataset</span>Dataset
      </div>
    </div>`;
  }

  protected render() {
    return html`
      <!-- Top row with minimize and close buttons -->
      <div class="row">
        <span class="material-symbols-outlined">minimize</span>
        <span class="material-symbols-outlined" @click=${this.destroy}
          >close</span
        >
      </div>
      <!-- Central grid with typedef parameters -->
      <div id="type" class="grid">
        <div id="standard-fields">
          <!-- Top row with kind, typename -->
          <div class="row">
            <div
              id="kind"
              @click=${() => (this.showKindSelector = !this.showKindSelector)}
            >
              ${this.showKindSelector ? this.kindSelector() : html``}
              ${this.icon}
              <span class="material-symbols-outlined">expand_more</span>
            </div>
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
          <!-- Required fields appears below descriptions -->
          ${this.requiredFields()}
          <div class="row">
            <div id="extends">extends</div>
            <div id="incType">Pick a type</div>
          </div>
        </div>
        <!-- vertical line break for advanced fields -->
        <div id="advanced-fields">
          <div>Advanced fields:</div>
          ${this.advancedFields()}
        </div>
      </div>
      <!-- subtree -->
      ${this.subtree()}
      <!-- save button fixed to bottom right corner -->
      <div id="savebtn">Save</div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: column;
        width: min-content;
        height: min-content;
        margin: 5em 5em;
        margin-top: 1.5em;
      }

      #savebtn {
        position: fixed;
        bottom: 10%;
        right: 10%;
        background: blue;
        color: #fff;
        padding: 0.3em 1em;
        border-radius: 0.5em;
        cursor: pointer;
      }

      #type {
        border-radius: 1em;
        border: 2px solid #aaa;
        background: #fff;
        min-width: 600px;
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

      .grid {
        display: grid;
        padding: 1em;
        grid-template-columns: 5fr 3fr;
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
        font-weight: bold;
        padding: 0.3em;
        height: 2.2em;
        font-size: 1.2em;
      }

      .description {
        display: flex;
      }

      .description > textarea {
        margin: 1em 0;
        padding: 0.3em 0.5em;
        height: 3em;
        width: 100%;
        resize: vertical;
        font-family: inherit;
      }

      #incType {
        padding: 0.3em 0.7em;
        font-size: 1.5em;
        border: 2px solid #aaa;
        border-radius: 0.3em;
        color: #aaa;
        cursor: pointer;
      }

      #extends {
        margin-left: auto;
        margin-right: 0.5em;
        font-size: 1.5em;
      }

      #advanced-fields {
        padding: 0.5em 1em;
        margin-left: 1em;
        border-left: 1px solid #888;
      }

      #advanced-fields > input {
        margin-bottom: 0.5em;
      }

      #advanced-fields > div:first-child {
        margin-top: -0.5em;
        margin-bottom: 0.5em;
      }

      #advanced-fields > label {
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
  minimize = false;
  kind: TypedefKind = "GROUP";
  icon = html`<span class="material-symbols-outlined">folder</span>`;
  capitalizedName = "Group";

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
  minimize = false;
  kind: TypedefKind = "DATASET";
  icon = html`<span class="material-symbols-outlined">dataset</span>`;
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
    return html`<label for="name">Name</label>
      <input name="name" type="text" />
      <label for="default-name">Default Name</label>
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
