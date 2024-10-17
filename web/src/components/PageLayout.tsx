import styles from './../style/components/PageLayout.module.css'
import Footer from './Footer'
import Header from './Header'
import NavigationTitle from './NavigationTitle'

interface Props {
  title: string
  description?: string | JSX.Element
  showSearchBar?: boolean
  children: JSX.Element | JSX.Element[]
}

export default function PageLayout(props: Props): JSX.Element {
  return (
    <>
      <Header />
      <div className={styles.main}>
        <NavigationTitle title={props.title} description={props.description} />
        {props.children}
      </div>
      <Footer />
    </>
  )
}
