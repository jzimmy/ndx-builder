import { LitElement, css, html } from "lit";

export class FormManager extends LitElement {
  onCloseCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  onNextCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };
  onBackCallback: () => void = () => {
    throw new Error("Method not implemented.");
  };

  currForm?: LitElement;
  formTitle: string = "";
  ready: boolean = false;
  progressSteps: string[] = [];
  currProgress: number = 0;

  render() {
    return html``;
  }

  static styles = [css``];
}

abstract class FormPage<T> extends LitElement {
  abstract formTitle: string;
  abstract progressTitle: string | undefined;
  abstract validate(): boolean;
  abstract transform: (data: T) => T;
  abstract with(_data: T, _parent?: FormManager): LitElement;

  onValidateCallback = (ready: boolean) => {};
  protected _selfValidate() {
    this.onValidateCallback(this.validate());
  }
}

type TriggerFormFn<T> = (
  onAbandon: () => void,
  onComplete: (res: T) => void
) => void;

export function composeForm<T>(
  parent: FormManager,
  intialData: T,
  forms: FormPage<T>[]
): TriggerFormFn<T> {
  const HIDDEN = [];

  const progressTitles = forms
    .filter((f) => f.progressTitle !== undefined)
    .map((f) => f.progressTitle) as string[];

  function compose(
    forms: FormPage<T>[],
    currProgress: number,
    value: T,
    onBack: () => void,
    onComplete: (_: T) => void
  ) {
    if (forms.length === 0) {
      onComplete(value);
    } else {
      const [currForm, ...restForms] = forms;
      parent.formTitle = currForm.formTitle;
      if (currForm.progressTitle) {
        parent.progressSteps = progressTitles;
        parent.currProgress = currProgress;
      } else {
        parent.progressSteps = [];
      }
      parent.currForm = currForm.with(value, parent);
      parent.onNextCallback = () => {
        compose(
          restForms,
          currProgress + 1,
          currForm.transform(value),
          () => compose(forms, currProgress, value, onBack, onComplete),
          onComplete
        );
      };
      parent.onBackCallback = onBack;
    }
  }

  return (
    onAbandonCallback: () => void,
    onCompleteCallback: (res: T) => void
  ) => {
    parent.onCloseCallback = () => {
      onAbandonCallback();
      parent.onCloseCallback = () => {};
    };
    compose(forms, 0, intialData, onAbandonCallback, onCompleteCallback);
  };
}
