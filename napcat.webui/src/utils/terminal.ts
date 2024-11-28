export const gradientText = (
  text: string,
  startColor: [number, number, number] = [255, 0, 0],
  endColor: [number, number, number] = [0, 0, 255],
  bold: boolean = false,
  italic: boolean = false,
  underline: boolean = false
) => {
  const steps = text.length
  const colorStep = startColor.map(
    (start, index) => (endColor[index] - start) / steps
  )

  let coloredText = ''
  for (let i = 0; i < steps; i++) {
    const color = startColor.map((start, index) =>
      Math.round(start + colorStep[index] * i)
    )
    coloredText += `\x1b[38;2;${color[0]};${color[1]};${color[2]}m${text[i]}`
  }

  // 添加样式
  if (bold) {
    coloredText = `\x1b[1m${coloredText}`
  }
  if (italic) {
    coloredText = `\x1b[3m${coloredText}`
  }
  if (underline) {
    coloredText = `\x1b[4m${coloredText}`
  }

  return coloredText + '\x1b[0m' // 重置颜色和样式
}
