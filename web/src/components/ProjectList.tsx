import Project from './Project'
import React from 'react'

import styles from './../style/components/ProjectList.module.css'

interface Props {
  projects: string[]
  onFavoriteChanged: () => void
}

export default function ProjectList (props: Props): JSX.Element {
  if (props.projects.length === 0) {
    return <></>
  }

  return (
    <div className={styles['project-list']}>
      {props.projects.map((project) => (
        <Project
          projectName={project}
          key={project}
          onFavoriteChanged={() => props.onFavoriteChanged()}
        />
      ))}
    </div>
  )
}
