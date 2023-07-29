/*
 * Higher Order HTML Forms????
 */

import { LitElement } from "lit";
import { TriggerFormFn } from "./form-elem";

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

function increment_if(b: any, p: ProgressState) {
  if (!b) return p;
  return {
    ...p,
    currState: p.currState + 1,
  };
}

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

type FormChainNode<T> = {
  back: () => FormChainNode<T>;
  next: (val: T) => FormChainNode<T>;
  title: string;
};

export class FormChain<T> {
  private static run =
    <T>(form: CPSForm<T>) =>
    (val: T, state: ProgressState, back: () => void, next: (v: T) => void) => {
      form.showAndFocus(true);
      form.fill(val, state);
      form.onNext = () => {
        form.showAndFocus(false);
        next(form.transform(val));
      };
      form.onBack = () => {
        form.showAndFocus(false);
        back();
      };
    };

  private trigger: (
    init: T,
    onAbandon: () => void,
    onComplete: (v: T) => void
  ) => void;

  state: ProgressState;
  parent?: HTMLElement;
  allForms: HTMLElement[];
  currForm: CPSForm<T>;

  constructor(firstform: CPSForm<T>, progressTitle?: string) {
    const prog: ProgressState = {
      states: progressTitle ? [progressTitle] : [],
      currState: 0,
    };
    this.state = prog;
    this.allForms = [firstform];
    this.currForm = firstform;
    this.trigger = (v, b, n) => FormChain.run(firstform)(v, this.state, b, n);
  }

  withParent(
    parent: HTMLElement
  ): (initial: T, onAbandon: () => void, onComplete: (v: T) => void) => void {
    this.parent = parent;
    return (initial: T, onAbandon: () => void, onComplete: (v: T) => void) => {
      this.currForm.onQuit = onAbandon;
      this.allForms.flat().forEach((f) => this.parent?.appendChild(f));
      // give it a second to render out at first
      // TODO: find a better way to do this
      setTimeout(
        () =>
          this.trigger(
            initial,
            () => {
              this.allForms.flat().forEach((f) => this.parent?.removeChild(f));
              onAbandon();
            },
            (val: T) => {
              this.allForms.flat().forEach((f) => this.parent?.removeChild(f));
              onComplete(val);
            }
          ),
        10
      );
    };
  }

  then = (nextform: CPSForm<T>, progressTitle?: string): FormChain<T> => {
    const currform = this.currForm;
    const newFormChain = new FormChain<T>(nextform);
    newFormChain.allForms = [...this.allForms, nextform];
    newFormChain.state = { ...this.state, states: [...this.state.states] };
    newFormChain.trigger = (
      init: T,
      onAbandon: () => void,
      onComplete: (val: T) => void
    ) => {
      currform.onQuit = () => {
        currform.clearAndHide();
        nextform.onQuit();
      };
      this.trigger(init, onAbandon, (val: T) => {
        FormChain.run(nextform)(
          val,
          newFormChain.state,
          // is this actually recusion?
          () => newFormChain.trigger(init, onAbandon, onComplete),
          onComplete
        );
      });
    };
    return newFormChain;
  };
}

// The logic is implemented via functions as a data structure
// internall it uses the continuation passing style to chain forms together
// but provides a factory api to build the forms
//
// const myForm
//    .then(otherForm)
//    .then(anotherForm)
//    .branch(x => x.empty(), trueForm, falseForm)
//    .trigger(0, () => console.log("i quit"), val => console.log(val));
export abstract class CPSForm<T> extends LitElement {
  static start<U>(firstForm: CPSForm<U>): CPSForm<U> {
    return firstForm;
  }
  // show the current form based on the value and progress state
  abstract fill(val: T, progress: ProgressState): void;

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

  // use these in your implementated UI of CPSForm

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

  with_parent(parent: HTMLElement): this {
    this.parent = parent;
    return this;
  }

