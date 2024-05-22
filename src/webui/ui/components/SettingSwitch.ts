export const SettingSwitch = (configKey?: string, isActive: boolean = false, extraData?: Record<string, string>) => {
  return `<setting-switch 
      ${configKey ? `data-config-key="${configKey}"` : ''} 
      ${isActive ? 'is-active' : ''} 
      ${extraData ? Object.keys(extraData).map((key) => `data-${key}="${extraData[key]}"`) : ''} 
      >
  </setting-switch>`;
};