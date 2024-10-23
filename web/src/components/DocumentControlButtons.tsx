import { Home, Share } from '@mui/icons-material'
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  MenuItem,
  Modal,
  Select,
  Tooltip
} from '@mui/material'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type ProjectDetails from '../models/ProjectDetails'

import styles from './../style/components/DocumentControlButtons.module.css'

interface Props {
  version: string
  versions: ProjectDetails[]
  onVersionChange: (version: string) => void
}

export default function DocumentControlButtons(props: Props): JSX.Element {
  const buttonStyle = { width: '25px', height: '25px' }

  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false)
  const [shareModalUseLatest, setShareModalUseLatest] = useState<boolean>(false)
  const [shareModalHideUi, setShareModalHideUi] = useState<boolean>(false)

  // Cannot copy when page is served over HTTP
  const canCopy = navigator.clipboard !== undefined

  const getShareUrl = (): string => {
    // adapt the current URL so we can leave Docs.tsx's state as refs
    // (which means if the page was passed down as a prop it wouldn't update correctly)

    let url = window.location.href

    if (shareModalUseLatest) {
      url = url.replace(props.version, 'latest')
    }

    if (shareModalHideUi && !url.includes('?hide-ui=true')) {
      url = `${url}?hide-ui=true`
    }

    return url
  }

  return (
    <div className={styles.controls}>
      <Tooltip title="Docs Overview" placement="top" arrow>
        <Link to="/" className={styles['home-button']}>
          <Home sx={buttonStyle} />
        </Link>
      </Tooltip>

      <FormControl>
        <Select
          sx={{
            "&.MuiOutlinedInput-root": {
              "&:hover fieldset": {
                borderColor: "rgba(0, 0, 0, 0.33)"
              },
              "&.Mui-focused fieldset": {
                borderColor: "rgba(0, 0, 0, 0.33)"
              }
            }
          }}
          className={styles['version-select']}
          onChange={(e) => {
            props.onVersionChange(e.target.value)
          }}
          value={
            props.versions.find((v) => v.name === props.version) !== undefined
              ? props.version
              : ''
          }
        >
          {props.versions
            .filter((v) => !v.hidden || v.name === props.version)
            .map((v) => (
              <MenuItem key={v.name} value={v.name}>
                {v.name + (v.tags.length > 0 ? ` (${v.tags.join(', ')})` : '')}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      <Tooltip title="Share Link" placement="top" arrow>
        <button
          className={styles['share-button']}
          onClick={() => {
            setShareModalOpen(true)
          }}
        >
          <Share sx={buttonStyle} />
        </button>
      </Tooltip>

      <Modal
        open={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false)
        }}
        aria-labelledby="share-modal-title"
        aria-describedby="share-modal-description"
      >
        <div className={styles['share-modal']}>
          <div className={styles['share-modal-link-container']}>
            <p className={styles['share-modal-link']}>{getShareUrl()}</p>
            {canCopy && (
              <div className={styles['share-modal-copy-container']}>
                <button
                  className={styles['share-modal-copy']}
                  onClick={() => {
                    void (async () => {
                      await navigator.clipboard.writeText(getShareUrl())
                    })()
                  }}
                >
                  Copy
                </button>
              </div>
            )}
          </div>

          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareModalHideUi}
                  onChange={(e) => {
                    setShareModalHideUi(e.target.checked)
                  }}
                />
              }
              label="Hide Version Selector"
              className={styles['share-modal-label']}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={shareModalUseLatest}
                  onChange={(e) => {
                    setShareModalUseLatest(e.target.checked)
                  }}
                />
              }
              label="Always use latest version"
              className={styles['share-modal-label']}
            />
          </FormGroup>

          <button
            className={styles['share-modal-close']}
            onClick={() => {
              setShareModalOpen(false)
            }}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}
