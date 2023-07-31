/*
 * Higher Order HTML Forms????
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

// ProgressState is used to manage the step bar titles
type ProgressState = {
  states: string[];
  currState: number | -1;
};

/*
 * Algorithmic laws for FormChain
 *
 * formchain_new(form, state)(val, back, next) => show(form, state, val, back, next)
 * formchain_then(formchain_new(form, state), form')(val, back, next) =>
 *   formchain_new(form, state)(
 *      val,
 *      back,
 *     (val) =>
 * , next))
 *
 *
 *
 *
 * show(form)(val, state, back, next) => {
 *  form.showAndFocus(true)
 *  form.fill(val, state)
 *  form.onBack = () => {form.showAndFocus(false); back()}
 *  form.onNext = () => {form.showAndFocus(false); next(form.transform(val))}
 */

type FormTrigger<T> = (
  val: T,
  onAbandon: () => void,
  onComplete: (v: T) => void
) => void;

// /* FormChain<T> is a set of two trigger functions, one that triggers the first
//  * form in the chain, and one that triggers the last form.
//  *
//  * In the case of a chain with only form, both functions will be the same.
//  */
// type FormChainTriggers<T> = [FormTrigger<T>, FormTrigger<T>];

// // make a pair of the same value
// const double = <T>(x: T) => [x, x] as [T, T];

// // combine two formchains into one
// function then<T>(
//   [trigCurrFirst, trigCurrLast]: FormChainTriggers<T>,
//   [trigNextFirst, trigNextLast]: FormChainTriggers<T>
// ): FormChainTriggers<T> {
//   return [
//     (val, back, next) => {
//       trigCurrFirst(val, back, (val) => {
//         trigNextFirst(val, () => trigCurrLast(val, back, next), next);
//       });
//     },
//     trigNextLast,
//   ];
// }

// // add a conditonal branch to the form chain
// function branch<T>(
//   [trigCurrFirst, trigCurrLast]: FormChainTriggers<T>,
//   test: (v: T) => boolean,
//   [trigTrueFirst, trigTrueLast]: FormChainTriggers<T>,
//   [trigFalseFirst, trigFalseLast]: FormChainTriggers<T>
// ): FormChainTriggers<T> {
//   return [
//     (val, back, next) => {
//       trigCurrFirst(val, back, (val) => {
//         test(val)
//           ? trigTrueFirst(val, () => trigCurrLast(val, back, next), next)
//           : trigFalseFirst(val, () => trigCurrLast(val, back, next), next);
//       });
//     },
//     (val, back, next) => {
//       test(val)
//         ? trigTrueLast(val, back, next)
//         : trigFalseLast(val, back, next);
//     },
//   ];
// }

// // convert a formchain of type T to a formchain of type U
// function convert<T, U>(
//   [trigFirst, trigLast]: FormChainTriggers<U>,
//   from: (val: U) => T,
//   to: (val: T) => U
// ): FormChainTriggers<T> {
//   return [
//     (val, back, next) => {
//       trigFirst(to(val), back, (val) => next(from(val)));
//     },
//     (val, back, next) => {
//       trigLast(to(val), back, (val) => next(from(val)));
//     },
//   ];
// }

// // The logic is implemented via functions as a data structure
// // internall it uses the continuation passing style to chain forms together
// // but provides a factory api to build the forms
// export abstract class CPSForm<T> extends LitElement {
//   static start<U>(firstForm: CPSForm<U>): CPSForm<U> {
//     return firstForm;
//   }

//   // show the current form based on the value and progress state, if specified
//   abstract fill(val: T, progress?: ProgressState): void;

//   // add information from this form
//   //
//   // IMPORTANT! This function must be idempotent and commutative
//   // meaning that any transform f and g
//   // f(f(x)) = f(x) and f(g(x)) = g(f(x)) for all x
//   abstract transform(val: T): T;

//   // clear the form
//   abstract clear(): void;

//   // show or hide the form and (usually) focus on the first input
//   abstract showAndFocus(visible: boolean): void;

