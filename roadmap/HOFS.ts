/*
 * Higher Order HTML Forms????
 */

// Hacky no override typescript function descriptor, like java `final`
declare const __special_no_override_unique_symbol: unique symbol;
type NoOverride = {
  [__special_no_override_unique_symbol]: typeof __special_no_override_unique_symbol;
};

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

// The logic is implemented via functions as a data structure
// internall it uses the continuation passing style to chain forms together
// but provides a factory api to build the forms
//
// const myForm
//    .then(otherForm)
//    .then(anotherForm)
//    .branch(x => x.empty(), trueForm, falseForm)
//    .trigger(0, () => console.log("i quit"), val => console.log(val));
abstract class CPSForm<T> {
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
  abstract focus(visible: boolean): void;

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

  // start form with initial value and callbacks
  trigger(
    val: T,
    onAbandon: () => void,
    onComplete: () => void
  ): void & NoOverride {
    this.onQuit = () => {
      this.clearAndHide();
      onAbandon();
    };
    this.run(
      val,
      {
        states: this.titles,
        currState: 0,
      },
      onAbandon,
      onComplete
    );
  }

  // These are defined lazily during runtime
  private onBack: () => void = () => {
    throw new Error(`${typeof this} method onBack not implemented`);
  };
  private onNext: () => void = () => {
    throw new Error(`${typeof this} method onNext not implemented`);
  };
  private onQuit: () => void = () => {
    throw new Error(`${typeof this} method onQuit not implemented`);
  };

  // TODO: come up with a good title system
  private titles: string[] = [];

  private clearAndHide() {
    this.clear();
    this.focus(false);
  }

  // shows the form, and the current progress state
  private run = (
    val: T,
    progress: ProgressState,
    back: () => void,
    next: (val: T) => void
  ) => {
    this.fill(val, progress);
    this.focus(true);
    this.onNext = () => next(this.transform(val));
    this.onBack = back;
  };

  // use to chain forms together
  then(nextform: CPSForm<T>, progressTitle?: string): this {
    if (progressTitle) this.titles.push(progressTitle);
    this.run = (val, prog, back, next) => {
      nextform.onQuit = () => {
        nextform.clearAndHide();
        this.onQuit();
      };
      this.run(val, prog, back, (val: T) => {
        nextform.run(
          this.transform(val),
          increment_if(progressTitle, prog),
          () => this.run(val, prog, back, next),
          next
        );
      });
    };
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