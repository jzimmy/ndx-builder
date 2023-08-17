// todo implement onDelete for all
import { html, TemplateResult } from "lit";
import { NWBType, Quantity, Shape } from "../nwb/spec";
import { when } from "lit-html/directives/when.js";
import { map } from "lit-html/directives/map.js";
import { assertNever } from "../utils";
import "../inputs/dtype-input";
import "../inputs/shape-input";
import "../inputs/value-input";
import "../inputs/quantity-or-name";
import "./subtree";
import "./abstract-viz-elem";
import "./subtree";
import "./template";

export function quantityOrNameString(qOrS: Quantity | string): string {
  if (typeof qOrS == "string") return qOrS || "None";
  let [k, q] = qOrS;
  switch (k) {
    case "+":
      return "One or more";
    case "*":
      return "Any";
    case "?":
      return "Zero or one";
    case "Num":
      // we know it's a number
      return `${q as number}`;
    default:
      assertNever(k);
  }
}

export function targetTypeNameString(targetType: NWBType) {
  if (targetType[1][0] == "None") return "None";
  let [kind, ty] = targetType[1];
  switch (kind) {
    case "Core":
    case "Typedef":
      return ty.neurodataTypeDef;
    default:
      assertNever(kind);
  }
}

// TODO: this should be replaced with a <shape-viz></shape-viz> html object
export function renderShape(shapes: Shape[]): TemplateResult<1> {
  if (shapes.length == 0) return html`<div>Not specified</div>`;
  const renderOneShape = (shape: Shape, i: number) =>
    shape.length > 0
      ? html`
          ${when(i > 0, () => "OR")}
          <div class="shape-container">
            ${shape.map(
              ([k, v]) =>
                html`<div>
                  <div>${k == "None" ? "Any" : k}</div>
                  <div>${v}</div>
                </div> `
            )}
          </div>
        `
      : html``;
  return html` ${map(shapes, renderOneShape)} `;
}
