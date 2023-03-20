import React from 'react'
import { FileUpload } from '@mui/icons-material'
import { Link } from 'react-router-dom'

import styles from './../style/components/ControlButtons.module.css'

interface Props {
  isSingleButton?: boolean
}

export default function UploadButton (props: Props): JSX.Element {
  return (
    <>
      <Link to="/upload">
        <button
          className={
            props.isSingleButton === true
              ? styles['single-control-button']
              : styles['upload-button']
          }
        >
          <FileUpload></FileUpload>
        </button>
      </Link>
    </>
  )
}
