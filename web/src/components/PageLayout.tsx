import styles from './../style/components/PageLayout.module.css'
import Banner from './InfoBanner'
import Footer from './Footer'
import Header from './Header'
import NavigationTitle from './NavigationTitle'
import React from 'react'

interface Props {
  title: string
  description?: string | JSX.Element
  successMsg?: string
  errorMsg?: string
  bannerTimeout?: number
  showSearchBar?: boolean
  children: JSX.Element | JSX.Element[]
}

export default function PageLayout (props: Props): JSX.Element {
  return (
    <>
      <Header showSearchBar={props.showSearchBar} />
      <Banner
        successMsg={props.successMsg}
        errorMsg={props.errorMsg}
        timeout={props.bannerTimeout}
      />
      <div className={styles.main}>
        <NavigationTitle title={props.title} description={props.description} />
        {props.children}
      </div>
      <Footer />
    </>
  )
}
