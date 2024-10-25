import React from 'react'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import Header from '../components/Header'
import styles from './../style/pages/IframePageNotFound.module.css'

interface Props {
  project: string
  version: string
  hideUi: boolean
}

export default function IframeNotFound(props: Props): JSX.Element {
  const link = `/${props.project}/${props.version}${props.hideUi ? '?hide-ui' : ''}`

  return (
    <div className={styles['iframe-page-not-found']}>
      <Header />
      <div className={styles['iframe-page-not-found-container']}>
        <h1 className={styles['iframe-page-not-found-title']}>
          404 - Not Found
        </h1>
        <p className={styles['iframe-page-not-found-text']}>
          Sorry, the page you were looking for was not found in this version.
        </p>
        <Link to={link} className={styles['iframe-page-not-found-link']}>
          Back to Project Home
        </Link>
      </div>
      <Footer />
    </div>
  )
}
