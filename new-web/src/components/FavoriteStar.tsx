import { Star, StarOutline } from '@mui/icons-material'
import React, { useState } from 'react'
import ProjectRepository from '../repositories/ProjectRepository'

export default function FavoriteStar (props: {
  projectName: string
  onFavoriteChanged: () => void
}): JSX.Element {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    ProjectRepository.isFavorite(props.projectName)
  )

  function toggleFavorite (): void {
    const newIsFavorite = !isFavorite
    ProjectRepository.setFavorite(props.projectName, newIsFavorite)
    setIsFavorite(newIsFavorite)

    props.onFavoriteChanged()
  }

  const StarType = isFavorite ? Star : StarOutline

  return (
    <StarType
      style={{ color: '#505050', cursor: 'pointer', float: 'right' }}
      onClick={toggleFavorite}
    />
  )
}