//   // dont override
//   run(states: string[], currState: number): FormTrigger<T> {
//     const state: ProgressState = { states, currState };
//     return (val, back, next) => {
//       this.fill(val, currState == -1 ? state : undefined);
//       this.showAndFocus(true);
//       this.onBack = () => {
//         this.showAndFocus(false);
//         back();
//       };
//       this.onNext = () => {
//         this.showAndFocus(false);
//         next(this.transform(val));
//       };
//     };
//   }

//   // next form
//   next(): void & NoOverride {
//     this.onNext();
//   }
//   // prev form
//   back(): void & NoOverride {
//     this.onBack();
//   }
//   // quit form
//   quit(): void & NoOverride {
//     this.onQuit();
//   }

//   // These are defined lazily during runtime
//   onBack: () => void = () => {
//     throw new Error(`${typeof this} method onBack not implemented`);
//   };
//   onNext: () => void = () => {
//     throw new Error(`${typeof this} method onNext not implemented`);
//   };
//   onQuit: () => void = () => {
//     throw new Error(`${typeof this} method onQuit not implemented`);
//   };

//   clearAndHide() {
//     this.clear();
//     this.showAndFocus(false);
//   }
// }

// export class FormChain<T> {
//   allFormElems: Array<HTMLElement> = [];
//   steps: string[] = [];

//   // builds the pair of trigger functions, also handles progress bar state
//   private build: (states: string[], index: number) => FormChainTriggers<T>;

//   // create a new form chain
//   constructor(f: CPSForm<T>, progressTitle?: string) {
//     this.allFormElems.push(f);
//     if (progressTitle) this.steps = [progressTitle];
//     this.build = (states: string[], step: number) => {
//       return double(f.run(states, progressTitle ? step : -1));
//     };
//   }

//   then(f: CPSForm<T>, progressTitle?: string): this {
//     this.allFormElems = [...this.allFormElems, f];
//     if (progressTitle) this.steps = [...this.steps, progressTitle];
//     const lastBuild = this.build;
//     const newBuild: typeof this.build = (states, step) =>
//       then(
//         lastBuild(states, step),
//         double(f.run(states, progressTitle ? step + 1 : -1))
//       );
//     this.build = newBuild;
//     return this;
//   }

//   branch(
//     test: (v: T) => boolean,
//     trueForm: FormChain<T>,
//     falseForm: FormChain<T>
//   ): this {
//     this.allFormElems = [
//       ...this.allFormElems,
//       trueForm.allFormElems,
//       falseForm.allFormElems,
//     ].flat();
//     const oldBuild = this.build;
//     this.build = (states, step) =>
//       branch(
//         oldBuild(states, step),
//         test,
//         trueForm.build([states, trueForm.steps].flat(), step + 1),
//         falseForm.build([states, falseForm.steps].flat(), step + 1)
//       );
//     return this;
//   }

//   withParent(parent: HTMLElement): FormTrigger<T> {
//     this.allFormElems.forEach((elem) => parent.appendChild(elem));
//     return this.build(this.steps, 0)[0];
//   }

//   concat(f: FormChain<T>): this {
//     this.allFormElems = [...this.allFormElems, ...f.allFormElems];
//     const lastBuild = this.build;
//     const newBuild: typeof this.build = (states, step) =>
//       then(lastBuild(states, step), f.build(states, step + f.steps.length));
//     this.build = newBuild;
//     return this;
//   }

//   concatConverted<U>(
//     f: FormChain<U>,
//     to: (val: T) => U,
//     from: (val: U) => T
//   ): this {
//     this.allFormElems = [...this.allFormElems, ...f.allFormElems];
//     const lastBuild = this.build;
//     const newBuild: typeof this.build = (states, step) =>
//       then(lastBuild(states, step), convert(f.build(states, step), from, to));
//     this.build = newBuild;
//     return this;
//   }
// }

