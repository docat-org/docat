import styles from './../style/components/StyledForm.module.css'
import React from 'react'

interface Props {
  children: JSX.Element[]
}

export default function StyledForm (props: Props): JSX.Element {
  if (props.children.length === 0) {
    return <></>
  }

  /* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
  // filter out <></> from children
  const children = props.children.filter(
    (child) => child.type.toString() !== 'Symbol(react.fragment)'
  )
  /* eslint-enable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */

  return (
    <div className={styles.form}>
      {children
        .filter((c) => c != null && c !== <></>)
        .map((child, index) => {
          return (
            <div key={index} className={styles['form-item']}>
              {child}
            </div>
          )
        })}
    </div>
  )
}
