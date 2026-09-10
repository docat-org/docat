import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import React, { useState } from 'react'
import ProjectRepository from '../repositories/ProjectRepository'

interface Props {
  projectName: string
  onFavoriteChanged: () => void
}

export default function FavoriteStar(props: Props): React.JSX.Element {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    ProjectRepository.isFavorite(props.projectName)
  )

  const toggleFavorite = (): void => {
    const newIsFavorite = !isFavorite
    ProjectRepository.setFavorite(props.projectName, newIsFavorite)
    setIsFavorite(newIsFavorite)

    props.onFavoriteChanged()
  }

  const StarType = isFavorite ? StarIcon : StarBorderIcon

  return (
    <StarType
      style={{ color: '#505050', cursor: 'pointer' }}
      onClick={toggleFavorite}
    />
  )
}
