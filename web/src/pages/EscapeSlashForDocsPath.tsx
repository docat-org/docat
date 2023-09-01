import { Navigate, useLocation } from 'react-router-dom'
import ProjectRepository from '../repositories/ProjectRepository'
import React from 'react'

/**
 * This component is used to escape slashes in the path of the docs page.
 * It replaces all slashes with "%2F" and redirects to the new path.
 * @returns <Navigate to={newLocation} replace={true}/>
 */
export default function EscapeSlashForDocsPath (): JSX.Element {
  const location = useLocation()
  return <Navigate to={ProjectRepository.escapeSlashesInUrl(location.pathname, location.search, location.hash)} replace={true}></Navigate>
}
