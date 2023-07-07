import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";
import { symbols } from "../../styles";
import { map } from "lit/directives/map.js";

@customElement("inctype-browser")
export class IncTypeBrowser extends LitElement {
  @state()
  coreNotMine = true;

  kind = "__kind__";

  @state()
  types = [
    "ElectricalSeries",
    "Behavioural",
    "LabMetadata",
    "ElectricalSeries",
    "Behavioural",
    "LabMetadata",
    "ElectricalSeries",
    "Behavioural",
  ];

  render() {
    return html`<h1>
        Pick a ${this.kind} to extend
        <span class="material-symbols-outlined">close</span>
      </h1>
      <div class="core-or-mine">
        <div class=${this.coreNotMine ? "picked" : ""}>Core Types</div>
        <div class=${!this.coreNotMine ? "picked" : ""}>My Types</div>
      </div>
      <div class="table">
        ${map(this.types, (type) => html`<div>${type}</div>`)}
      </div> `;
  }

  static styles = [
    symbols,
    css`
      :host {
        background: var(--color-background);
        border: 1px solid var(--color-border);
        display: flex;
        flex-direction: column;
        padding: 2em;
      }

      :host > div {
        display: flex;
        flex-direction: row;
        justify-content: center;
      }

      h1 {
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: row;
      }

      h1 > span {
        margin-left: auto;
        margin-right: 0.5em;
        cursor: pointer;
      }

      :host > .core-or-mine {
        justify-content: space-around;
        margin: 1em 3em;
        font-size: 2em;
      }

      .core-or-mine > div {
        padding: 0.3em 0.5em;
        color: var(--clickable-hover);
        text-decoration: underline;
        cursor: pointer;
        border-radius: 0.5em;
      }

      .core-or-mine > div.picked {
        border: 2px solid var(--clickable);
      }

      .table {
        margin: 0 5em;
        flex-wrap: wrap;
      }

      .table > * {
        padding: 2em 1em;
        min-width: 5em;
        border: 2px solid var(--color-border-alt);
        margin: 0.2em;
      }
    `,
  ];
}
