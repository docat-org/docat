import styles from './../style/components/StyledForm.module.css'

interface Props {
  children: JSX.Element[]
}

export default function StyledForm(props: Props): JSX.Element {
  if (props.children.length === 0) {
    return <></>
  }

  return <div className={styles.form}>{props.children}</div>
}
