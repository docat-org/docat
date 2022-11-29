import { InputLabel } from '@mui/material'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import styles from './../style/components/FileInput.module.css'

interface Props {
  label: string
  okTypes: string[]
  file: File | undefined
  validateNow: boolean
  onChange: (file: File | undefined) => void
}

export default function FileInput (props: Props): JSX.Element {
  const [validationMessage, setValidationMessage] = useState<string>('')
  const [fileName, setFileName] = useState<string>(
    props.file?.name !== undefined ? props.file.name : ''
  )
  const [dragActive, setDragActive] = useState<boolean>(false)
  const inputRef = useRef(null)

  const validate = useCallback(
    (file: File | undefined): boolean => {
      if (file == null || file.name == null) {
        setValidationMessage('File is required')
        return false
      }

      if (file.type == null) {
        setValidationMessage('Could not determine file type')
        return false
      }

      if (props.okTypes.find((x) => x === file.type) === undefined) {
        setValidationMessage('This file type is not allowed')
        return false
      }

      setValidationMessage('')
      return true
    },
    [props.okTypes]
  )

  useEffect(() => {
    if (props.validateNow) {
      validate(props.file)
    }
  }, [props.file, props.validateNow, validate])

  function updateFileIfValid (files: FileList | null): void {
    if (files == null || files.length < 1 || files[0] == null) {
      return
    }

    const file = files[0]
    if (!validate(file)) {
      return
    }

    setFileName(file.name)
    props.onChange(file)
  }

  function handleDragEvents (e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop (e: React.DragEvent<HTMLDivElement>): void {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer?.files[0] == null) {
      return
    }

    updateFileIfValid(e.dataTransfer.files)
  }

  function handleSelect (e: React.ChangeEvent<HTMLInputElement>): void {
    e.preventDefault()

    updateFileIfValid(e.target.files)
  }

  // triggers the input when the button is clicked
  function onButtonClick (): void {
    if (inputRef?.current != null) {
      // @ts-expect-error - the ref is not null, therefore the button should be able to be clicked
      inputRef.current.click() // eslint-disable-line @typescript-eslint/no-unsafe-call
    }
  }

  return (
    <div className={styles['file-upload-container']}>
      {!dragActive && (
        <InputLabel className={styles['file-upload-label']}>
          {props.label}
        </InputLabel>
      )}

      <div
        className={
          dragActive
            ? styles['file-drop-zone'] + ' ' + styles['drag-active']
            : styles['file-drop-zone']
        }
        onDragEnter={handleDragEvents}
        onClick={onButtonClick}
      >
        <input
          name="upload"
          type="file"
          className={styles['file-input']}
          ref={inputRef}
          accept={props.okTypes.join(',')}
          onChange={handleSelect}
        />

        {(fileName !== '') && (
          <>
            <p>{fileName}</p>
            <p>-</p>
          </>
        )}

        <p>Drag zip file here or</p>

        <button className={styles['file-upload-button']} type="button">
          click to browse.
        </button>

        {dragActive && (
          <div
            className={styles['drag-file-element']}
            onDragEnter={handleDragEvents}
            onDragLeave={handleDragEvents}
            onDragOver={handleDragEvents}
            onDrop={handleDrop}
          ></div>
        )}
      </div>
      <p className={`${styles['validation-message']} ${styles.red}`}>
        {validationMessage}
      </p>
    </div>
  )
}
