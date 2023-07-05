import { NdxTitlebar } from "./components/generic/ndx-titlebar";
import { NdxBottombar } from "./components/generic/ndx-bottombar";
import { NdxCarousel } from "./components/generic/ndx-carousel";
import { NdxNamespaceBuilder } from "./components/namespace-form/ndx-namespace";
import { NdxSchema } from "./components/namespace-form/ndx-schema";
import { NdxTypesBuilder } from "./components/type-builder/types-builder";

export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}

declare global {
  interface HTMLElementTagNameMap {
    "ndx-titlebar": NdxTitlebar;
    "ndx-bottombar": NdxBottombar;
    "ndx-carousel": NdxCarousel;
    "ndx-schema": NdxSchema;
    "ndx-namespace": NdxNamespaceBuilder;
    "ndx-type-builder": NdxTypesBuilder;
  }
}

export {
  NdxTitlebar,
  NdxBottombar,
  NdxCarousel,
  NdxSchema,
  NdxNamespaceBuilder,
  NdxTypesBuilder,
};
