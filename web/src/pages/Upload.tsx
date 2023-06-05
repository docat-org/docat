import { TextField } from '@mui/material'
import React, { useState } from 'react'

import FileInput from '../components/FileInput'
import PageLayout from '../components/PageLayout'
import StyledForm from '../components/StyledForm'
import { useMessageBanner } from '../data-providers/MessageBannerProvider'
import { useProjects } from '../data-providers/ProjectDataProvider'
import ProjectRepository from '../repositories/ProjectRepository'
import LoadingPage from './LoadingPage'

import styles from '../style/pages/Upload.module.css'

interface Validation {
  projectMsg?: string
  versionMsg?: string
  fileMsg?: string
}

const okFileTypes = [
  'application/zip',
  'zip',
  'application/octet-stream',
  'application/x-zip',
  'application/x-zip-compressed'
]

export default function Upload (): JSX.Element {
  document.title = 'Upload | docat'

  const { reload: reloadProjects } = useProjects()
  const { showMessage } = useMessageBanner()

  const [project, setProject] = useState<string>('')
  const [version, setVersion] = useState<string>('')
  const [file, setFile] = useState<File | undefined>(undefined)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [validation, setValidation] = useState<Validation>({})

  const validateInput = (inputName: string, value: string): boolean => {
    const validationProp = `${inputName}Msg` as keyof typeof validation

    if (value.trim().length > 0) {
      setValidation({
        ...validation,
        [validationProp]: undefined
      })
      return true
    }

    const input = inputName.charAt(0).toUpperCase() + inputName.slice(1)
    const validationMsg = `${input} is required`

    setValidation({
      ...validation,
      [validationProp]: validationMsg
    })
    return false
  }

  const validateFile = (file: File | undefined): boolean => {
    if (file == null || file.name == null) {
      setValidation({
        ...validation,
        fileMsg: 'File is required'
      })
      return false
    }

    if (file.type == null) {
      setValidation({
        ...validation,
        fileMsg: 'Could not determine file type'
      })
      return false
    }

    if (okFileTypes.find((x) => x === file.type) === undefined) {
      setValidation({
        ...validation,
        fileMsg: 'This file type is not allowed'
      })
      return false
    }

    setValidation({
      ...validation,
      fileMsg: undefined
    })
    return true
  }

  const upload = (): void => {
    void (async () => {
      if (!validateInput('project', project)) return
      if (!validateInput('version', version)) return
      if (!validateFile(file) || file === undefined) return

      setIsUploading(true)
      const formData = new FormData()
      formData.append('file', file)

      const { success, message } = await ProjectRepository.upload(project, version, formData)

      if (!success) {
        console.error(message)
        showMessage({
          type: 'error',
          content: message,
          showMs: 6000
        })
        setIsUploading(false)
        return
      }

      // reset the form
      setProject('')
      setVersion('')
      setFile(undefined)
      setValidation({})

      showMessage({
        type: 'success',
        content: message,
        showMs: 6000
      })

      reloadProjects()
      setIsUploading(false)
    })()
  }

  if (isUploading) {
    return <LoadingPage />
  }

  const description = (
    <p>
      If you want to automate the upload of your documentation consider using{' '}
      <code>curl</code> to post it to the server. There are some examples in the{' '}
      <a
        href="https://github.com/docat-org/docat/"
        target="_blank"
        rel="noreferrer"
      >
        docat repository
      </a>
      .
    </p>
  )

  return (
    <PageLayout title="Upload Documentation" description={description}>
      <StyledForm>
        <TextField
          fullWidth
          autoComplete="off"
          label="Project"
          value={project}
          onChange={(e) => {
            const project = e.target.value
            setProject(project)
            validateInput('project', project)
          }}
          error={validation.projectMsg !== undefined}
          helperText={validation.projectMsg}
        >
          {project}
        </TextField>

        <TextField
          fullWidth
          autoComplete="off"
          label="Version"
          value={version}
          onChange={(e) => {
            const version = e.target.value
            setVersion(version)
            validateInput('version', version)
          }}
          error={validation.versionMsg !== undefined}
          helperText={validation.versionMsg}
        >
          {version}
        </TextField>

        <FileInput
          label="Zip File"
          file={file}
          onChange={(file) => setFile(file)}
          okTypes={okFileTypes}
          isValid={validateFile}
        ></FileInput>
        <p className={`${styles['validation-message']} ${styles.red}`}>
          {validation.fileMsg}
        </p>

        <button type="submit" onClick={upload}>
          Upload
        </button>
      </StyledForm>
    </PageLayout>
  )
}
