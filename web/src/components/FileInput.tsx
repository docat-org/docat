import { InputLabel } from '@mui/material'
import React, { useRef, useState } from 'react'

import styles from './../style/components/FileInput.module.css'

interface Props {
  label: string
  okTypes: string[]
  file: File | undefined
  onChange: (file: File | undefined) => void
  isValid: (file: File) => boolean
}

export default function FileInput(props: Props): JSX.Element {
  const [fileName, setFileName] = useState<string>(
    props.file?.name !== undefined ? props.file.name : ''
  )
  const [dragActive, setDragActive] = useState<boolean>(false)
  const inputRef = useRef(null)

  /**
   * Checks if a file was selected and if it is valid
   * before it is selected.
   * @param files FileList from the event
   */
  const updateFileIfValid = (files: FileList | null): void => {
    if (files == null || files.length < 1 || files[0] == null) {
      return
    }

    const file = files[0]
    if (!props.isValid(file)) {
      return
    }

    setFileName(file.name)
    props.onChange(file)
  }

  /**
   * This updates the file upload container to show a custom style when
   * the user is dragging a file into or out of the container.
   * @param e drag enter event
   */
  const handleDragEvents = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  /**
   * Handles the drop event when the user drops a file into the container.
   * @param e DragEvent
   */
  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer?.files[0] == null) {
      return
    }

    updateFileIfValid(e.dataTransfer.files)
  }

  /**
   * Handles the file input via the file browser.
   * @param e change event
   */
  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>): void => {
    e.preventDefault()

    updateFileIfValid(e.target.files)
  }

  /**
   * This triggers the input when the container is clicked.
   */
  const onButtonClick = (): void => {
    if (inputRef?.current != null) {
      // @ts-expect-error - the ref is not null, therefore the button should be able to be clicked
      inputRef.current.click()
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

        {fileName !== '' && (
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
    </div>
  )
}
