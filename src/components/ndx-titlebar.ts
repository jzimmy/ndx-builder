import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

// TODO: Fix subtitle vertical alignment
@customElement("ndx-titlebar")
export class NdxTitlebar extends LitElement {
  @property()
  title = "";

  @property()
  subtitle = "";

  render() {
    return html`
      <div class="titlebar">
        <div class="title">${this.title}</div>
        <div class="subtitle">${this.subtitle}</div>
      </div>
    `;
  }

  static styles = css`
    .titlebar {
      display: flex;
      flex-direction: row;
      padding: 0.5em;
      background: rgb(120, 190, 255);
    }
    .title {
      font-size: 1.5em;
      font-weight: bold;
      margin-right: 1em;
    }
    .subtitle {
      font-size: 1em;
      font-weight: normal;
    }
  `;
}
