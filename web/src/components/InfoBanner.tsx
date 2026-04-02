import { Alert, Snackbar } from '@mui/material'
import React, { useState } from 'react'
import { type Message } from '../data-providers/MessageBannerProvider'
import { generateKey } from '../data-providers/RandomId'

interface Props {
  message: Message
}

export default function Banner(props: Props): React.JSX.Element {
  const [show, setShow] = useState<boolean>(false)
  const [prevMessage, setPrevMessage] = useState(props.message);

  if (props.message !== prevMessage) {
    setPrevMessage(props.message);
    setShow(true);
  }

  return (
    <Snackbar
      key={generateKey()}
      open={show && props.message.content != null}
      autoHideDuration={props.message.showMs}
      onClose={() => {
        setShow(false)
      }}
    >
      <Alert
        onClose={() => {
          setShow(false)
        }}
        severity={props.message.type}
        sx={{ width: '100%' }}
      >
        {props.message.content}
      </Alert>
    </Snackbar>
  )
}
