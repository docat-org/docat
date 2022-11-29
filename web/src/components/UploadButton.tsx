import React from 'react'
import ReactTooltip from 'react-tooltip'
import { FileUpload } from '@mui/icons-material'
import { Link } from 'react-router-dom'

import styles from './../style/components/ControlButtons.module.css'

class ButtonProps {
  isSingleButton?: boolean
}

export default function UploadButton (props: ButtonProps): JSX.Element {
  return (
    <>
      <ReactTooltip />
      <Link to="/upload" data-tip="Upload Documentation">
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
