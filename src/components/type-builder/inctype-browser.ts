import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("inctype-browser")
export class IncTypeBrowser extends LitElement {
  @state()
  showCore = true;

  render() {
    return html`<div>IncTypeBrowser</div>`;
  }

  static styles = css`
    :host {
      color: red;
    }

    div {
      color: blue;
      height: 50px;
      width: 200px;
    }
  `;
}
