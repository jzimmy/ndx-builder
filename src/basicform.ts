import { TemplateResult, html, css, CSSResultGroup, LitElement } from "lit";
import { state, query, property } from "lit/decorators.js";
import { CPSForm, ProgressState } from "./HOFS";
import { symbols } from "./styles";
import { FormStepBar } from "./basic-elems";
import { styleMap } from "lit/directives/style-map.js";

/* BasicFormPage
 * A good template a for a basic input 'quiz' style form,
 * Features, a current step bar, a close button, a back button, and a continue button
 *
 * Developer responsibilities for instances:
 * define isValid() method
 * define body() method
 * add this._selfValidate to all inputs
 */
export abstract class BasicFormPage<T> extends CPSForm<T> {
  abstract formTitle: string;
  @property()
  private ready: boolean = false;
  abstract isValid(): boolean;
  abstract body(): TemplateResult<1>;
  abstract get firstInput(): HTMLElement;

  hideQuit: boolean = false;

  @state()
  progressSteps: string[] = [];

  @state()
  currProgress: number = -1;

  drawProgressBar(progress?: ProgressState) {
    this.stepBar.setProgressState(progress);
  }

  showAndFocus(show: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, show, this.firstInput);
  }

  @query("input[name=continuebutton]")
  continueButton!: HTMLInputElement;

  @query("step-bar")
  private stepBar!: FormStepBar;

  _selfValidate() {
    this.ready = this.isValid();
  }

  render() {
    return html`
      <back-or-quit-bar
        .hideQuit=${this.hideQuit}
        .back=${() => this.back()}
        .quit=${() => this.quit()}
      >
        <step-bar></step-bar>
      </back-or-quit-bar>
      <h2 style=${styleMap({ "text-align": "center" })} class="title">
        ${this.formTitle}
      </h2>
      <div class="body">${this.body()}</div>
      <continue-bar
        .disabled=${!this.ready}
        .continue=${() => this.next()}
      ></continue-bar>
    `;
  }

  static styles = [
    symbols,
    css`
      :host {
        margin: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      :host > div:not(.body) {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      :host > div:last-child > input[type="button"] {
        margin-left: auto;
      }

      :host h2.title {
        text-align: center;
        margin: 0 auto;
      }

      .progress-bar {
        width: 100%;
      }

      .progress-bar > span:first-child {
        margin-right: auto;
      }

      .progress-bar > span:last-child {
        margin-left: auto;
      }

      .progress-bar > h3 {
        padding: 0 0.5em;
        text-decoration: underline;
      }

      .progress-bar > h3:not(.completed):not(.active) {
        opacity: 0.5;
        text-decoration: none;
      }

      .progress-bar > h3.active {
        color: var(--clickable);
      }

      .body {
        display: flex;
        flex-direction: column;
        width: 80%;
        justify-content: center;
        margin: auto;
        margin-bottom: 2em;
      }
    `,
  ] as CSSResultGroup;
}

export function NDXBuilderDefaultShowAndFocus(
  elem: LitElement,
  visibility: boolean,
  firstInput?: HTMLElement
) {
  elem.slot = visibility ? "currForm" : "";
  if (firstInput) firstInput.focus();
}
