import { useEffect, useState } from 'react';

import { Delete, ErrorOutline, FileUpload, Lock } from '@mui/icons-material';
import { useLocation } from 'react-router';
import { useProjects } from '../data-providers/ProjectDataProvider';
import { useSearch } from '../data-providers/SearchProvider';
import { type Project } from '../models/ProjectsResponse';

import Footer from '../components/Footer';
import Header from '../components/Header';
import ProjectList from '../components/ProjectList';
import ProjectRepository from '../repositories/ProjectRepository';
import LoadingPage from './LoadingPage';

import { Box, Button, IconButton, Tooltip, Typography } from '@mui/material';
import SearchBar from '../components/SearchBar';
import { useStats } from '../data-providers/StatsDataProvider';
import styles from './../style/pages/Home.module.css';


export default function Home(): JSX.Element {
  const { loadingFailed } = useProjects()
  const { stats, loadingFailed: statsLoadingFailed } = useStats()
  const { filteredProjects: projects, query, setQuery } = useSearch()
  const [showAll, setShowAll] = useState(false);
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
  }, [location, setQuery, projects])

  const updateFavorites = (): void => {
    if (projects == null) return

    setFavoriteProjects(
      projects.filter((project) => ProjectRepository.isFavorite(project.name))
    )
  }

  const onShowFavourites = (all: boolean): void => {
    setShowAll(all);
  }

  useEffect(() => {
    updateFavorites()
  }, [projects])

  if (loadingFailed || statsLoadingFailed) {
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

  if (projects == null || stats == null) {
    return <LoadingPage />
  }

  return (
    <div className={styles.home}>
      <Header />

      <div className={styles['project-overview']}>
        <Box sx={{ width: { sm: '80%' }, maxWidth: '800px'}}>


        <Box sx={{
          display: 'flex',
          marginTop: '24px',
          marginBottom: '32px',
          flexWrap: {
            sm: 'nowrap',
            xs: 'wrap'
          }
        }}>

          <Box sx={{
            width: {
              sm: '100%'
            },
            maxWidth: '600px',
            marginBottom: '8px'
          }}>
            <SearchBar showFavourites={!showAll} onShowFavourites={onShowFavourites} />
          </Box>

          <Box sx={{ display: 'flex' }}>
            <Tooltip title="Upload Documentation" placement="right" arrow>
              <IconButton
                sx={{ marginLeft: 2, height: '46px', width: '46px', marginTop: '2px'}}
                href="/#/upload"
              >
                <FileUpload></FileUpload>
              </IconButton>
            </Tooltip>

            <Tooltip title="Claim a Project" placement="right" arrow>
              <IconButton
                sx={{ marginLeft: 2, height: '46px', width: '46px', marginTop: '2px'}}
                href="/#/claim"
              >
                <Lock></Lock>
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete a project version" placement="right" arrow>
              <IconButton
                sx={{ marginLeft: 2, height: '46px', width: '46px', marginTop: '2px'}}
                href="/#/delete"
              >
                <Delete></Delete>
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        { projects.length === 0 ?
          <>{ query !== "" ?
            <Box sx={{marginLeft: '24px', color: '#6e6e6e'}}>
              Couldn't find any docs
            </Box> :
            <Box sx={{marginLeft: '24px'}}>
              Looks like you don't have any docs yet.
              <Button href="/help" onClick={() => onShowFavourites(true)}>
                Get started now!
              </Button>
            </Box>
          }</> :
          <>
          { (query || showAll) ?
            <ProjectList
              projects={projects}
              onFavoriteChanged={() => {
                updateFavorites()
              }}
            />
            :
            <>
              <Typography sx={{ marginLeft: '24px', marginBottom: 1.5 }} fontWeight={300} fontSize={20}>FAVOURITES</Typography>
              { (favoriteProjects.length === 0) ?
                <Box sx={{marginLeft: '24px'}}>
                  No docs favourited at the moment, search for docs or
                  <Button onClick={() => onShowFavourites(true)}>
                    Show all docs.
                  </Button>

                </Box> :
                <ProjectList
                  projects={favoriteProjects}
                  onFavoriteChanged={() => {
                    updateFavorites()
                  }}
                />
              }
            </>
          }
          </>
        }
        </Box>
        <Box sx={{
          display: {
            md: 'block',
            sm: 'none',
            xs: 'none'
          },
          borderLeft:
          '1px solid #efefef',
          paddingLeft: 3,
          marginTop: 15,
           width: '400px'
        }}>
          <Typography sx={{display: 'inline-block'}} fontWeight={300} fontSize={'1.1em'} component={'span'}>INSTANCE STATS</Typography>
          <Box />

          <Typography fontSize={'1em'} fontWeight={200} sx={{ opacity: 0.8 }} component={'span'}># </Typography>
          <Typography sx={{width: 100, display: 'inline-block', marginTop: 1}} fontWeight={300} fontSize={'1em'} component={'span'}>DOCS </Typography>
          <Typography fontSize={'1em'} fontWeight={200} sx={{ opacity: 0.8 }} component={'span'}>{stats.n_projects}</Typography>

          <Box />
          <Typography fontSize={'1em'} fontWeight={200} sx={{ opacity: 0.8 }} component={'span'}># </Typography>
          <Typography sx={{width: 100, display: 'inline-block',  marginTop: 0.4}} fontWeight={300} fontSize={'1em'} component={'span'}>VERSIONS </Typography>
          <Typography fontSize={'1em'} fontWeight={200} sx={{ opacity: 0.8 }} component={'span'}>{stats.n_versions}</Typography>

          <Box />
          <Typography sx={{width: 115, display: 'inline-block',  marginTop: 0.4}} fontWeight={300} fontSize={'1em'} component={'span'}>STORAGE </Typography>
          <Typography fontSize={'1em'} fontWeight={200} sx={{ opacity: 0.8 }} component={'span'}>{stats.storage}</Typography>
        </Box>
      </div>
      <Footer />
    </div>
  )
}
