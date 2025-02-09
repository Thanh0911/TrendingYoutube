import { useEffect, useState } from "react";
import axios from "axios";
import React from "react";

const SidebarItems = [
  { id: 1, name: "Trending" },
  { id: 2, name: "Music" },
  { id: 3, name: "Gaming" },
  { id: 4, name: "Movies" },
];

const instance = axios.create({
  baseURL: "https://www.googleapis.com/youtube/v3/",
});

interface VideoItem {
  title: string;
  channel: string;
  videoId: string;
  views: string;
  date: string;
  description: string;
}

function timeSince(postedDate: string) {
  const now = new Date();
  const postDate = new Date(postedDate);
  const elapsed = Math.floor((now.getTime() - postDate.getTime()) / 1000);

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

const formatViews = (views: number) => {
  if (views >= 1_000_000) {
    return `${(views / 1_000_000).toFixed(1)}M`;
  } else if (views >= 1_000) {
    return `${(views / 1_000).toFixed(1)}K`;
  }
  return views.toString();
};

export default function Trending() {
  const [isSelected, setIsSelected] = useState<string>("Trending");
  const [videos, setVideos] = useState<VideoItem[]>([]);

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
          key: "YOUR_YOUTUBE_API_KEY",
        },
      });

      const videoIds = searchResponse.data.items
        .map((item: any) => item.id.videoId)
        .join(",");

      const videoDetails = await instance.get("videos", {
        params: {
          part: "snippet,statistics",
          id: videoIds,
          key: "YOUR_YOUTUBE_API_KEY",
        },
      });

      const videoItems = videoDetails.data.items.map((item: any) => ({
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        videoId: item.id,
        views: formatViews(Number(item.statistics.viewCount)),
        date: timeSince(item.snippet.publishedAt),
        description: item.snippet.description,
      }));

      setVideos(videoItems);
    } catch (error) {
      console.error("Error fetching videos: ", error);
    }
  };

  useEffect(() => {
    setVideos([]);
    fetchVideos();
  }, [isSelected]);

  return (
    <div className="p-8 flex flex-col gap-4">
      <Header />
      <Sidebar isSelected={isSelected} onIsSelected={setIsSelected} />
      <VideoList videos={videos} />
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center gap-4 text-white">
      <img
        src="https://www.youtube.com/img/trending/avatar/trending_animated.webp"
        alt="Trending Logo"
        className="h-10"
      />
      <h1 className="text-xl font-bold">Trending</h1>
    </div>
  );
}

function Sidebar({
  isSelected,
  onIsSelected,
}: {
  isSelected: string;
  onIsSelected: (name: string) => void;
}) {
  return (
    <ul className="flex gap-4 text-white">
      {SidebarItems.map((item) => (
        <li
          key={item.id}
          className={`cursor-pointer px-4 py-2 ${
            isSelected === item.name ? "border-b-2 border-white" : ""
          }`}
          onClick={() => onIsSelected(item.name)}
        >
          {item.name}
        </li>
      ))}
    </ul>
  );
}

function VideoList({ videos }: { videos: VideoItem[] }) {
  return (
    <div className="flex flex-col gap-4">
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} />
      ))}
    </div>
  );
}

function VideoCard({ video }: { key: string; video: VideoItem }) {
  return (
    <div className="flex gap-4 text-white">
      <iframe
        src={`https://www.youtube.com/embed/${video.videoId}`}
        title={video.title}
        className="w-1/3 h-48 rounded-lg"
        allowFullScreen
      />
      <div className="w-2/3 flex flex-col gap-2">
        <h2 className="text-lg font-bold">{video.title}</h2>
        <p className="text-gray-400">{video.channel}</p>
        <p className="text-gray-400">
          {video.views} views • {video.date}
        </p>
        <p className="text-gray-400 text-sm">
          {video.description.length > 200
            ? video.description.slice(0, 200) + "..."
            : video.description}
        </p>
      </div>
    </div>
  );
}
