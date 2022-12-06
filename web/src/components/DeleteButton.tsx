import { Link } from 'react-router-dom'
import { Delete } from '@mui/icons-material'
import ReactTooltip from 'react-tooltip'
import React from 'react'

import styles from './../style/components/ControlButtons.module.css'

interface Props {
  isSingleButton?: boolean
}

export default function DeleteButton (props: Props): JSX.Element {
  return (
    <>
      <ReactTooltip />
      <Link to="/delete" data-tip="Delete a Documentation Version">
        <button
          className={
            props.isSingleButton === true
              ? styles['single-control-button']
              : styles['delete-button']
          }
        >
          <Delete></Delete>
        </button>
      </Link>
    </>
  )
}
