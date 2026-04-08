import React from 'react'
import { ArrowBackIos } from '@mui/icons-material'
import { Link } from 'react-router-dom'

import styles from './../style/components/NavigationTitle.module.css'

interface Props {
  title: string
  backLink?: string
  description?: string | React.JSX.Element
}

export default function NavigationTitle(props: Props): React.JSX.Element {
  return (
    <div className={styles['nav-title']}>
      <div className={styles['page-header']}>
        <Link
          to={props.backLink != null ? props.backLink : '/'}
          className={styles['back-link']}
        >
          <ArrowBackIos />
        </Link>
        <h1 className={styles['page-title']}>{props.title}</h1>
      </div>

      <div className={styles['page-description']}>{props.description}</div>
    </div>
  )
}
