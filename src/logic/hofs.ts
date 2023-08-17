/*
 * Higher Order Forms
 * An internal library for creating chained forms with programmable logic
 *
 * Uses continuation passing style to allow for backtracking and incrementally building the forms
 *
 * Trigger is a function that takes:
 *  - Initial data
 *  - A callback for exiting the form
 *  - A callback for completing the form that is given the transformed data
 *
 * Triggers can be safely combined using:   ** composition operators **
 *
 * There are four basic operators
 *   - then (sequential composition)
 *   - branch (if-then-else composition)
 *   - choose (switch composition)
 *   - convert (type conversion)
 *
 * If the type checker approves of your composition,
 * it will pretty much just work!
 *
 * Composition will also handle backtracking
 *
 * See FormChain for the main API to build
 */

import { LitElement } from "lit";
import { CPSForm } from "./cps-form";

// form trigger, this type is used in other modules
export type Trigger<T> = (
  val: T,
  onAbandon: () => void,
  onComplete: (v: T) => void
) => void;

// form trigger with backtracking continuation
// only appears inside this module and cpsform.ts
export type TriggerK<T> = (
  val: T,
  back: () => void,
  fwd: (v: T, resume: () => void) => void
) => void;

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

  alreadyHasTitles = false;

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

/**** The real operators ****/
/**** Using continuation passing semantics ****/

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
