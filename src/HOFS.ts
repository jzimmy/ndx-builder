/*
 * Higher Order Forms
 * An internal library for creating chained forms with programmable logic
 *
 * Uses continuation passing style to allow for backtracking and incrementally building the forms
 *
 * See FormChain for the main API
 */

import { LitElement } from "lit";

// Hacky no override typescript function descriptor, like java `final`
declare const __special_no_override_unique_symbol: unique symbol;
type NoOverride = {
  [__special_no_override_unique_symbol]: typeof __special_no_override_unique_symbol;
};

export function assertNever(_: never): never {
  throw new Error("Function not implemented.");
}

export function id<T>(x: T) {
  return x;
}

// ProgressState is used to manage the step bar titles
export type ProgressState = {
  states: string[];
  currState: number | -1;
};

export const dummyProgress: ProgressState = {
  states: ["THIS is step1", "then do step2", "then step3", "finally step4"],
  currState: 0,
};

// form trigger, this type is used in other modules
export type Trigger<T> = (
  val: T,
  onAbandon: () => void,
  onComplete: (v: T) => void
) => void;

// form trigger with backtracking continuation
// only appears inside this module
type TriggerK<T> = (
  val: T,
  back: () => void,
  fwd: (v: T, resume: () => void) => void
) => void;

/**** Continuation passing semantics (not part of API) ****/

// combine two triggers into one
function then<T>(curr: TriggerK<T>, next: TriggerK<T>): TriggerK<T> {
  return (val, back, fwd) => {
    curr(val, back, (vnext, resume) => next(vnext, resume, fwd));
  };
}

// convert a trigger from type T to a trigger of type U
function convert<T, U>(
  curr: TriggerK<T>,
  to: (v: T) => U,
  from: (v: U) => T
): TriggerK<U> {
  return (val, back, fwd) =>
    curr(from(val), back, (vnext, resume) => fwd(to(vnext), resume));
}

// branch based on a predicate
function branch<T>(
  test: (v: T) => boolean,
  trueNext: TriggerK<T>,
  falseNext: TriggerK<T>
): TriggerK<T> {
  return (val, back, fwd) => {
    test(val) ? trueNext(val, back, fwd) : falseNext(val, back, fwd);
  };
}

// choose a branch based on a key function
function choose<T, U>(
  key: (v: T) => U,
  branches: Array<[U, TriggerK<T>]>,
  defaultCase: TriggerK<T>
): TriggerK<T> {
  return (val, back, fwd) => {
    let k = key(val);
    let branch = branches.find(([k_, _]) => k_ == k);
    if (branch) {
      branch[1](val, back, fwd);
    } else if (defaultCase) {
      defaultCase(val, back, fwd);
    } else {
      throw new Error(`No branch for key ${k}`);
    }
  };
}

// TODO: document me
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

// controls the visuals of a generic CPSForm
export interface CPSFormController {
  clearAndHide(): void;
  showAndFocus(visible: boolean): void;
  onQuit: () => void;
}

export class FormChain<T> {
  private trigger: TriggerK<T>;
  private mapElems: <U>(f: (v: CPSFormController & LitElement) => U) => U[];

  // create a new form chain
  constructor(form?: CPSForm<T>, titles?: string[], index = -1) {
    if (!form) {
      this.trigger = (val, back, next) => next(val, back);
      this.mapElems = (_) => [];
      return;
    }

    this.trigger = (val, back, next) => {
      form.run(titles, index)(val, back, next);
    };
    this.mapElems = (apply) => [apply(form)];
  }

  then(f: CPSForm<T>, titles?: string[], index?: number): this {
    const oldMapElems = this.mapElems;
    const oldTrigger = this.trigger;
    this.mapElems = (apply) => [...oldMapElems(apply), apply(f)];
    this.trigger = then(oldTrigger, f.run(titles, index));
    return this;
  }

  chain(formChain: FormChain<T>) {
    const oldMapElems = this.mapElems;
    const oldTrigger = this.trigger;
    this.mapElems = (apply) => [
      ...oldMapElems(apply),
      ...formChain.mapElems(apply),
    ];
    this.trigger = then(oldTrigger, formChain.trigger);
    return this;
  }

  branch(
    test: (v: T) => boolean,
    trueForm: FormChain<T>,
    falseForm: FormChain<T>
  ): this {
    const oldMapElems = this.mapElems;
    const oldTrigger = this.trigger;
    this.mapElems = (apply) => [
      ...oldMapElems(apply),
      ...trueForm.mapElems(apply),
      ...falseForm.mapElems(apply),
    ];
    this.trigger = (val, back, fwd) =>
      oldTrigger(val, back, (vnext, resume) =>
        branch(test, trueForm.trigger, falseForm.trigger)(vnext, resume, fwd)
      );
    return this;
  }

  choose<U>(
    getkey: (v: T) => U,
    branches: Array<[U, FormChain<T>]>,
    defaultCase: FormChain<T>
  ) {
    const oldMapElems = this.mapElems;
    const oldTrigger = this.trigger;
    this.mapElems = (apply) => [
      ...oldMapElems(apply),
      ...defaultCase.mapElems(apply),
      ...branches.flatMap(([, form]) => form.mapElems(apply)),
    ];
    this.trigger = (val, back, fwd) =>
      oldTrigger(val, back, (vnext, resume) =>
        choose(
          getkey,
          branches.map(([c, b]) => [c, b.trigger]),
          defaultCase.trigger
        )(vnext, resume, fwd)
      );
    return this;
  }

  convert<U>(to: (v: T) => U, from: (v: U) => T): FormChain<U> {
    const convertedChain = new FormChain<U>();
    convertedChain.mapElems = this.mapElems;
    convertedChain.trigger = convert(this.trigger, to, from);
    return convertedChain;
  }

  withParent(parent: HTMLElement): Trigger<T> {
    return (val: T, abandon: () => void, complete: (v: T) => void) => {
      const quitFn = () => {
        this.mapElems((f) => parent.removeChild(f));
        this.mapElems((f) => (f.onQuit = () => {}));
        abandon();
      };

      this.mapElems((f) => (f.onQuit = quitFn));

      const triggerForm = () => {
        this.mapElems((f) => f.clearAndHide());
        this.trigger(val, quitFn, (v, _) => {
          this.mapElems((f) => parent.removeChild(f));
          complete(v);
        });
      };

      this.mapElems((f) => parent.appendChild(f));
      Promise.all(this.mapElems((f) => f.updateComplete)).then(triggerForm);
    };
  }
}
