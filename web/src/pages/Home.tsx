import React, { useEffect, useState } from 'react'

import { useProjects } from '../data-providers/ProjectDataProvider'
import { ErrorOutline } from '@mui/icons-material'
import { type Project } from '../models/ProjectsResponse'
import { useLocation } from 'react-router'
import { useSearch } from '../data-providers/SearchProvider'

import ProjectRepository from '../repositories/ProjectRepository'
import Help from './Help'
import UploadButton from '../components/UploadButton'
import ClaimButton from '../components/ClaimButton'
import DeleteButton from '../components/DeleteButton'
import ProjectList from '../components/ProjectList'
import Header from '../components/Header'
import Footer from '../components/Footer'
import LoadingPage from './LoadingPage'

import styles from './../style/pages/Home.module.css'

export default function Home(): JSX.Element {
  const { loadingFailed } = useProjects()
  const { filteredProjects: projects, query } = useSearch()
  const [nonFavoriteProjects, setNonFavoriteProjects] = useState<Project[]>([])
  const [favoriteProjects, setFavoriteProjects] = useState<Project[]>([])

  const location = useLocation()

  document.title = 'Home | docat'

  // insert # into the url if it's missing
  useEffect(() => {
    const nonHostPart = window.location.href.replace(window.location.origin, '')

    if (nonHostPart.startsWith('#') || nonHostPart.startsWith('/#')) {
      return
    }

    window.location.replace(`/#${nonHostPart}`)
  }, [location])

  const updateFavorites = (): void => {
    if (projects == null) return

    setFavoriteProjects(
      projects.filter((project) => ProjectRepository.isFavorite(project.name))
    )
    setNonFavoriteProjects(
      projects.filter((project) => !ProjectRepository.isFavorite(project.name))
    )
  }

  useEffect(() => {
    updateFavorites()
  }, [projects])

  if (loadingFailed) {
    return (
      <div className={styles.home}>
        <Header />
        <div className={styles['loading-error']}>
          <ErrorOutline color="error" />
          <div>Failed to load projects</div>
        </div>
        <Footer />
      </div>
    )
  }

  // no results for query
  if (projects != null && projects.length === 0 && query.length > 0) {
    return (
      <div className={styles.home}>
        <Header />
        <div className={styles['no-results']}>
          No results for &lsquo;{query}&rsquo;
        </div>
        <UploadButton></UploadButton>
        <ClaimButton></ClaimButton>
        <DeleteButton></DeleteButton>
        <Footer />
      </div>
    )
  }

  if (projects == null) {
    return <LoadingPage />
  }

  // no projects
  if (projects.length === 0) {
    return <Help />
  }

  return (
    <div className={styles.home}>
      <Header />
      <div className={styles['project-overview']}>
        <ProjectList
          projects={favoriteProjects}
          onFavoriteChanged={() => {
            updateFavorites()
          }}
        />
        {nonFavoriteProjects.length > 0 && favoriteProjects.length > 0 && (
          <div className={styles.divider} />
        )}
        <ProjectList
          projects={nonFavoriteProjects}
          onFavoriteChanged={() => {
            updateFavorites()
          }}
        />
      </div>
      <UploadButton></UploadButton>
      <ClaimButton></ClaimButton>
      <DeleteButton></DeleteButton>
      <Footer />
    </div>
  )
}
