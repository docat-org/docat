import React, { useState } from 'react'
import { Link } from 'react-router-dom'

import { useConfig } from '../data-providers/ConfigDataProvider'

import docatLogo from '../assets/logo.png'
import styles from './../style/components/Header.module.css'
import SearchBar from './SearchBar'

interface Props {
  showSearchBar?: boolean
}

export default function Header (props: Props): JSX.Element {
  const defaultHeader = (
    <>
      <img alt="docat logo" src={docatLogo} />
      <h1>DOCAT</h1>
    </>
  )
  const [header, setHeader] = useState<JSX.Element>(defaultHeader)
  const config = useConfig()

  if (config.headerHTML != null && header === defaultHeader) {
    setHeader(<div dangerouslySetInnerHTML={{ __html: config.headerHTML }} />)
  }

  return (
    <div className={styles.header}>
      <Link to="/">{header}</Link>
      {props.showSearchBar !== false && <SearchBar />}
    </div>
  )
}
