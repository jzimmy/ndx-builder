import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./type-elem";
import "./experiments";
import "./forms";
import "./playground";
import { choose } from "lit/directives/choose.js";
import { DatasetTypeDefElem, GroupTypeDefElem } from "./experiments";

@customElement("ndx-main")
export class NdxMain extends LitElement {
  @state()
  appState: "NEW" | "GROUP" | "DATASET" | "PICK" = "NEW";

  @property()
  currTypedef?: GroupTypeDefElem | DatasetTypeDefElem;

  @property()
  myTypes: (GroupTypeDefElem | DatasetTypeDefElem | string)[] = [];

  render() {
    return html`<h1>Create Extended NWB Types</h1>
      <div>
        ${this.myTypes.length > 0 ? html`<mytypes-bar></mytypes-bar>` : html``}
        ${choose(
          this.appState,
          [
            [
              "GROUP",
              () =>
                html`<group-def-elem
                  class="typedef"
                  .onDelete=${() => (this.appState = "NEW")}
                ></group-def-elem>`,
            ],
            [
              "DATASET",
              () => html`<dataset-def-elem
                class="typedef"
                .onDelete=${() => (this.appState = "NEW")}
              ></dataset-def-elem>`,
            ],
            ["PICK", () => html`<inctype-browser></inctype-browser>`],
          ],
          () => html`
            <div class="create">
              <add-typedef-button
                .icon=${"folder"}
                @click=${() => (this.appState = "GROUP")}
                >Create group type</add-typedef-button
              >
              <add-typedef-button
                .icon=${"dataset"}
                @click=${() => (this.appState = "DATASET")}
                >Create dataset type</add-typedef-button
              >
            </div>
          `
        )}
      </div>`;
  }

  static styles = css`
    :host {
      height: 100vh;
      width: 100vw;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    :host > div {
      display: flex;
      width: 100%;
      height: 100%;
    }

    :host > div > mytypes-bar {
      margin-bottom: auto;
    }

    :host > div > *:not(mytypes-bar) {
      margin: auto;
    }

    :host > div > div.create {
      display: flex;
      margin-top: 8em;
    }

    .create > * {
      margin: auto 2em;
    }

    :host > div > .typedef {
      margin-top: 1em;
      overflow: scroll;
    }

    :host > div > inctype-browser {
      margin-top: 1em;
      overflow: scroll;
    }
  `;
}
