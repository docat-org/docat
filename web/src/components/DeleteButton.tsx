import { Link } from 'react-router-dom'
import { Delete } from '@mui/icons-material'
import { Tooltip } from '@mui/material'
import React from 'react'

import styles from './../style/components/ControlButtons.module.css'

interface Props {
  isSingleButton?: boolean
}

export default function DeleteButton(props: Props): JSX.Element {
  return (
    <>
      <Tooltip title="Delete a project version" placement="top" arrow>
        <Link
          to="/delete"
          className={
            props.isSingleButton === true
              ? styles['single-control-button']
              : styles['delete-button']
          }
        >
          <Delete></Delete>
        </Link>
      </Tooltip>
    </>
  )
}
