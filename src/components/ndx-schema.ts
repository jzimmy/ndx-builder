import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("ndx-schema")
export class NdxSchema extends LitElement {
  @state()
  extendingNWBCore = true;

  schemas() {
    const fileInput = this.shadowRoot?.getElementById(
      "schemafiles"
    )! as HTMLInputElement;
    const schemas = [];
    for (const file of fileInput.files!) {
      schemas.push(file);
    }
    return schemas;
  }

  render() {
    return html`
      <div class="grid">
        <div class="btn">Choose a namespace</div>
        <label for="schemafiles" class="upload-btn"
          >Upload a file
          <input type="file" id="schemafiles" accept=".yaml" multiple />
        </label>

        <div>Extend an NWB Core Schema</div>
        <div>Build on a custom NWB Namepace</div>
      </div>
      <div class="grid">
        <div>Extending:</div>
        ${this.extendingNWBCore
          ? html`
              <select name="coreSpec">
                <option>Electrical Series</option>
                <option>Time? Series</option>
                <option>EPhys? Series</option>
              </select>
            `
          : html`<div id="namespace" style="font-weight:bold;">
              ndx-example.namespace.yaml<br />
              ndx-example.extension.yaml
            </div>`}
      </div>
      <ndx-bottombar help="What is an NWB Spec?" helpLink="">
        <div>Save</div>
      </ndx-bottombar>
    `;
  }

  static styles = css`
    .grid {
      gap: 2em;
      width: 50%;
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
    .btn {
      margin: auto;
      padding: 1em;
      border: 1px solid #808080;
    }
  `;
}
