import { TemplateResult, html, css, CSSResultGroup } from "lit";
import { property, state, query } from "lit/decorators.js";
import { styleMap } from "lit/directives/style-map.js";
import { FormStepBar } from "../basic-elems";
import { namespaceBuilderSteps } from "../formchains";
import { CPSForm, ProgressState } from "../logic/cpsform";
import { symbols } from "../styles";
import { NDXBuilderDefaultShowAndFocus } from "../parent";

/*****
 * BasicFormPage
 * A good template a for a basic input 'quiz' style form,
 * Features, a current step bar, a close button, a back button, and a continue button
 *
 * Developer responsibilities for creating instances:
 * define isValid() method
 * define body() method
 * add this._selfValidate to all inputs
 *
 * -- and then the regular CPSForm interface --
 * fill(val) -> void method
 *  - make sure to call this.drawProgressBar() in fill
 * transform(val) -> val method
 * clear() -> void method
 */

export abstract class BasicFormPage<T> extends CPSForm<T> {
  abstract formTitle: string;
  @property()
  private ready: boolean = false;
  abstract isValid(): boolean;
  abstract body(): TemplateResult<1>;
  abstract get firstInput(): HTMLElement | undefined;

  hideQuit: boolean = false;

  @state()
  progressSteps: string[] = [];

  @state()
  currProgress: number = -1;

  drawProgressBar(progress?: ProgressState) {
    this.stepBar.setProgressState(progress);
  }

  withTitle(title: string): BasicFormPage<T> {
    this.formTitle = title;
    return this;
  }

  showAndFocus(show: boolean): void {
    NDXBuilderDefaultShowAndFocus(this, show, this.firstInput);
  }

  @query("input[name=continuebutton]")
  continueButton!: HTMLInputElement;

  @query("step-bar[id=type]")
  private stepBar!: FormStepBar;

  _selfValidate() {
    this.ready = this.isValid();
  }

  metaStepBar: TemplateResult<1> = html``;

  render() {
    return html`
      ${this.metaStepBar}
      <back-or-quit-bar
        .hideQuit=${this.hideQuit}
        .back=${() => this.back()}
        .quit=${() => this.quit()}
      >
        <step-bar id="type"></step-bar>
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

      .clickbox-wrapper {
        display: flex;
        flex-wrap: nowrap;
        justify-content: center;
      }

      .clickbox {
        font-weight: 500;
        margin: 0 0.5em;
        padding: 0.5em 0.8em;
        border: 2px solid var(--color-border-alt);
        cursor: pointer;
        border-radius: 0.3em;
      }

      .clickbox.selected {
        color: var(--clickable);
        border: 2px solid var(--clickable);
        text-decoration: underline;
      }

      .clickbox:hover {
        color: var(--clickable-hover);
        border: 2px solid var(--clickable-hover);
      }
    `,
  ] as CSSResultGroup;
}
/****
 *
 * This is a version of BasicFormPage that has a meta step bar with
 * the namespace builder steps and current state of `add types`
 *
 * Only use it for forms that help to build a type
 * */

export abstract class BasicTypeBuilderFormPage<T> extends BasicFormPage<T> {
  progress: ProgressState = {
    states: namespaceBuilderSteps,
    currState: 0,
  };

  metaStepBar: TemplateResult<1> = html`
    <step-bar
      .steps=${this.progress.states}
      .currStep=${this.progress.currState}
      style="opacity:0.6;margin-bottom:0.5em;"
    ></step-bar>
  `;
}
