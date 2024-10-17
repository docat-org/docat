import { Link } from 'react-router-dom'
import styles from './../style/components/Footer.module.css'

export default function Footer(): JSX.Element {
  return (
    <div className={styles.footer}>
      <Link to="/help" className={styles['help-link']}>
        HELP
      </Link>

      <div className={styles['version-info']}>
        <Link to="https://github.com/docat-org/docat" target='_blank'>
          VERSION{'  '}
          {import.meta.env.VITE_DOCAT_VERSION ?? 'unknown'}
        </Link>
      </div>
    </div>
  )
}
