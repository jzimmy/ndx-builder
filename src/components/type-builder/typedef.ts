// TODO refactor TypedefConstructor into abstract class
// add implementations for group and dataset
import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { symbols } from "../../styles";
import { assertUnreachable } from "../../main";
import { map } from "lit/directives/map.js";
import { DatasetTypeDef, Defaultable, GroupTypeDef } from "../../nwb/spec";

type TypedefKind = "GROUP" | "DATASET";
type Typedef = ["GROUP", GroupTypeDef] | ["DATASET", DatasetTypeDef];

@customElement("typedef-constructor")
export class TypedefConstructor extends LitElement {
  @property({ type: Boolean })
  minimize = false;

  @state()
  kind: TypedefKind = "GROUP";

  datasetRequiredFields() {
    return html``;
  }

  datasetAdvancedFields() {
    return html``;
  }

  groupRequiredFields() {
    return html``;
  }

  groupAdvancedFields() {
    return html`<label for="name">Name</label>
      <input name="name" type="text" />
      <label for="default-name">Default Name</label>
      <input name="default-name" type="checkbox" />`;
  }

  fillGroupFields(groupTypedef: GroupTypeDef) {
    const [groupName, isDefaultName] = groupTypedef.name as Defaultable<string>;
    const query = this.renderRoot.querySelector;
    const nameInput = query('input[name="name"]')! as HTMLInputElement;
    const defaultbox = query('input[name="default-name"]')! as HTMLInputElement;
    nameInput.value = groupName;
    defaultbox.checked = isDefaultName;
  }

  groups: HTMLElement[] = [];
  attribs: HTMLElement[] = [];
  datasets: HTMLElement[] = [];
  links: HTMLElement[] = [];

  groupSubtree() {
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

  icon = "folder";
  fillFields = this.fillGroupFields;
  requiredFields = this.groupRequiredFields;
  advancedFields = this.groupAdvancedFields;
  subtree = this.groupSubtree;
  readFields = () => {};

  switchKind() {
    console.log("switching kind");
    switch (this.kind) {
      case "GROUP":
        this.requiredFields = this.datasetRequiredFields;
        this.advancedFields = this.datasetAdvancedFields;
        break;
      case "DATASET":
        this.requiredFields = this.datasetRequiredFields;
        this.advancedFields = this.datasetAdvancedFields;
        break;
      default:
        assertUnreachable(this.kind);
    }
  }

  render() {
    return html`
      <!-- Top row with minimize and close buttons -->
      <div class="row">
        <span class="material-symbols-outlined">minimize</span>
        <span class="material-symbols-outlined">close</span>
      </div>
      <!-- Central grid with typedef parameters -->
      <div id="type" class="grid">
        <div id="standard-fields">
          <!-- Top row with kind, typename -->
          <div class="row">
            <div id="kind" @click=${this.switchKind}>
              <span class="material-symbols-outlined">${this.icon}</span>
              <span class="material-symbols-outlined">expand_more</span>
            </div>
            <input name="typename" type="text" placeholder="New type name" />
          </div>
          <!-- Description -->
          <span class="description">
            <textarea
              name="description"
              placeholder="Describe this ${this.kind}"
            ></textarea>
          </span>
          <!-- Required fields appears below descriptions -->
          ${this.requiredFields()}
          <div class="row">
            <div id="extends">extends</div>
            <div id="incType">Pick a type</div>
          </div>
        </div>
        <!-- vertical line break -->
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

      .DEBUG {
        border: 2px solid red;
        padding-botton: auto;
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
        padding-left: 2em;
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
