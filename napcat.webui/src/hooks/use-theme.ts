// originally written by @imoaazahmed
import { useLocalStorage } from '@uidotdev/usehooks'
import { useEffect, useMemo } from 'react'

const ThemeProps = {
  key: 'theme',
  light: 'light',
  dark: 'dark'
} as const

type Theme = typeof ThemeProps.light | typeof ThemeProps.dark

export const useTheme = (defaultTheme?: Theme) => {
  const [theme, setTheme] = useLocalStorage<Theme>(ThemeProps.key, defaultTheme)

  const isDark = useMemo(() => {
    return theme === ThemeProps.dark
  }, [theme])

  const isLight = useMemo(() => {
    return theme === ThemeProps.light
  }, [theme])

  const _setTheme = (theme: Theme) => {
    setTheme(theme)
    document.documentElement.classList.remove(ThemeProps.light, ThemeProps.dark)
    document.documentElement.classList.add(theme)
  }

  const setLightTheme = () => _setTheme(ThemeProps.light)

  const setDarkTheme = () => _setTheme(ThemeProps.dark)

  const toggleTheme = () =>
    theme === ThemeProps.dark ? setLightTheme() : setDarkTheme()

  useEffect(() => {
    _setTheme(theme)
  })

  return { theme, isDark, isLight, setLightTheme, setDarkTheme, toggleTheme }
}
