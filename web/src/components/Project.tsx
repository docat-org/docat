import React from 'react'
import { Link } from 'react-router-dom'
import ProjectRepository from '../repositories/ProjectRepository'
import styles from './../style/components/Project.module.css'
import { Project as ProjectType } from '../models/ProjectsResponse'

import FavoriteStar from './FavoriteStar'
import { Tooltip } from '@mui/material'

interface Props {
  project: ProjectType
  onFavoriteChanged: () => void
}

export default function Project (props: Props): JSX.Element {
  return (
    <div className={styles['project-card']}>
      <div className={styles['project-card-header']}>
        <Tooltip title={props.project.name} placement="top-start" arrow>
          <Link to={`${props.project.name}/latest`}>
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
                  >
                    {props.project.name} <span className={styles['project-card-version']}>v{props.project.versions[0].name}</span>
                  </div>
                </>
                )
              : (
                <div
                  className={styles['project-card-title']}
                >
                  {props.project.name} <span className={styles['project-card-version']}>v{props.project.versions[0].name}</span>
                </div>
                )}
          </Link>
        </Tooltip>
        <FavoriteStar
          projectName={props.project.name}
          onFavoriteChanged={props.onFavoriteChanged}
        />
      </div>
      <div className={styles.subhead}>
        {props.project.versions.length === 1
          ? `${props.project.versions.length} version`
          : `${props.project.versions.length} versions`}
      </div>
    </div>
  )
}
