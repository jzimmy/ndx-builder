import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("typedef-constructor")
export class TypedefConstructor extends LitElement {
  @property({ type: Boolean })
  showall = true;

  @property({ type: Boolean })
  isDatasetNotFolder = false;

  generateRequiredFields() {
    return html``;
  }

  generateAdvancedFields() {
    return html`<label for="name">Name</label>
      <input name="name" type="text" />
      <label for="default-name">Default Name</label>
      <input name="default-name" type="checkbox" /> `;
  }

  render() {
    return html`<div id="type">
        <div id="standard-fields">
          <div class="row">
            <div id="kind">Folder <span id="dropdownbtn">▾</span></div>
            <input name="typename" type="text" placeholder="New type name" />
          </div>
          <textarea
            name="description"
            placeholder="Describe this ${this.isDatasetNotFolder
              ? "dataset"
              : "folder"}"
          ></textarea>
          ${this.generateRequiredFields()}
          <div class="row">
            <div id="extends">extends</div>
            <div id="incType">Pick a type</div>
          </div>
        </div>
        <div id="advanced-fields">
          <div>Advanced fields:</div>
          ${this.generateAdvancedFields()}
        </div>
      </div>
      <typedef-subtree></typedef-subtree>`;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: min-content;
      height: min-content;
      margin: 5em 5em;
    }

    #type {
      border-radius: 1em;
      border: 2px solid #aaa;
      background: #fff;
      padding: 1em;
      display: grid;
      grid-template-columns: 5fr 3fr;
      min-width: 600px;
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
      border: 2px solid #aaa;
      padding: 0.5em;
      border-radius: 0.3em;
      margin-right: 1em;
    }

    input[name="typename"] {
      width: 100%;
      font-size: 2em;
      padding: 0 0.5em;
    }

    textarea {
      margin: 1em 0;
    }

    #dropdownbtn {
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

    #advanced-fields > div:first-child {
      margin-top: -0.5em;
      margin-bottom: 0.5em;
    }

    #advanced-fields > label {
      text-decoration: underline;
    }
  `;
}

@customElement("typedef-subtree")
export class TypedefSubtree extends LitElement {
  subtreeBranch(vert: boolean = true) {
    return html`<div class="branch-row">
      <div class="branchline">
        <div class="elbow"></div>
        ${vert ? html` <div class="vert"></div>` : ``}
      </div>
      <div class="branchelement">
        <div class="typedec">newdata</div>
      </div>
      <div class="branchelement">
        <div class="horizontal"></div>
      </div>
      <div class="branchelement">
        <div>Add</div>
      </div>
    </div>`;
  }

  render() {
    return html`
      ${this.subtreeBranch()} ${this.subtreeBranch()} ${this.subtreeBranch()}
      ${this.subtreeBranch(false)}
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
    }

    // DEBUG
    // :host * {
    //   border: 1px solid red;
    // }

    .branch-row {
      display: flex;
      flex-direction: row;
    }

    .branch-row > * {
      margin-right: 0.5em;
    }

    .branch-row > div {
      display: flex;
      flex-direction: column;
    }

    .branch-row > div:first-child {
      margin-left: 5em;
    }

    .branchline {
      display: flex;
      flex-direction: column;
    }

    .branchline > .elbow {
      min-height: 4em;
      width: 4em;
      border-bottom: 8px solid #aaa;
      border-left: 8px solid #aaa;
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
      margin-top: 3em;
    }

    .branchelement:last-child {
      margin-top: 3.2em;
      border: 2px solid #aaa;
      margin-bottom: auto;
      padding: 0.2em 0.5em;
    }

    .typedec {
      height: 200px;
      background: lightblue;
    }
  `;
}
