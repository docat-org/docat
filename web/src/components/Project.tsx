import { Link } from 'react-router-dom'
import { type Project as ProjectType } from '../models/ProjectsResponse'
import ProjectRepository from '../repositories/ProjectRepository'
import styles from './../style/components/Project.module.css'

import { Box, Tooltip, Typography } from '@mui/material'
import FavoriteStar from './FavoriteStar'

interface Props {
  project: ProjectType
  onFavoriteChanged: () => void
}

function timeSince(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;

  if (interval > 1) {
    return Math.floor(interval) + " years";
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return Math.floor(interval) + " months";
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return Math.floor(interval) + " days";
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return Math.floor(interval) + " hours";
  }
  interval = seconds / 60;
  if (interval > 1) {
    return Math.floor(interval) + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

export default function Project(props: Props): JSX.Element {
  const latestVersion = ProjectRepository.getLatestVersion(props.project.versions)

  return (
    <div className={styles['project-card']}>

        {props.project.logo ?
            <>
              <Link to={`${props.project.name}/latest`}>
                <img
                  className={styles['project-logo']}
                  src={ProjectRepository.getProjectLogoURL(props.project.name)}
                  alt={`${props.project.name} project logo`}
                />
              </Link>
            </> : <></>
        }

      <div className={styles['project-header']}>
        <Link to={`${props.project.name}/latest`}>
          <div className={styles['project-card-title']}>
            {props.project.name}{' '}
            <span className={styles['secondary-typography']}>
              {latestVersion.name}
            </span>
          </div>
        </Link>

        <Tooltip title={new Date(latestVersion.timestamp).toISOString().slice(0, -8).replace('T', ' ')} placement="left" arrow >
          <Box sx={{
              display: {
                xs: 'none',
                sm: 'inherit'
              }
            }} className={styles['secondary-typography']}>
            {timeSince(new Date(latestVersion.timestamp))} ago
          </Box>
        </Tooltip>
      </div>
      <div className={styles['project-header']}>
        <div className={styles.subhead}>
          {props.project.versions.length === 1
            ? `${props.project.versions.length} version`
            : `${props.project.versions.length} versions`}
            <Typography sx={{ marginLeft: 1.5 }} fontSize={'0.9em'} component={'span'} fontWeight={300}>{props.project.storage}</Typography>
        </div>

        <FavoriteStar
          projectName={props.project.name}
          onFavoriteChanged={props.onFavoriteChanged}
        />
      </div>
    </div>
  )
}
