import React from "react";
import { AudioTrack as AudioTrackType, useAudio } from "@/context/AudioContext";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { formatDate, formatTimeSince } from "@/utils/formatters";
import { generateWaveformData } from "@/utils/audioUtils";

interface AudioTrackProps {
  track: AudioTrackType;
}

const AudioTrack: React.FC<AudioTrackProps> = ({ track }) => {
  const { toggleTrack, updateTrackVolume } = useAudio();
  const waveformData = React.useMemo(() => generateWaveformData(30), []);

  const handleVolumeChange = (values: number[]) => {
    updateTrackVolume(track.id, values[0]);
  };

  const handleToggle = () => {
    toggleTrack(track.id);
  };

  // Calculate how fresh the track is (for highlighting new tracks)
  const isNew = Date.now() - track.createdAt < 10000; // 10 seconds

  return (
    <div
      className={`track-container ${!track.isActive ? "opacity-60" : ""} ${
        isNew ? "animate-pulse border-l-4 border-music-primary pl-2" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h4 className="font-medium">{track.name}</h4>
          <p className="text-xs text-muted-foreground">
            by {track.username} •{" "}
            <span title={formatDate(track.createdAt)}>
              {formatTimeSince(track.createdAt)}
            </span>
          </p>
        </div>
        <Switch checked={track.isActive} onCheckedChange={handleToggle} />
      </div>

      <div className="relative h-12 bg-music-light/40 dark:bg-music-dark/40 rounded overflow-hidden mb-2">
        {waveformData.map((height, index) => (
          <div
            key={index}
            className={`absolute bottom-0 bg-music-primary/70 rounded-t-sm`}
            style={{
              height: `${height * 100}%`,
              left: `${(index / waveformData.length) * 100}%`,
              width: `${90 / waveformData.length}%`,
              opacity: track.isActive ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm w-6">{Math.round(track.volume * 100)}%</span>
        <Slider
          value={[track.volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          disabled={!track.isActive}
          className="track-volume flex-1"
        />
      </div>
    </div>
  );
};

export default AudioTrack;
