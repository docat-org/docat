import { Star, StarOutline } from '@mui/icons-material'
import { useState } from 'react'
import ProjectRepository from '../repositories/ProjectRepository'

interface Props {
  projectName: string
  onFavoriteChanged: () => void
}

export default function FavoriteStar(props: Props): JSX.Element {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    ProjectRepository.isFavorite(props.projectName)
  )

  const toggleFavorite = (): void => {
    const newIsFavorite = !isFavorite
    ProjectRepository.setFavorite(props.projectName, newIsFavorite)
    setIsFavorite(newIsFavorite)

    props.onFavoriteChanged()
  }

  const StarType = isFavorite ? Star : StarOutline

  return (
    <StarType
      style={{ color: '#505050', cursor: 'pointer' }}
      onClick={toggleFavorite}
    />
  )
}
