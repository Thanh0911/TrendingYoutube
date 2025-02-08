import { useEffect, useState } from "react";
import "./Trending.scss";
import axios from "axios";

const SidebarItems = [
  { id: 1, name: "Trending" },
  { id: 2, name: "Music" },
  { id: 3, name: "Gaming" },
  { id: 4, name: "Movies" },
];
const instance = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3/",
});

function timeSince(postedDate) {
  const now = new Date();
  const postDate = new Date(postedDate);
  const elapsed = Math.floor((now - postDate) / 1000);

  const seconds = elapsed;
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} năm trước`;
  if (months > 0) return `${months} tháng trước`;
  if (days > 0) return `${days} ngày trước`;
  if (hours > 0) return `${hours} giờ trước`;
  if (minutes > 0) return `${minutes} phút trước`;

  return `${seconds} giây trước`;
}

const formatViews = (views) => {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }
  return views.toString();
};

export default function Trending() {
  const [isSelected, setIsSelected] = useState("Trending");
  const [videos, setVideos] = useState([]);
  const fetchVideos = async () => {
    try {
      const searchResponse = await instance.get("search", {
        params: {
          part: "snippet",
          q: isSelected,
          type: "video",
          order: "date",
          regionCode: "VN",
          maxResults: "50",
          key: "AIzaSyA1RadG4fVQhB80uz7g6EYZqSRYp0AnF5o",
        },
      });

      const videoIds = searchResponse.data.items
        .map((item) => item.id.videoId)
        .join(",");

      const videoDetails = await instance.get("videos", {
        params: {
          part: "snippet, statistics",
          id: videoIds,
          key: "AIzaSyALqsPow3wkH_HifbNaMLoDBV8mLIUrF3c",
        },
      });

      const videoItems = videoDetails.data.items.map((item) => ({
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        videoId: item.id,
        views: item.statistics.viewCount,
        date: item.snippet.publishedAt,
        description: item.snippet.description,
      }));

      setVideos(videoItems);
    } catch (error) {
      console.log("Error videos: ", error);
    }
  };

  useEffect(() => {
    setVideos([]);
    fetchVideos();
  }, [isSelected]);
  return (
    <div className="trending">
      <Header isSelected={isSelected} onIsSelected={setIsSelected} />

      <VideosPlayList videos={videos} />
    </div>
  );
}

function Header({ isSelected, onIsSelected }) {
  return (
    <div className="header-trending">
      <Logo />
      <SidebarItemsList isSelected={isSelected} onIsSelected={onIsSelected} />
    </div>
  );
}

function Logo() {
  return (
    <div className="logo">
      <img
        src="https://www.youtube.com/img/trending/avatar/trending_animated.webp"
        alt="logo-trending-page"
      />
      <h1>Trending</h1>
    </div>
  );
}

function SidebarItemsList({ isSelected, onIsSelected }) {
  return (
    <>
      <ul className="sidebar-trending">
        {SidebarItems.map((sidebarItem) => (
          <SidebarItem
            key={sidebarItem.id}
            sidebarItem={sidebarItem}
            isSelected={isSelected}
            onIsSelected={onIsSelected}
          />
        ))}
      </ul>
      <hr className="hr" />
    </>
  );
}

function SidebarItem({ sidebarItem, isSelected, onIsSelected }) {
  const isChossen = isSelected === sidebarItem.name;

  function hanldeToggle() {
    onIsSelected(sidebarItem.name);
  }

  return (
    <li
      className={`sidebarItem ${isChossen ? "selected" : ""}`}
      onClick={hanldeToggle}
    >
      <span>{sidebarItem.name}</span>
    </li>
  );
}

function VideosPlayList({ videos }) {
  return (
    <div className="videoslist">
      {videos.map((video) => (
        <Video key={video.videoId} video={video} />
      ))}
    </div>
  );
}

function Video({ video }) {
  return (
    <div className="video">
      <Iframe
        src={`https://www.youtube.com/embed/${video.videoId}`}
        title="YouTube video player"
      />
      <VideoInfo
        title={video.title}
        channel={video.channel}
        views={formatViews(video.views)}
        date={timeSince(video.date)}
        description={video.description}
      />
    </div>
  );
}
function Iframe({ src, title }) {
  return (
    <div className="iframe">
      <iframe src={src} title={title} frameborder="0" allowfullscreen />
    </div>
  );
}

function VideoInfo({ title, channel, views, date, description }) {
  return (
    <div className="videoInfo">
      <h1 className="title">{title}</h1>
      <ul className="interation">
        <li>{channel}</li>
        <li>{views}</li>
        <li>{date}</li>
      </ul>
      <p className="describe">
        {description.length > 40
          ? description.slice(0, 200) + "..."
          : description}
      </p>
    </div>
  );
}
