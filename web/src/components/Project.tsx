import React from 'react'
import ReactTooltip from 'react-tooltip'
import { Link } from 'react-router-dom'
import ProjectRepository from '../repositories/ProjectRepository'
import styles from './../style/components/Project.module.css'
import { Project as ProjectType } from '../models/ProjectsResponse'

import FavoriteStar from './FavoriteStar'

interface Props {
  project: ProjectType
  onFavoriteChanged: () => void
}

export default function Project(props: Props): JSX.Element {
  return (
    <div className={styles['project-card']}>
      <ReactTooltip />
      <div className={styles['project-card-header']}>
        <Link to={`/${props.project.name}/latest`}>
          {props.project.logo
            ? (
            <>
              <img
                className={styles['project-logo']}
                src={ProjectRepository.getProjectLogoURL(props.project.name)}
                alt={`${props.project.name} project logo`}
              />

              <div
                className={styles['project-card-title-with-logo']}
                data-tip={props.project.name}
              >
                {props.project.name}
              </div>
            </>
              )
            : (
            <div
              className={styles['project-card-title']}
              data-tip={props.project.name}
            >
              {props.project.name}
            </div>
              )}
        </Link>
        <FavoriteStar
          projectName={props.project.name}
          onFavoriteChanged={props.onFavoriteChanged}
        />
      </div>
      <div className={styles.subhead}>
        {props.project.versions === 1
          ? `${props.project.versions} version`
          : `${props.project.versions} versions`}
      </div>
    </div>
  )
}
