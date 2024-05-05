export const SettingItem = (
    title: string,
    subtitle?: string,
    action?: string,
    id?: string,
    visible: boolean = true,
  ) => {
    return `<setting-item ${id ? `id="${id}"` : ''} ${!visible ? 'is-hidden' : ''}>
      <div>
          <setting-text>${title}</setting-text>
          ${subtitle ? `<setting-text data-type="secondary">${subtitle}</setting-text>` : ''}
      </div>
      ${action ? `<div>${action}</div>` : ''}
  </setting-item>`
  }