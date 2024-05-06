export const SettingList = (
    items: string[],
    title?: string,
    isCollapsible: boolean = false,
    direction: string = 'column',
  ) => {
    return `<setting-section ${title && !isCollapsible ? `data-title="${title}"` : ''}>
      <setting-panel>
          <setting-list ${direction ? `data-direction="${direction}"` : ''} ${isCollapsible ? 'is-collapsible' : ''} ${title && isCollapsible ? `data-title="${title}"` : ''}>
              ${items.join('')}
          </setting-list>
      </setting-panel>
  </setting-section>`
  }