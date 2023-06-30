import { css } from "lit";

export const buttonStyles = css`
  .lightbtn {
    border-radius: 8%;
    margin: 0.3em 0;
    padding: 0.2em;
    margin-right: auto;
    border: 1px solid #808080;
    cursor: pointer;
  }

  .actionbtn {
    border-radius: 8%;
    margin: 0.3em 0;
    padding: 0.2em 1em;
    color: #fff;
    font-weight: bold;
    background: rgb(60, 110, 255);
    cursor: pointer;
  }

  .actionbtn:hover {
    background: rgb(40, 80, 255);
  }
`;
