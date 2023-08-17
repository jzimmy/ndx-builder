import { html, css, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { Initializers } from "./nwb/spec-defaults";
import { symbols } from "./styles";
import { buildFormChains } from "./formchains";

// form manager
@customElement("form-parent")
export class NdxFormParent extends LitElement {
  constructor() {
    super();
    let namespaceBuilderTrigger = buildFormChains(this);

    namespaceBuilderTrigger(
      Initializers.namespace,
      () => {
        throw new Error("Quit form start, unreachable");
      },
      (_) => {
        throw new Error("Quit form end, unreachable");
      }
    );
  }

  render() {
    return html`
      <div>
        <h1>NWB Extension Builder</h1>
        <a href="">Need help?</a>
      </div>
      <form>
        <slot name="currForm"></slot>
      </form>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        background: var(--color-background-alt);
        width: 100%;
        height: 100%;
        flex-direction: column;
      }

      form {
        flex-shrink: 0;
        margin: auto;
        display: flex;
        justify-content: center;
      }

      div {
        display: flex;
        align-items: center;
        background: var(--background-light-button);
        color: var(--clickable);
        border-bottom: 1px solid var(--clickable);
        position: relative;
        margin-bottom: 3em;
      }

      a {
        position: absolute;
        right: 10%;
        font-weight: bold;
        color: var(--clickable);
        transition: 0.2s;
      }

      a:hover {
        color: var(--clickable-hover);
        font-size: 1.05em;
      }

      h1 {
        margin: 0;
        margin-left: 10%;
      }
    `,
  ];
}
