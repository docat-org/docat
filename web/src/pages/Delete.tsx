import { TextField } from '@mui/material'
import React, { useEffect, useState } from 'react'
import DataSelect from '../components/DataSelect'
import ProjectRepository from '../repositories/ProjectRepository'
import StyledForm from '../components/StyledForm'
import PageLayout from '../components/PageLayout'
import { useProjects } from '../data-providers/ProjectDataProvider'
import ProjectDetails from '../models/ProjectDetails'

export default function Delete (): JSX.Element {
  interface Validation {
    projectMissing?: boolean
    versionMissing?: boolean
    tokenMissing?: boolean
  }

  interface Message {
    show: boolean
    type: 'error' | 'success'
    text: string
  }

  const { projects, loadingFailed, reload } = useProjects()
  const [versions, setVersions] = useState<ProjectDetails[]>([])

  const [validation, setValidation] = useState<Validation>({})
  const [msg, setMsg] = useState<Message>({
    show: false,
    type: 'error',
    text: ''
  })
  const [project, setProject] = useState<string>('none')
  const [version, setVersion] = useState<string>('none')
  const [token, setToken] = useState<string>('')

  document.title = 'Delete Documentation | docat'

  useEffect(() => {
    if (project === '' || project === 'none') {
      setVersions([])
      return
    }

    ProjectRepository.getVersions(project)
      .then((res) => {
        setVersions(res)
      })
      .catch((e) => {
        console.error(e)
        setMsg({
          show: true,
          type: 'error',
          text: (e as { message: string }).message
        })
      })
  }, [project])

  function validate (
    field: 'project' | 'version' | 'token',
    value: string
  ): boolean {
    const valid = value !== 'none' && value !== ''
    setValidation({ ...validation, [`${field}Missing`]: !valid })
    return valid
  }

  async function deleteDocumentation (): Promise<void> {
    if (
      !validate('project', project) ||
      !validate('version', version) ||
      !validate('token', token)
    ) {
      return
    }

    try {
      await ProjectRepository.deleteDoc(project, version, token)

      setMsg({
        show: true,
        type: 'success',
        text: `Documentation for ${project} (${version}) deleted successfully.`
      })
      setProject('none')
      setVersion('none')
      setToken('')
      reload()
    } catch (e) {
      console.error(e)

      setMsg({
        show: true,
        type: 'error',
        text: (e as { message: string }).message
      })
    } finally {
      setTimeout(
        () =>
          setMsg((current) => {
            return { ...current, show: false }
          }),
        5000
      )
    }
  }

  function getProjects (): string[] {
    if (loadingFailed || projects == null) {
      return []
    }

    return projects
  }

  function getVersions (): string[] {
    if (project === '' || project === 'none') {
      return []
    }

    return versions.map((v) => v.name)
  }

  if (loadingFailed && msg.text !== 'Failed to load projects') {
    // make sure to only show this error once
    setMsg({ show: true, type: 'error', text: 'Failed to load projects' })
    setTimeout(
      () =>
        setMsg((current) => {
          return { ...current, show: false }
        }),
      5000
    )
  }

  return (
    <PageLayout
      title="Delete Documentation"
      successMsg={msg.show && msg.type === 'success' ? msg.text : ''}
      errorMsg={msg.show && msg.type === 'error' ? msg.text : ''}
    >
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

        <button
          type="submit"
          onClick={() => {
            (async () => {
              await deleteDocumentation()
            })().catch((e) => console.error(e))
          }}
        >
          Delete
        </button>
      </StyledForm>
    </PageLayout>
  )
}
