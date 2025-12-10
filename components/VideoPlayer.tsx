"use client";



interface VideoPlayerProps {
  videoUrl: string | null;
  thumbnail?: string | null;
  title?: string;
}

export default function VideoPlayer({
  videoUrl,
  thumbnail,
  title,
}: VideoPlayerProps) {


  if (!videoUrl) {
    return (
      <div className="w-full aspect-video bg-slate-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="text-slate-400 mb-2">No video available</div>
          <p className="text-sm text-slate-500">
            Video will appear here once uploaded
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="aspect-video bg-black rounded-lg overflow-hidden">
        <video
          controls
          poster={thumbnail || undefined}
          className="w-full h-full"
        >
          <source src={videoUrl} type="video/mp4" />
          <source src={videoUrl} type="video/webm" />
          Your browser does not support the video tag.
        </video>
      </div>
      {title && <h3 className="text-lg font-semibold mt-4">{title}</h3>}
    </div>
  );
}
