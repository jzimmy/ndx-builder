import { LitElement, css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { symbols } from "../../styles";

declare global {
  interface HTMLElementTagNameMap {
    carousel: Carousel;
  }
}

export abstract class CarouselItem extends LitElement {
  abstract get complete(): boolean;
}

@customElement("sliding-carousel")
export class Carousel extends LitElement {
  @state()
  slide: number = 0;

  @property({ type: String })
  title = "Extend an NWB Type";

  @property({ type: String })
  subtitle = "v0.1.0";

  @property({ type: Boolean })
  nextEnabled = true;

  @property({ type: Boolean })
  backEnabled = false;

  get canNext() {
    if (this.slide == this.childElementCount - 1) return false;
    const currSlide = this.children[this.slide];
    return !(currSlide instanceof CarouselItem) || currSlide.complete;
  }

  get canBack() {
    return this.slide != 0;
  }

  slideBack() {
    if (this.slide > 0 && this.backEnabled) this.slide = this.slide - 1;
  }

  slideNext() {
    if (this.slide < this.childElementCount - 1 && this.nextEnabled)
      this.slide = this.slide + 1;
  }

  render() {
    // shift items to current slide
    this.backEnabled = this.canBack;
    this.nextEnabled = this.canNext;

    ([...this.children] as HTMLElement[]).forEach((c) => {
      c.style.transform = `translateX(-${this.slide * 100}%)`;
    });

    return html`
      <div class="contextbar">
        <span
          class=${"material-symbols-outlined " +
          (this.backEnabled ? "enabled" : "")}
          @click=${this.slideBack}
        >
          arrow_back
        </span>
        <h1 class="title">${this.title}</h1>
        <div class="subtitle">${this.subtitle}</div>
        <span
          class=${"material-symbols-outlined " +
          (this.nextEnabled ? "enabled" : "")}
          @click=${this.slideNext}
        >
          arrow_forward
        </span>
      </div>
      <form id="ndx-main">
        <slot></slot>
      </form>
    `;
  }

  static styles = [
    symbols,
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

      :host span {
        border-radius: 25%;
        margin: 0.3em;
        padding: 0.2em;
        transition: 0.2s;
        opacity: 0.2;
        font-size: 40px;
        user-select: none;
      }

      span:last-child {
        margin-left: auto;
      }

      span.enabled {
        cursor: pointer;
        opacity: 1;
      }

      span.enabled:hover {
        background: #f0f0f0;
      }

      .title {
        margin: 0 1em;
      }

      #next {
        margin-left: auto;
      }

      #ndx-main {
        display: flex;
        flex-grow: 1;
        flex-direction: row;
        flex-wrap: nowrap;
        overflow: hidden;
      }

      ::slotted(*) {
        flex: 0 0 100%;
        transition: 0.3s;
      }
    `,
  ];
}
