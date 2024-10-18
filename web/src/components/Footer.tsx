import { Box } from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useConfig } from '../data-providers/ConfigDataProvider'
import styles from './../style/components/Footer.module.css'

export default function Footer(): JSX.Element {

  const defaultFooter = (
    <></>
  )

  const [footer, setFooter] = useState<JSX.Element>(defaultFooter)
  const config = useConfig()

  // set custom header if found in config
  if (config.footerHTML != null && footer === defaultFooter) {
    setFooter(<div dangerouslySetInnerHTML={{ __html: config.footerHTML }} />)
  }

  return (
    <div className={styles.footer}>
      <Link to="/help" className={styles['help-link']}>
        HELP
      </Link>

      <Box sx={{ fontSize: '1.05em', fontWeight: 300, opacity: 0.6, marginLeft: '8px', marginTop: 1 }}>
        {footer}
      </Box>

      <div className={styles['version-info']}>
        <Link to="https://github.com/docat-org/docat" target='_blank'>
          VERSION{'  '}
          {import.meta.env.VITE_DOCAT_VERSION ?? 'unknown'}
        </Link>
      </div>
    </div>
  )
}
