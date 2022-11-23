import { Alert, Snackbar } from '@mui/material'
import React, { useEffect, useState } from 'react'

interface Props {
  errorMsg?: string
  successMsg?: string
  timeout?: number
}

function isNotEmpty (str: string | undefined): boolean {
  return str != null && str.trim() !== ''
}

class Message {
  msg = ''
  type: 'error' | 'success' = 'error'

  constructor (props: Props) {
    if (isNotEmpty(props.errorMsg)) {
      this.msg = props.errorMsg ?? ''
      this.type = 'error'
    } else if (isNotEmpty(props.successMsg)) {
      this.msg = props.successMsg ?? ''
      this.type = 'success'
    }
  }
}

export default function Banner (props: Props): JSX.Element {
  const [msg, setMsg] = useState<Message>(new Message(props))
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    if (isNotEmpty(props.errorMsg) || isNotEmpty(props.successMsg)) {
      setMsg(new Message(props))
      setShow(true)
    }
  }, [props])

  return (
    <Snackbar
      key={`${msg.msg}`}
      open={show}
      autoHideDuration={props.timeout ?? 6000}
      onClose={() => setShow(false)}
    >
      <Alert
        onClose={() => setShow(false)}
        severity={msg.type}
        sx={{ width: '100%' }}
      >
        {msg.msg}
      </Alert>
    </Snackbar>
  )
}
