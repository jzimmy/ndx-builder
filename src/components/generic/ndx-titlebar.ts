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
      <div class="title">${this.title}</div>
      <div class="subtitle">${this.subtitle}</div>
      <a href="">Need help?</a>
    `;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
      padding: 0.5em;
      align-items: center;
      background: var(--clickable-hover);
      color: #fff;
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

    :host > a {
      all: unset;
      margin-left: auto;
      margin-right: 3em;
      text-decoration: underline;
      cursor: pointer;
    }
  `;
}
