import { LitElement, html, css } from "lit";
import { customElement, property } from "lit/decorators.js";
import { buttonStyles } from "./buttons";

@customElement("ndx-bottombar")
export class NdxBottombar extends LitElement {
  @property({ type: String })
  helpLink = "";

  @property({ type: String })
  help = "";

  @property({ type: String })
  progress = "";

  @property({ type: Boolean })
  enabled = true;

  render() {
    // add a class to the slotted div

    return html`
      <a href=${this.helpLink}>${this.help}</a>
      <slot></slot>
    `;
  }

  static styles = [
    buttonStyles,
    css`
      :host {
        display: flex;
        flex-direction: row;
        width: 100%;
        justify-content: space-around;
      }

      a {
        margin: auto 0;
      }

      ::slotted(*) {
        border-radius: 8%;
        margin: 0.3em 0;
        padding: 0.2em 1em;
        color: #fff;
        font-weight: bold;
        background: rgb(60, 110, 255);
        cursor: pointer;
      }
      ::slotted(*:hover) {
        background: rgb(40, 80, 255);
      }
    `,
  ];
}
