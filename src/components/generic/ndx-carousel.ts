import { LitElement, css, html, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("ndx-carousel")
export class NdxCarousel extends LitElement {
  @state()
  slide: number = 0;

  @property({ type: String })
  title = "Create a namespace";

  @property({ type: String })
  subtitle = "v0.1.0";

  @property({ type: Boolean })
  nextEnabled = true;

  @property({ type: Boolean })
  backEnabled = true;

  get length() {
    return this.childElementCount - 1;
  }

  // info
  buttonSize = 40;
  xmlnl = "http://www.w3.org/2000/svg";
  backArrow = svg`<path d="M480-160 160-480l320-320 42 42-248 248h526v60H274l248 248-42 42Z"/>`;
  nextArrow = svg`<path d="m480-160-42-43 247-247H160v-60h525L438-757l42-43 320 320-320 320Z"/>`;

  slideBack() {
    if (this.slide > 0 && this.backEnabled) {
      this.slide = this.slide - 1;
    }
  }

  slideNext() {
    if (this.slide < this.length && this.nextEnabled) {
      this.slide = this.slide + 1;
    }
  }

  render() {
    const children = [...this.children] as HTMLElement[];
    children.forEach(
      (child) => (child.style.transform = `translateX(-${this.slide * 100}%)`)
    );
    return html`
      <div class="contextbar">
        <svg
          id="back"
          class=${this.slide != 0 && this.backEnabled ? "enabled" : ""}
          @click=${this.slideBack}
          height="${this.buttonSize}"
          width="${this.buttonSize}"
          xmlns="${this.xmlnl}"
          viewBox="0 -960 960 960"
        >
          ${this.backArrow}
        </svg>
        <h1 class="title">${this.title}</h1>
        <div class="subtitle">${this.subtitle}</div>
        <svg
          id="next"
          class=${this.slide != this.length && this.nextEnabled
            ? "enabled"
            : ""}
          @click=${this.slideNext}
          height="${this.buttonSize}"
          width="${this.buttonSize}"
          xmlns="${this.xmlnl}"
          viewBox="0 -960 960 960"
        >
          ${this.nextArrow}
        </svg>
      </div>
      <form id="ndx-main">
        <slot></slot>
      </form>
    `;
  }

  static styles = [
    css`
      :host {
        overflow: hidden;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .contextbar {
        display: flex;
        flex-direction: row;
        border-bottom: 1px solid var(--color-border-alt);
        align-items: center;
        padding: 20px;
      }

      svg {
        border-radius: 25%;
        margin: 0.3em;
        padding: 0.2em;
        transition: 0.2s;
        opacity: 0.2;
      }

      .enabled {
        opacity: 1;
      }

      .enabled:hover {
        background: #f0f0f0;
      }

      .title {
        margin: 0 1em;
      }

      #next {
        margin-left: auto;
      }

      #ndx-main {
        margin-bottom: auto;
        flex: 1;
        overflow: hidden;
        display: flex;
        flex-direction: row;
      }

      ::slotted(*) {
        flex-shrink: 0;
        width: 100%;
        height: 100%;
        transition: 0.3s;
      }
    `,
  ];
}
