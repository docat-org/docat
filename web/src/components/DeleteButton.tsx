import { Link } from 'react-router-dom'
import { Delete } from '@mui/icons-material'
import React from 'react'

import styles from './../style/components/ControlButtons.module.css'

interface Props {
  isSingleButton?: boolean
}

export default function DeleteButton (props: Props): JSX.Element {
  return (
    <>
      <Link to="/delete">
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
