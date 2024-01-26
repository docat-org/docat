import { Link } from 'react-router-dom'
import styles from './../style/components/Footer.module.css'
import React from 'react'

export default function Footer(): JSX.Element {
  return (
    <div className={styles.footer}>
      <Link to="/help" className={styles['help-link']}>
        Help
      </Link>

      <div className={styles['version-info']}>
        Docat Version{' '}
        <code>{import.meta.env.VITE_DOCAT_VERSION ?? 'unknown'}</code>
      </div>
    </div>
  )
}
