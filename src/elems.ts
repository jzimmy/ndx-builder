import { NdxTitlebar } from "./components/ndx-titlebar";
import { NdxBottombar } from "./components/ndx-bottombar";
import { NdxCarousel } from "./components/ndx-carousel";
// import { NdxSchema } from "./components/ndx-schema";
// import { NdxNamespaceBuilder } from "./components/ndx-namespace";

declare global {
  interface HTMLElementTagNameMap {
    "ndx-titlebar": NdxTitlebar;
    "ndx-bottombar": NdxBottombar;
    "ndx-carousel": NdxCarousel;
    // "ndx-schema": NdxSchema,
    // "ndx-namespace": NdxNamespaceBuilder,
  }
}

export { NdxTitlebar, NdxBottombar, NdxCarousel };
