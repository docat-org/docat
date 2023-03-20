import { Home, VisibilityOff } from '@mui/icons-material'
import { FormControl, MenuItem, Select } from '@mui/material'
import { Link } from 'react-router-dom'
import ProjectDetails from '../models/ProjectDetails'
import React from 'react'

import styles from './../style/components/DocumentControlButtons.module.css'

interface Props {
  version: string
  versions: ProjectDetails[]
  onVersionChange: (version: string) => void
  onHideUi: () => void
}

export default function DocumentControlButtons(props: Props): JSX.Element {
  const buttonStyle = { width: '25px', height: '25px' }

  return (
    <div className={styles.controls}>
      <Link
        to="/"
        className={styles['home-button']}
      >
        <Home sx={buttonStyle} />
      </Link>

      <FormControl>
        <Select
          className={styles['version-select']}
          onChange={(e) => props.onVersionChange(e.target.value)}
          value={props.versions.length > 0 ? props.version : ''}
        >
          {props.versions
            .filter((v) => !v.hidden || v.name === props.version)
            .map((v) => (
              <MenuItem key={v.name} value={v.name}>
                {v.name + (v.tags.length > 0 ? ` (${v.tags.join(', ')})` : '')}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <button
        className={styles['hide-controls-button']}
        onClick={props.onHideUi}
      >
        <VisibilityOff sx={buttonStyle} />
      </button>
    </div>
  )
}
