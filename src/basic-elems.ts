import { LitElement, html, css, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { ProgressState, dummyProgress } from "./hofs";
import { symbols } from "./styles";
import { when } from "lit/directives/when.js";
import { styleMap } from "lit/directives/style-map.js";

export function iconOf(kind: "GROUP" | "DATASET") {
  if (kind == "GROUP") return "folder";
  else return "dataset";
}

abstract class ButtonElem extends LitElement {
  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    return html`<button .disabled=${this.disabled}><slot></slot></button>`;
  }

  static styles = css`
    :host {
      padding: 0.1em;
      user-select: no-select;
    }

    :host([disabled]) {
      pointer-events: none;
      user-select: no-select;
    }

    button {
      all: unset;
      padding: 0.3em 1em;
      border-radius: 0.2em;
      transition: 0.2s;
      display: flex;
      justify-content: center;
      cursor: pointer;
    }

    button:focus {
      box-shadow: 0 0 0 3px var(--color-background-alt),
        0 0 0 5px var(--clickable);
    }

    button:disabled {
      pointer-events: none;
    }

    ::slotted(*) {
      user-select: no-select;
    }
  ` as CSSResultGroup;
}

@customElement("light-button")
export class LightButton extends ButtonElem {
  @property({ type: Boolean, reflect: true })
  picked = false;
  static styles = [
    super.styles,
    css`
      button {
        color: var(--clickable);
        border: 2px solid var(--clickable);
        background: var(--background-light-button);
      }

      :host([picked]) {
        background: inherit;
      }

      button:disabled {
        color: var(--color-border-alt);
        border: 1px solid var(--color-border-alt);
      }
      button:hover {
        color: var(--clickable-hover);
        border: 2px solid var(--clickable-hover);
      }

      button:not(:disabled):hover {
        background: var(--background-light-hover);
      }
    `,
  ];
}

@customElement("dark-button")
export class DarkButton extends ButtonElem {
  static styles = [
    super.styles,
    css`
      :host {
        color: var(--color-background-alt);
        background: var(--clickable);
      }
      :host([disabled]) {
        opacity: 0.4;
      }
      :host(:not([disabled]):hover) {
        background: var(--clickable-hover);
      }
    `,
  ];
}

@customElement("big-button")
export class BigPrettyButton extends ButtonElem {
  @property({ type: String })
  icon: string = "";

  render() {
    return html`
      <span class="material-symbols-outlined">${this.icon}</span>
      <span class="material-symbols-outlined">add</span>
      <div><slot></slot></div>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        padding: 1em 1.5em;
        border-radius: 0.5em;
        border: 2px solid var(--color-border);
        position: relative;
        cursor: pointer;
        transition: 0.2s;
        width: 16em;
        height: 6em;
        align-items: center;
        justify-content: center;
        flex-wrap: nowrap;
      }

      :host(:hover) {
        color: var(--clickable);
        border: 2px solid var(--clickable);
      }

      span.material-symbols-outlined {
        font-size: 70px;
      }

      div {
        display: block;
        position: absolute;
        background: var(--color-background-alt);
        top: 0;
        left: 0;
        padding: 0 0.3em;
        transform: translate(0.5em, -0.8em);
        font-size: 1.2em;
      }
    `,
  ];
}

@customElement("step-bar")
export class FormStepBar extends LitElement {
  @property({ reflect: true })
  hidden: boolean = false;

  @property({ type: Array<String> })
  steps: string[] = dummyProgress.states;

  @property({ type: Number })
  currStep: number = dummyProgress.currState;

  setProgressState(progress?: ProgressState) {
    this.hidden = progress == undefined;
    if (progress) {
      this.currStep = progress.currState;
      this.steps = progress.states;
    }
  }

  render() {
    return html` <span class="material-icons-outlined"></span>
      ${map(this.steps, (step, i) => {
        return html`<h3
            class=${classMap({
              active: i == this.currStep,
              completed: i < this.currStep,
            })}
          >
            ${step}
          </h3>
          ${when(
            i + 1 < this.steps.length,
            () => html`
              <span
                style=${styleMap({
                  color:
                    i == this.currStep
                      ? "var(--clickable)"
                      : i < this.currStep
                      ? "var(--color-border)"
                      : "var(--color-border-alt)",
                })}
                class="material-symbols-outlined"
                >arrow_forward_ios</span
              >
            `
          )} `;
      })}`;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        flex-direction: row;
        justify-content: center;
      }

      :host[hidden] {
        display: none;
      }

      h3 {
        margin: 0;
        padding: 0 1em;
      }

      h3:not(.completed):not(.active) {
        opacity: 0.5;
      }

      h3.active {
        // color: var(--clickable);
        text-decoration: underline;
      }
    `,
  ];
}

@customElement("back-or-quit-bar")
export class Navbar extends LitElement {
  @property({ type: Boolean, reflect: true })
  hideQuit: boolean = false;

  @property({ type: Boolean, reflect: true })
  hideBack: boolean = false;

  @property({ type: Function })
  back = () => {};

  @property({ type: Function })
  quit = () => {};

  render() {
    return html`<span @click=${this.back} class="material-symbols-outlined"
        >arrow_back</span
      >
      <slot></slot>
      <span @click=${this.quit} class="material-symbols-outlined"
        >close</span
      > `;
  }

  static styles = [
    symbols,
    css`
      :host {
        display: flex;
        max-width: 100%;
        justify-content: space-between;
        align-items: center;
        min-width: 50vw;
        padding-bottom: 0.5em;
        border-bottom: 1px solid black;
      }

      * {
        transition: 0.2s;
      }

      span.material-symbols-outlined {
        font-size: 2em;
        padding: 0.2em;
        margin: 0 0.8em;
        cursor: pointer;
        border-bottom: 1px solid var(--color-background-alt);
        border-radius: 0.3em;
      }

      span.material-symbols-outlined:hover {
        color: var(--clickable);
        background: var(--background-light-button);
        padding: 0.3em;
      }

      :host([hideQuit]) span:last-child {
        visibility: hidden;
      }

      :host([hideBack]) span:first-child {
        visibility: hidden;
      }
    `,
  ];
}

@customElement("continue-bar")
export class ContinueBar extends LitElement {
  @property({ type: Function })
  continue = () => {};

  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    return html`<dark-button .disabled=${this.disabled} @click=${this.continue}
      >Continue</dark-button
    >`;
  }

  static styles = [
    css`
      :host {
        display: flex;
        width: 100%;
      }

      dark-button {
        margin-left: auto;
        margin-right: 20%;
      }
    `,
  ];
}
