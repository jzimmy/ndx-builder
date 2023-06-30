import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("typedef-constructor")
export class TypeConstructor extends LitElement {
  @property({ type: Boolean })
  showall = true;

  @property({ type: Boolean })
  isDatasetNotFolder = false;

  generateRequiredFields() {
    return html``;
  }

  generateAdvancedFields() {
    return html``;
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
          Advanced fields ${this.generateAdvancedFields()}
        </div>
      </div>
      <div>subtypes</div>`;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      width: min-content;
      height: min-content;
      margin: 5em 0 0 5em;
    }

    #type {
      border-radius: 1em;
      border: 2px solid purple;
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
      border: 2px solid purple;
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
      border: 2px solid purple;
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
      text-decoration: underline;
      padding: 0.5em 1em;
      margin-left: 1em;
      border-left: 1px solid #888;
    }
  `;
}
