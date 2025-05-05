import React, { useState, useEffect } from "react";
import { useAudio } from "@/context/AudioContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mic, Square} from "lucide-react";
import { generateLiveWaveformData } from "@/utils/audioUtils";

interface AudioRecorderProps {
  roomId: string;
}

const AudioRecorder: React.FC<AudioRecorderProps> = ({ roomId }) => {
  const { isRecording, startRecording, stopRecording } = useAudio();
  const [trackName, setTrackName] = useState("");
  const [recordingTime, setRecordingTime] = useState(0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const MAX_RECORDING_TIME = 30; // 30 seconds max

  // Handle recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => {
          // Auto-stop at max time
          if (prev >= MAX_RECORDING_TIME) {
            handleStopRecording();
            return 0;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Generate waveform visual
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveformData(generateLiveWaveformData(isRecording));
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = async () => {
    await stopRecording(
      trackName || `Loop ${new Date().toLocaleTimeString()}`,
      roomId
    );
    setTrackName("");
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-border">
      <h3 className="text-lg font-medium mb-4">Record New Loop</h3>

      <div className="mb-4">
        <Input
          placeholder="Track name"
          value={trackName}
          onChange={(e) => setTrackName(e.target.value)}
          disabled={isRecording}
          className="mb-2"
        />
      </div>

      <div className="waveform-container mb-4">
        {waveformData.map((height, index) => (
          <div
            key={index}
            className="waveform-bar"
            style={{
              height: `${height * 100}%`,
              left: `${(index / waveformData.length) * 100}%`,
              width: `${90 / waveformData.length}%`,
            }}
          ></div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm font-mono">
          {isRecording ? (
            <span className="text-red-500 flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
              {String(Math.floor(recordingTime / 60)).padStart(2, "0")}:
              {String(recordingTime % 60).padStart(2, "0")} /
              {String(Math.floor(MAX_RECORDING_TIME / 60)).padStart(2, "0")}:
              {String(MAX_RECORDING_TIME % 60).padStart(2, "0")}
            </span>
          ) : (
            <span className="text-muted-foreground">00:00 / 00:30</span>
          )}
        </div>

        {isRecording ? (
          <Button onClick={handleStopRecording} variant="destructive" size="sm">
            <Square className="h-4 w-4 mr-2" />
            Stop Recording
          </Button>
        ) : (
          <Button
            onClick={handleStartRecording}
            className="bg-music-primary hover:bg-music-secondary"
            size="sm"
          >
            <Mic className="h-4 w-4 mr-2" />
            Start Recording
          </Button>
        )}
      </div>
    </div>
  );
};

export default AudioRecorder;