  // start form with initial value and callbacks
  trigger(
    val: T,
    onAbandon: () => void,
    onComplete: (v: T) => void
  ): void & NoOverride {
    console.log("TRIGGERED");
    this.allFormsElems.forEach((elem) => this.parent?.appendChild(elem));
    this.onQuit = () => {
      this.allFormsElems.forEach((elem) => this.parent?.removeChild(elem));
      this.clearAndHide();
      onAbandon();
    };
    setTimeout(
      () =>
        this.run(
          val,
          {
            states: this.titles,
            currState: 0,
          },
          onAbandon,
          onComplete
        ),
      10
    );
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

  // TODO: come up with a good title system
  private titles: string[] = [];
  private allFormsElems: Array<HTMLElement> = [this];
  private parent?: HTMLElement;

  clearAndHide() {
    this.clear();
    this.showAndFocus(false);
  }

  private static show =
    <T>(form: CPSForm<T>) =>
    (
      val: T,
      progress: ProgressState,
      back: () => void,
      next: (val: T) => void
    ) => {
      form.showAndFocus(true);
      form.fill(val, progress);
      form.onNext = () => {
        form.showAndFocus(false);
        next(form.transform(val));
      };
      form.onBack = () => {
        form.showAndFocus(false);
        back();
      };
    };

  // shows the form, and the current progress state
  private run = (
    val: T,
    progress: ProgressState,
    back: () => void,
    next: (val: T) => void
  ) => {
    this.showAndFocus(true);
    this.fill(val, progress);
    this.onNext = () => {
      this.showAndFocus(false);
      next(this.transform(val));
    };
    this.onBack = () => {
      this.showAndFocus(false);
      back();
    };
  };

  // use to chain forms together
  then(nextform: CPSForm<T>, progressTitle?: string): this {
    this.allFormsElems = [...this.allFormsElems, nextform.allFormsElems].flat();
    if (progressTitle) this.titles.push(progressTitle);

    // javascript weirdness with references
    const oldrun = this.run;
    const quitFn = this.onQuit;

    function newrun(
      val: T,
      prog: ProgressState,
      back: () => void,
      next: (_: T) => void
    ): void {
      // add onQuit to the next form
      nextform.onQuit = () => {
        nextform.clearAndHide();
        quitFn();
      };

      // run this form, but make the next form run after this one
      oldrun(val, prog, back, (val: T) => {
        console.log("CALLED NEXT to", nextform);
        CPSForm.show(nextform)(
          val,
          increment_if(progressTitle, prog),
          () => newrun(val, prog, back, next),
          next
        );
      });
    }
    this.run = newrun;
    return this;
  }

  then_many(nextforms: [CPSForm<T>, string | undefined][]): this {
    return nextforms.reduce(
      (acc, [nextform, progressTitle]) => acc.then(nextform, progressTitle),
      this
    );
  }

  // add a branch to the chain
  // usually branches will use a different data type pattern matching an ADT
  // use a convert to change the data type
  branch(
    test: (v: T) => boolean,
    trueForm: CPSForm<T>,
    falseForm: CPSForm<T>,
    progressTitle: string
  ): this {
    this.allFormsElems = [
      ...this.allFormsElems,
      trueForm.allFormsElems,
      falseForm.allFormsElems,
    ].flat();
    if (progressTitle) this.titles.push(progressTitle);
    this.run = (val, prog, back, next) => {
      // both forms should clear on quit
      const onQuit = () => {
        trueForm.clearAndHide();
        falseForm.clearAndHide();
        this.onQuit();
      };
      trueForm.onQuit = onQuit;
      falseForm.onQuit = onQuit;

      // both forms should increment the progress state
      this.run(val, prog, back, (val: T) => {
        if (test(val)) {
          trueForm.run(val, increment_if(progressTitle, prog), back, next);
        } else {
          falseForm.run(val, increment_if(progressTitle, prog), back, next);
        }
      });
    };
    return this;
  }

  // add a form with a different data type
  convert<U>(
    to: (val: T) => U,
    from: (val: U) => T,
    nextform: CPSForm<U>
  ): this {
    this.allFormsElems = [...this.allFormsElems, nextform].flat();
    this.run = (val, prog, back, next) => {
      // clear on quit
      nextform.onQuit = () => {
        nextform.clearAndHide();
        this.onQuit();
      };

      // run the next form with the converted value
      this.run(val, prog, back, (val: T) => {
        nextform.run(to(val), prog, back, (val: U) => {
          next(from(val));
        });
      });
    };
    return this;
  }
}
