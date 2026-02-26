import { Alert, Snackbar } from '@mui/material'
import { uniqueId } from 'lodash'
import React, { useState } from 'react'
import { type Message } from '../data-providers/MessageBannerProvider'

interface Props {
  message: Message
}

export default function Banner(props: Props): JSX.Element {
  const [show, setShow] = useState<boolean>(false)
  const [prevMessage, setPrevMessage] = useState(props.message);

  if (props.message !== prevMessage) {
    setPrevMessage(props.message);
    setShow(true);
  }

  return (
    <Snackbar
      key={uniqueId()}
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
