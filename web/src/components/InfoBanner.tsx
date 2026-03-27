import { Alert, Snackbar } from '@mui/material'
import React, { useState } from 'react'
import { type Message } from '../data-providers/MessageBannerProvider'

interface Props {
  message: Message
}

export default function Banner(props: Props): React.JSX.Element {
  const [dismissedMessage, setDismissedMessage] = useState<Message | null>(null);

  return (
    <Snackbar
      open={props.message.content != null && props.message !== dismissedMessage}
      autoHideDuration={props.message.showMs}
      onClose={() => {
        setDismissedMessage(props.message)
      }}
    >
      <Alert
        onClose={() => {
          setDismissedMessage(props.message)
        }}
        severity={props.message.type}
        sx={{ width: '100%' }}
      >
        {props.message.content}
      </Alert>
    </Snackbar>
  )
}
