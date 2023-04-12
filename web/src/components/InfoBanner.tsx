import { Alert, Snackbar } from '@mui/material'
import { uniqueId } from 'lodash'
import React, { useEffect, useState } from 'react'
import { Message } from '../data-providers/MessageBannerProvider'

interface Props {
  message: Message
}

export default function Banner (props: Props): JSX.Element {
  const [show, setShow] = useState<boolean>(false)

  useEffect(() => {
    setShow(true)
  }, [props.message])

  return (
    <Snackbar
      key={uniqueId()}
      open={show && props.message.content != null}
      autoHideDuration={props.message.showMs}
      onClose={() => setShow(false)}
    >
      <Alert
        onClose={() => setShow(false)}
        severity={props.message.type}
        sx={{ width: '100%' }}
      >
        {props.message.content}
      </Alert>
    </Snackbar>
  )
}
