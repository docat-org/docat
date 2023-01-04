import React, { useEffect, useState } from 'react'
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
  const [logo, setLogo] = useState<Blob | null>(null)

  // try to load image to prevent image flashing
  useEffect(() => {
    void (async () => {
      const logoURL = ProjectRepository.getProjectLogoURL(props.project.name)
      try {
        const response = await fetch(logoURL)
        if (response.status === 200) {
          const imgData = await response.blob()
          setLogo(imgData)
        }
      } catch (e) {
        setLogo(null)
      }
    })()
  }, [props.project])

  return (
    <div className={styles['project-card']}>
      <ReactTooltip />
      <div className={styles['project-card-header']}>
        <Link to={`/${props.project.name}/latest`}>
          {logo == null
            ? (
            <div
              className={styles['project-card-title']}
              data-tip={props.project.name}
            >
              {props.project.name}
            </div>
              )
            : (
            <>
              <img
                className={styles['project-logo']}
                src={URL.createObjectURL(logo)}
                alt={`${props.project.name} project Logo`}
              />

              <div
                className={styles['project-card-title-with-logo']}
                data-tip={props.project.name}
              >
                {props.project.name}
              </div>
            </>
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
