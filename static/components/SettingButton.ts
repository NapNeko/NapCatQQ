export const SettingButton = (text: string, id?: string, type: string = 'secondary') => {
    return `<setting-button ${type ? `data-type="${type}"` : ''} ${id ? `id="${id}"` : ''}>${text}</setting-button>`
  }