import { TextField } from '@mui/material'
import React, { useState } from 'react'
import DataSelect from '../components/DataSelect'
import PageLayout from '../components/PageLayout'
import StyledForm from '../components/StyledForm'
import { useMessageBanner } from '../data-providers/MessageBannerProvider'
import { useProjects } from '../data-providers/ProjectDataProvider'
import ProjectRepository from '../repositories/ProjectRepository'

export default function Claim(): JSX.Element {
  const { projects, loadingFailed } = useProjects()

  const { showMessage } = useMessageBanner()
  const [project, setProject] = useState<string>('none')
  const [token, setToken] = useState<string>('')

  const [projectMissing, setProjectMissing] = useState<boolean | null>(null)

  document.title = 'Claim Token | docat'

  const claim = async (): Promise<void> => {
    if (project == null || project === '' || project === 'none') {
      setProjectMissing(true)
      return
    }

    try {
      const response = await ProjectRepository.claim(project)
      setToken(response.token)
    } catch (e) {
      console.error(e)
      showMessage({
        text: (e as { message: string }).message,
        type: 'error'
      })
    }
  }

  /**
   * Returns loaded project names for DataSelect
   * @returns project names as string[] or an empty array
   */
  const getProjects = (): string[] => {
    if (loadingFailed || projects == null) {
      return []
    }

    return projects.map((project) => project.name)
  }

  const onProjectSelect = (p: string): void => {
    if (p == null || p === '' || p === 'none') {
      setProjectMissing(true)
    } else {
      setProjectMissing(false)
    }

    setProject(p)
    setToken('')
  }

  return (
    <PageLayout
      title="Claim Token"
      description="Please make sure to store this token safely, as only one token can be generated per project and you will not be able to claim it again."
    >
      <StyledForm>
        <DataSelect
          emptyMessage="Please select a Project"
          label="Project"
          values={getProjects()}
          onChange={onProjectSelect}
          value={project ?? 'none'}
          errorMsg={
            projectMissing === true ? 'Please select a Project' : undefined
          }
        />

        {token !== ''
          ? (
          <TextField
            fullWidth
            label="Token"
            inputProps={{
              readOnly: true
            }}
            value={token}
          >
            {token}
          </TextField>
            )
          : (
          <></>
            )}

        <button
          type="submit"
          disabled={token !== ''}
          onClick={() => {
            (async () => {
              await claim()
            })().catch((e) => console.error(e))
          }}
        >
          Claim
        </button>
      </StyledForm>
    </PageLayout>
  )
}
