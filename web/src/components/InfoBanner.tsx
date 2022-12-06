import { Alert, Snackbar } from '@mui/material'
import { uniqueId } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Message } from '../data-providers/MessageBannerProvider'

interface Props {
  errorMsg?: string
  successMsg?: string
}

export default function Banner(props: Props): JSX.Element {
  const messageFromProps = (props: Props): Message => {
    if (props.errorMsg != null && props.errorMsg.trim() !== '') {
      return { text: props.errorMsg, type: 'error' }
    }
    if (props.successMsg != null && props.successMsg.trim() !== '') {
      return { text: props.successMsg, type: 'success' }
    }

    return { text: undefined, type: 'success' }
  }

  const [msg, setMsg] = useState<Message>(messageFromProps(props))
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    setShow(true)
    setMsg(messageFromProps(props))
  }, [props])

  return (
    <Snackbar
      key={uniqueId()}
      open={show && msg.text != null}
      autoHideDuration={6000}
      onClose={() => setShow(false)}
    >
      <Alert
        onClose={() => setShow(false)}
        severity={msg.type}
        sx={{ width: '100%' }}
      >
        {msg.text}
      </Alert>
    </Snackbar>
  )
}
