export const SettingOption = (text: string, value?: string, isSelected: boolean = false) => {
  return `<setting-option ${value ? `data-value="${value}"` : ''} ${isSelected ? 'is-selected' : ''}>${text}</setting-option>`;
};