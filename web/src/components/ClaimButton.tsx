import React from 'react'
import { Link } from 'react-router-dom'
import { Lock } from '@mui/icons-material'
import { Tooltip } from '@mui/material'

import styles from './../style/components/ControlButtons.module.css'

interface Props {
  isSingleButton?: boolean
}

export default function ClaimButton(props: Props): JSX.Element {
  return (
    <>
      <Tooltip title="Claim a Project" placement="top" arrow>
        <Link
          to="/claim"
          className={
            props.isSingleButton === true
              ? styles['single-control-button']
              : styles['claim-button']
          }
        >
          <Lock></Lock>
        </Link>
      </Tooltip>
    </>
  )
}
