import React, { useEffect, useState } from "react";
import { generateWaveformData } from "@/utils/audioUtils";

interface WaveformVisualizerProps {
  isActive?: boolean;
  color?: string;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isActive = false,
  color = "rgba(139, 92, 246, 0.7)", // music-primary with opacity
}) => {
  const [waveformData, setWaveformData] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial data
    setWaveformData(generateWaveformData(40));

    // Animate waveform if active
    if (isActive) {
      const interval = setInterval(() => {
        setWaveformData(generateWaveformData(40));
      }, 200);

      return () => clearInterval(interval);
    }
  }, [isActive]);

  return (
    <div className="relative w-full h-20 bg-music-light dark:bg-music-dark/30 rounded-md overflow-hidden">
      {waveformData.map((height, index) => (
        <div
          key={index}
          className={`absolute bottom-0 ${isActive ? "audio-wave-active" : ""}`}
          style={{
            height: `${height * 100}%`,
            left: `${(index / waveformData.length) * 100}%`,
            width: `${90 / waveformData.length}%`,
            backgroundColor: color,
            animationDelay: `${(index % 5) * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
