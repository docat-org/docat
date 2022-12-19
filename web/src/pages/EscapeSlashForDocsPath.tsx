import { Navigate, useLocation } from 'react-router-dom'
import React from 'react'

/**
 * This component is used to escape slashes in the path of the docs page.
 * It replaces all slashes with "%2F" and redirects to the new path.
 * @returns <Navigate to={newLocation} />
 */
export default function EscapeSlashForDocsPath (): JSX.Element {
  const url = useLocation().pathname
  const endOfVersionIndex = url.split('/', 3).join('/').length

  const projectAndVersion = url.substring(0, endOfVersionIndex)
  const path = url.substring(endOfVersionIndex + 1).replaceAll('/', '%2F')

  let newUrl = projectAndVersion

  if (path.length > 0) {
    newUrl = `${newUrl}/${path}`
  }

  return <Navigate to={newUrl}></Navigate>
}
