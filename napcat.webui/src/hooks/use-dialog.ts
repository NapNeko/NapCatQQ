import React from 'react'

import { DialogContext } from '@/contexts/dialog'

const useDialog = () => {
  const dialog = React.useContext(DialogContext)

  return dialog
}

export default useDialog
