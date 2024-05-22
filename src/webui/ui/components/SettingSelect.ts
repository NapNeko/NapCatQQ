import { SettingOption } from './SettingOption';

interface MouseEventExtend extends MouseEvent {
  target: HTMLElement
}

// <ob-setting-select>
const SelectTemplate = document.createElement('template');
SelectTemplate.innerHTML = `<style>
    .hidden { display: none !important; }
</style>
<div part="parent">
        <div part="button">
            <input type="text" placeholder="请选择" part="current-text" />
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" part="button-arrow">
                <path d="M12 6.0001L8.00004 10L4 6" stroke="currentColor" stroke-linejoin="round"></path>
            </svg>
        </div>
    <ul class="hidden" part="option-list"><slot></slot></ul>
</div>`;

window.customElements.define(
  'ob-setting-select',
  class extends HTMLElement {
    readonly _button: HTMLDivElement;
    readonly _text: HTMLInputElement;
    readonly _context: HTMLUListElement;

    constructor() {
      super();

      this.attachShadow({ mode: 'open' });
      this.shadowRoot?.append(SelectTemplate.content.cloneNode(true));

      this._button = this.shadowRoot.querySelector('div[part="button"]');
      this._text = this.shadowRoot.querySelector('input[part="current-text"]');
      this._context = this.shadowRoot.querySelector('ul[part="option-list"]');

      const buttonClick = () => {
        const isHidden = this._context.classList.toggle('hidden');
        window[`${isHidden ? 'remove' : 'add'}EventListener`]('pointerdown', windowPointerDown);
      };

      const windowPointerDown = ({ target }) => {
        if (!this.contains(target)) buttonClick();
      };

      this._button.addEventListener('click', buttonClick);
      this._context.addEventListener('click', ({ target }: MouseEventExtend) => {
        if (target.tagName !== 'SETTING-OPTION') return;
        buttonClick();

        if (target.hasAttribute('is-selected')) return;

        this.querySelectorAll('setting-option[is-selected]').forEach((dom) => dom.toggleAttribute('is-selected'));
        target.toggleAttribute('is-selected');

        this._text.value = target.textContent as string;
        this.dispatchEvent(
          new CustomEvent('selected', {
            bubbles: true,
            composed: true,
            detail: {
              name: target.textContent,
              value: target.dataset.value,
            },
          }),
        );
      });

      this._text.value = this.querySelector('setting-option[is-selected]')?.textContent as string;
    }
  },
);

export const SettingSelect = (items: Array<{ text: string; value: string }>, configKey?: string, configValue?: any) => {
  return `<ob-setting-select ${configKey ? `data-config-key="${configKey}"` : ''}>
    ${items
    .map((e, i) => {
      return SettingOption(e.text, e.value, configKey && configValue ? configValue === e.value : i === 0);
    })
    .join('')}
</ob-setting-select>`;
};