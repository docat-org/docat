import React, { useEffect, useState } from 'react'
import ReactTooltip from 'react-tooltip'
import { Link } from 'react-router-dom'
import ProjectRepository from '../repositories/ProjectRepository'
import styles from './../style/components/Project.module.css'

import ProjectDetails from '../models/ProjectDetails'
import FavoriteStar from './FavoriteStar'

interface Props {
  projectName: string
  onFavoriteChanged: () => void
}

export default function Project (props: Props): JSX.Element {
  const [versions, setVersions] = useState<ProjectDetails[]>([])
  const [logo, setLogo] = useState<Blob | null>(null)

  // try to load image to prevent image flashing
  useEffect(() => {
    void (async () => {
      const logoURL = ProjectRepository.getProjectLogoURL(props.projectName)
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
  }, [props.projectName])

  // reload versions on project name change
  useEffect(() => {
    void (async () => {
      try {
        const versionResponse = await ProjectRepository.getVersions(
          props.projectName
        )
        setVersions(versionResponse)
      } catch (e) {
        setVersions([])
      }
    })()
  }, [props.projectName])

  return (
    <div className={styles['project-card']}>
      <ReactTooltip />
      <div className={styles['project-card-header']}>
        <Link to={`/${props.projectName}/latest`}>
          {logo == null
            ? (
            <div
              className={styles['project-card-title']}
              data-tip={props.projectName}
            >
              {props.projectName}
            </div>
              )
            : (
            <>
              <img
                className={styles['project-logo']}
                src={URL.createObjectURL(logo)}
                alt={`${props.projectName} project Logo`}
              />

              <div
                className={styles['project-card-title-with-logo']}
                data-tip={props.projectName}
              >
                {props.projectName}
              </div>
            </>
              )}
        </Link>
        <FavoriteStar
          projectName={props.projectName}
          onFavoriteChanged={props.onFavoriteChanged}
        />
      </div>
      <div className={styles.subhead}>
        {versions.length === 1
          ? `${versions.length} version`
          : `${versions.length} versions`}
      </div>
    </div>
  )
}
