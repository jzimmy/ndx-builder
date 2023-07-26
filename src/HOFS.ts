/*
 * Higher Order HTML Forms????
 */

import { NdxFormPageElem } from "./cps-forms";

// type HOFS<T, Rest> =
//   | { kind: "SINGLE"; form: FormPair<T>[] }
//   | {
//       kind: "BRANCH";
//       cond: (testVal: T) => boolean;
//       true: Rest;
//       false: Rest;
//     }
//   | {
//       kind: "CONVERTED_SEQUENCE";
//       convertTo: (val: T) => Rest;
//       convertFrom: (val: Rest) => T;
//       forms: FormPair<Rest>[];
//     }
//   | {
//       kind: "SUBFORM_ELEMENT";
//     };

interface SingleForm<T> {
  onBack: () => void;
  onNext: (val: T) => void;
  onQuit: () => void;
}

type HOF<T, K> =
  | {
      kind: "SINGLE";
      form: SingleForm<T>;
      next: HOF<T, K>;
    }
  | {
      kind: "BRANCH";
      condition: (testVal: T) => boolean;
      true: HOF<T, K>;
      false: HOF<T, K>;
    }
  | {
      kind: "CONVERTED";
      toFn: (val: T) => K;
      form: () => HOF<K, T>;
      fromFn: (val: K) => T;
      next: HOF<T, K>;
    };

const test = {};
