import { isValidUrl, getImageUrl, isVideoUrl } from "../utils/Helper";
import { Typography } from "@mui/material";
import Image from "./Image";

interface RenderImageProps {
  data: string;
  name: string;
}

const RenderImage: React.FC<RenderImageProps> = ({ data, name }) => {
  if (!data || data.trim() === "") {
    return (
      <Typography variant="body2" pt={3} pb={3}>
        No Media
      </Typography>
    );
  }

  if (!isValidUrl(data)) {
    return (
      <Typography variant="body2" pt={3} pb={3}>
        Invalid URL
      </Typography>
    );
  }

  if (isVideoUrl(data)) {
    return (
      <video
        controls
        style={{
          width: 70,
          height: 70,
          padding: "5px",
          borderRadius: 4,
          objectFit: "cover",
        }}
      >
        <source src={getImageUrl(data)} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <Image
      src={getImageUrl(data)}
      alt={name}
      style={{
        width: 70,
        height: 70,
        padding: "5px",
        borderRadius: 4,
        objectFit: "cover",
      }}
    />
  );
};

export default RenderImage;