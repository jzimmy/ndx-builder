import { css } from "lit";

export const shadowRootCss = css`
  :host input:focus,
  :host textarea:focus {
    outline: 2px solid #99f;
  }
`;

export const symbols = css`
  @font-face {
    font-family: "Material Symbols Outlined";
    font-style: normal;
    src: url("/node_modules/material-symbols/material-symbols-outlined.woff2")
      format("woff2");
  }

  .material-symbols-outlined {
    font-family: "Material Symbols Outlined";
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    display: inline-block;
    line-height: 1;
    text-transform: none;
    letter-spacing: normal;
    word-wrap: normal;
    white-space: nowrap;
    direction: ltr;
    vertical-align: middle;
  }
`;
