import { LitElement } from "lit";
import { property } from "lit/decorators.js";

export abstract class NdxInputElem<T> extends LitElement {
  isValid = () => true;

  abstract firstFocusableElem?: HTMLElement;

  // **usually** won't overwrite a filled value with an empty one
  abstract fill(val: T): void;

  // null if invalid
  abstract value(): T | null;

  // clear the input
  abstract clear(): void;

  @property({ type: Boolean })
  required: boolean = true;

  // this callback is called upon interaction
  @property({ type: Function })
  onInteraction: () => void = () => {};
}
