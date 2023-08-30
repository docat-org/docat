import { TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import DataSelect from '../components/DataSelect'
import ProjectRepository from '../repositories/ProjectRepository'
import StyledForm from '../components/StyledForm'
import PageLayout from '../components/PageLayout'
import { useProjects } from '../data-providers/ProjectDataProvider'
import type ProjectDetails from '../models/ProjectDetails'
import { useMessageBanner } from '../data-providers/MessageBannerProvider'

interface Validation {
  projectMissing?: boolean
  versionMissing?: boolean
  tokenMissing?: boolean
}

export default function Delete(): JSX.Element {
  const { showMessage } = useMessageBanner()
  const [project, setProject] = useState<string>('none')
  const [version, setVersion] = useState<string>('none')
  const [token, setToken] = useState<string>('')
  const { projects, loadingFailed, reload } = useProjects()
  const [versions, setVersions] = useState<ProjectDetails[]>([])
  const [validation, setValidation] = useState<Validation>({})

  document.title = 'Delete Documentation | docat'

  useEffect(() => {
    if (project === '' || project === 'none') {
      setVersions([])
      return
    }

    setVersions(projects?.find((p) => p.name === project)?.versions ?? [])
  }, [project])

  const validate = (
    field: 'project' | 'version' | 'token',
    value: string
  ): boolean => {
    const valid = value !== 'none' && value !== ''
    setValidation({ ...validation, [`${field}Missing`]: !valid })
    return valid
  }

  const deleteDocumentation = (): void => {
    void (async () => {
      if (!validate('project', project)) return
      if (!validate('version', version)) return
      if (!validate('token', token)) return

      try {
        await ProjectRepository.deleteDoc(project, version, token)

        showMessage({
          type: 'success',
          content: `Documentation for ${project} (${version}) deleted successfully.`,
          showMs: 6000
        })
        setProject('none')
        setVersion('none')
        setToken('')
        reload()
      } catch (e) {
        console.error(e)

        showMessage({
          type: 'error',
          content: (e as { message: string }).message,
          showMs: 6000
        })
      }
    })()
  }

  /**
   * Returns loaded project names for DataSelect
   * @returns string[] or an empty array
   */
  const getProjects = (): string[] => {
    if (loadingFailed || projects == null) {
      return []
    }

    return projects.map((project) => project.name)
  }

  /**
   * Returns loaded Versions for DataSelect
   * @returns string[] or an empty array
   */
  const getVersions = (): string[] => {
    if (project === '' || project === 'none') {
      return []
    }

    return versions.map((v) => v.name)
  }

  return (
    <PageLayout title="Delete Documentation">
      <StyledForm>
        <DataSelect
          emptyMessage="Please select a Project"
          label="Project"
          values={getProjects()}
          onChange={(project) => {
            setProject(project)
            setVersion('none')
            validate('project', project)
          }}
          value={project ?? 'none'}
          errorMsg={
            validation.projectMissing === true
              ? 'Please select a Project'
              : undefined
          }
        />
        <DataSelect
          emptyMessage="Please select a Version"
          label="Version"
          values={getVersions()}
          onChange={(version) => {
            setVersion(version)
            validate('version', version)
          }}
          value={version ?? 'none'}
          errorMsg={
            validation.versionMissing === true
              ? 'Please select a Version'
              : undefined
          }
        />

        <TextField
          fullWidth
          label="Token"
          value={token}
          onChange={(e) => {
            setToken(e.target.value)
            validate('token', e.target.value)
          }}
          error={validation.tokenMissing}
          helperText={
            validation.tokenMissing === true
              ? 'Please enter a Token'
              : undefined
          }
        >
          {token}
        </TextField>

        <button type="submit" onClick={deleteDocumentation}>
          Delete
        </button>
      </StyledForm>
    </PageLayout>
  )
}
