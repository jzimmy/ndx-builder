import { CPSFormController, TriggerK } from "./hofs";

import { LitElement } from "lit";

export abstract class CPSForm<T>
  extends LitElement
  implements CPSFormController
{
  // show the current form based on the value and progress state, if specified
  abstract fill(val: T, progress?: ProgressState): void;

  // add information from this form
  //
  // IMPORTANT! This function must be idempotent and commutative
  // meaning that any transform f and g
  // f(f(x)) = f(x) and f(g(x)) = g(f(x)) for all x
  abstract transform(val: T): T;

  // clear the form
  abstract clear(): void;

  // show or hide the form and (usually) focus on the first input
  abstract showAndFocus(visible: boolean): void;

  // dont override
  run(states?: string[], currState = -1): TriggerK<T> {
    const state: ProgressState = {
      states: states || [],
      currState,
    };
    const triggerRec: TriggerK<T> = (val, back, next) => {
      this.fill(val, currState != -1 ? state : undefined);
      this.showAndFocus(true);
      this.onBack = () => {
        this.showAndFocus(false);
        back();
      };
      this.onNext = () => {
        this.showAndFocus(false);
        next(this.transform(val), () => triggerRec(val, back, next));
      };
    };
    return triggerRec;
  }

  clearAndHide(): void & NoOverride {
    this.clear();
    this.showAndFocus(false);
  }

  // next form
  next(): void & NoOverride {
    this.onNext();
  }
  // prev form
  back(): void & NoOverride {
    this.onBack();
  }
  // quit form
  quit(): void & NoOverride {
    this.onQuit();
  }

  // These are defined lazily during runtime
  onBack: () => void = () => {
    throw new Error(`${typeof this} method onBack not implemented`);
  };
  onNext: () => void = () => {
    throw new Error(`${typeof this} method onNext not implemented`);
  };
  onQuit: () => void = () => {
    throw new Error(`${typeof this} method onQuit not implemented`);
  };
}
// Hacky no override typescript function descriptor, like java `final`

declare const __special_no_override_unique_symbol: unique symbol;
type NoOverride = {
  [__special_no_override_unique_symbol]: typeof __special_no_override_unique_symbol;
};
// ProgressState is used to manage the step bar titles
export type ProgressState = {
  states: string[];
  currState: number | -1;
};
