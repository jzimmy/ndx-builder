import { LitElement, html, css, CSSResultGroup } from "lit";
import { customElement, property } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { map } from "lit/directives/map.js";
import { ProgressState } from "./HOFS";

abstract class ButtonElem extends LitElement {
  @property({ type: Boolean, reflect: true })
  disabled = false;

  render() {
    return html`<slot></slot>`;
  }

  static styles = css`
    :host {
      padding: 0.3em 1em;
      border-radius: 0.2em;
      transition: 0.2s;
      display: flex;
      justify-content: center;
      cursor: pointer;
    }
    :host([disabled]) {
      cursor: default;
      pointer-events: none;
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
      :host {
        color: var(--clickable);
        border: 2px solid var(--clickable);
        background: var(--background-light-button);
      }
      :host([picked]) {
        background: inherit;
      }
      :host([disabled]) {
        color: var(--color-border-alt);
        border: 1px solid var(--color-border-alt);
      }
      :host(:hover) {
        color: var(--clickable-hover);
        border: 2px solid var(--clickable-hover);
      }
      :host(:not([disabled]):hover) {
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

@customElement("step-bar")
export class FormStepBar extends LitElement {
  @property({ reflect: true })
  hidden: boolean = false;

  @property({ type: Array<String> })
  steps: string[] = [];

  @property({ type: Number })
  currStep: number = -1;

  setProgressState(progress?: ProgressState) {
    this.hidden = progress == undefined;
    if (progress) {
      this.currStep = progress.currState;
      this.steps = progress.states;
    }
  }

  render() {
    return html`${map(this.steps, (step, i) => {
      return html`<h3
        class=${classMap({
          active: i == this.currStep,
          completed: i < this.currStep,
        })}
      >
        ${step}
      </h3>`;
    })}`;
  }

  static styles = css`
    :host {
      display: flex;
      flex-direction: row;
    }

    :host[hidden] {
      display: none;
    }

    h3 {
      margin: 0;
      padding: 0 1em;
      text-decoration: underline;
    }

    h3:not(.completed):not(.active) {
      opacity: 0.5;
    }

    h3.active {
      color: var(--clickable);
    }
  `;
}

interface WithValue {
  value: string;
}

abstract class NdxInputElem<T extends WithValue> extends LitElement {
  @property({ type: Function, reflect: true })
  validateInput: (s: string) => true | false | ["ERROR", string] = (_) => true;
  abstract input: T;
  abstract errorMessage: string;

  get value(): string | null {
    const currValue = this.input.value;
    const validationSuccess = this.validateInput(currValue);
    if (validationSuccess == true) return currValue;
    if (validationSuccess == false) return null;
    this.errorMessage = validationSuccess[1];
    return null;
  }
}