type TriggerK<T, U> =
  | {
      kind: "SINGLE";
      trigger: FormTrigger<T>;
      next: TriggerK<T, U>;
    }
  | {
      kind: "BRANCH";
      test: (v: T) => boolean;
      trueNext: TriggerK<T, U>;
      falseNext: TriggerK<T, U>;
    }
  | {
      kind: "CONVERT";
      to: (val: T) => U;
      from: (val: U) => T;
      next: TriggerK<U, any>;
    }
  | {
      kind: "NIL";
    };

function thenTriggerK<T, U>(
  trigger: FormTrigger<T>,
  k: (tk: TriggerK<T, U>) => TriggerK<T, U>
) {
  return (tk: TriggerK<T, U>) => k({ kind: "SINGLE", trigger, next: tk });
}

function branchTriggerK<T, U>(
  test: (v: T) => boolean,
  trueK: (tk: TriggerK<T, U>) => TriggerK<T, U>,
  falseK: (tk: TriggerK<T, U>) => TriggerK<T, U>,
  k: (tk: TriggerK<T, U>) => TriggerK<T, U>
) {
  return (tk: TriggerK<T, U>) =>
    k({
      kind: "BRANCH",
      test,
      trueNext: trueK(tk),
      falseNext: falseK(tk),
    });
}

function convertTriggerK<T, U>(
  to: (val: T) => U,
  from: (val: U) => T,
  trigger: FormTrigger<U>,
  k: (tk: TriggerK<T, U>) => TriggerK<T, U>
) {
  return (tk: TriggerK<T, U>) =>
    k({
      kind: "SINGLE",
      trigger: (val, back, next) =>
        trigger(to(val), back, (val) => next(from(val))),
      next: tk,
    });
}

function composeTriggerK<T, U>(tk: TriggerK<T, U>): FormTrigger<T> {
  function compose(
    k: TriggerK<T, U>,
    val: T,
    back: () => void,
    next: (val: T) => void
  ) {
    switch (k.kind) {
      case "SINGLE":
        k.trigger(val, back, (val) =>
          compose(k.next, val, () => compose(k, val, back, next), next)
        );
        break;
      case "BRANCH":
        k.test(val)
          ? compose(k.trueNext, val, () => compose(k, val, back, next), next)
          : compose(k.falseNext, val, () => compose(k, val, back, next), next);
        break;
      case "NIL":
        next(val);
        break;
    }
  }
  return (val, back, next) => compose(tk, val, back, next);
}

// LL EXERCISE

type LL<T> =
  | {
      kind: "CONS";
      val: T;
      rest: LL<T>;
    }
  | {
      kind: "NIL";
    };

function makeLL(n: number, k: (ll: LL<number>) => LL<number>): LL<number> {
  return n == 0
    ? k({ kind: "NIL" })
    : makeLL(n - 1, (rest) => k({ kind: "CONS", val: n, rest }));
}

function llBuilder(n: number, k: (ll: LL<number>) => LL<number>) {
  return (ll: LL<number>) => k({ kind: "CONS", val: n, rest: ll });
}

var dcount = 0;

function appendLL(
  ll1: LL<number>,
  ll2: LL<number>,
  k: (ll: LL<number>) => LL<number>
): LL<number> {
  return ll1.kind == "NIL"
    ? k(ll2)
    : appendLL(ll1.rest, ll2, (rest) =>
        k({ kind: "CONS", val: ll1.val, rest })
      );
}

const ll1 = makeLL(1, (ll) => ll);
const ll2 = makeLL(10, (ll) => ll);
const ll3 = appendLL(ll1, ll2, (ll) => ll);

function LLtoArray<T>(ll: LL<T>): T[] {
  return ll.kind == "NIL" ? [] : [ll.val, ...LLtoArray(ll.rest)];
}

const llnull = { kind: "NIL" } as LL<number>;
const id = <T>(x: T) => {
  return x;
};

const llk = llBuilder(1, id);
const llk2 = llBuilder(2, llk);
const ll = llBuilder(3, llk2)(llnull);

console.log(LLtoArray(ll));

console.log(dcount);
