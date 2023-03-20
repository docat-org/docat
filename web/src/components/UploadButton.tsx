import React from 'react'
import { FileUpload } from '@mui/icons-material'
import { Link } from 'react-router-dom'
import { Tooltip } from '@mui/material'

import styles from './../style/components/ControlButtons.module.css'

interface Props {
  isSingleButton?: boolean
}

export default function UploadButton (props: Props): JSX.Element {
  return (
    <>
      <Tooltip title="Upload Documentation" placement="top" arrow>
        <Link to="/upload"
          className={
            props.isSingleButton === true
              ? styles['single-control-button']
              : styles['upload-button']
          }
        >
          <FileUpload></FileUpload>
        </Link>
      </Tooltip>
    </>
  )
}
