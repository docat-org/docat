import React from 'react';
import styles from './../style/components/StyledForm.module.css'

interface Props {
  children: React.JSX.Element[]
}

export default function StyledForm(props: Props): React.JSX.Element {
  if (props.children.length === 0) {
    return <></>
  }

  return <div className={styles.form}>{props.children}</div>
}
