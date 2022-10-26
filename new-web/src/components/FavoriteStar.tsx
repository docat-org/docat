import { Star, StarOutline } from "@mui/icons-material";
import { useState } from "react";
import ProjectRepository from "../repositories/ProjectRepository";

export default function FavoriteStar(props: {
  projectName: string;
  onFavoriteChanged: () => void;
}) {
  const [isFavorite, setIsFavorite] = useState<boolean>(
    ProjectRepository.isFavorite(props.projectName)
  );

  function toggleFavorite() {
    const newIsFavorite = !isFavorite;
    ProjectRepository.setFavorite(props.projectName, newIsFavorite);
    setIsFavorite(newIsFavorite);

    props.onFavoriteChanged();
  }

  const StarType = isFavorite ? Star : StarOutline;

  return (
    <StarType
      style={{ color: "#505050", cursor: "pointer", float: "right" }}
      onClick={toggleFavorite}
    />
  );
}
