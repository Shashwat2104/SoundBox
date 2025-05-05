import React, {
  createContext,
  useState,
  useContext,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { useToast } from "@/components/ui/use-toast";

export type AudioTrack = {
  id: string;
  name: string;
  userId: string;
  username: string;
  roomId: string;
  audioBlob: Blob;
  audioUrl: string;
  createdAt: number;
  isActive: boolean;
  volume: number;
  order: number;
};

type AudioContextType = {
  isRecording: boolean;
  startRecording: () => Promise<void>;
  stopRecording: (
    trackName: string,
    roomId: string
  ) => Promise<AudioTrack | null>;
  tracks: AudioTrack[];
  addTrack: (track: AudioTrack) => void;
  toggleTrack: (trackId: string) => void;
  updateTrackVolume: (trackId: string, volume: number) => void;
  playAllTracks: () => void;
  stopAllTracks: () => void;
  isPlaying: boolean;
  exportMixdown: () => Promise<void>;
  fetchNewTracks: (roomId: string) => Promise<boolean>;
  setCurrentRoomId: (roomId: string | null) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracks, setTracks] = useState<AudioTrack[]>([]);
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const audioElementsRef = useRef<HTMLAudioElement[]>([]);
  const { toast } = useToast();

  // Define stopAllTracks before playAllTracks to avoid the reference error
  const stopAllTracks = useCallback(() => {
    audioElementsRef.current.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
    audioElementsRef.current = [];
    setIsPlaying(false);
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);

      toast({
        title: "Recording started",
        description: "You're now recording your audio loop",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async (
    trackName: string,
    roomId: string
  ): Promise<AudioTrack | null> => {
    return new Promise((resolve) => {
      if (
        !mediaRecorderRef.current ||
        mediaRecorderRef.current.state === "inactive"
      ) {
        setIsRecording(false);
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const audioUrl = URL.createObjectURL(audioBlob);

        // Get mock user from local storage
        const userJson = localStorage.getItem("soundboard_user");
        if (!userJson) {
          toast({
            title: "Error",
            description: "You must be logged in to record audio",
            variant: "destructive",
          });
          setIsRecording(false);
          resolve(null);
          return;
        }

        const user = JSON.parse(userJson);

        const newTrack: AudioTrack = {
          id: `track-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          name: trackName || `Loop ${tracks.length + 1}`,
          userId: user.id,
          username: user.username,
          roomId,
          audioBlob,
          audioUrl,
          createdAt: Date.now(),
          isActive: true,
          volume: 1.0,
          order: tracks.length,
        };

        setTracks((prev) => [...prev, newTrack]);
        setIsRecording(false);

        toast({
          title: "Recording saved!",
          description: `Your audio loop "${newTrack.name}" has been saved`,
        });

        // Update user stats
        const updatedUser = {
          ...user,
          stats: {
            ...user.stats,
            loopsRecorded: (user.stats.loopsRecorded || 0) + 1,
          },
        };
        localStorage.setItem("soundboard_user", JSON.stringify(updatedUser));

        resolve(newTrack);
      };

      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
    });
  };

  const addTrack = useCallback((track: AudioTrack) => {
    setTracks((prev) => {
      // Check if track already exists to avoid duplicates
      if (prev.some((t) => t.id === track.id)) {
        return prev;
      }
      return [...prev, track];
    });
  }, []);

  const toggleTrack = useCallback((trackId: string) => {
    setTracks((prev) =>
      prev.map((track) =>
        track.id === trackId ? { ...track, isActive: !track.isActive } : track
      )
    );
  }, []);

  const updateTrackVolume = useCallback(
    (trackId: string, volume: number) => {
      setTracks((prev) =>
        prev.map((track) =>
          track.id === trackId ? { ...track, volume } : track
        )
      );

      // Update volume for currently playing audio
      const trackIndex = tracks.findIndex((t) => t.id === trackId);
      if (trackIndex >= 0 && trackIndex < audioElementsRef.current.length) {
        const audioElement = audioElementsRef.current[trackIndex];
        if (audioElement) {
          audioElement.volume = volume;
        }
      }
    },
    [tracks]
  );

  const playAllTracks = useCallback(() => {
    // Stop any playing audio first
    stopAllTracks();

    // Filter active tracks
    const activeTracks = tracks.filter((track) => track.isActive);

    if (activeTracks.length === 0) {
      toast({
        title: "No active tracks",
        description: "Enable at least one track to play audio",
        variant: "destructive",
      });
      return;
    }

    // Create and play audio elements for each active track
    const audioElements: HTMLAudioElement[] = [];

    activeTracks.forEach((track) => {
      const audio = new Audio(track.audioUrl);
      audio.volume = track.volume;
      audio.loop = true;
      audio.play();
      audioElements.push(audio);
    });

    audioElementsRef.current = audioElements;
    setIsPlaying(true);

    toast({
      title: "Playback started",
      description: `Playing ${activeTracks.length} audio tracks`,
    });
  }, [tracks, toast, stopAllTracks]);

  const exportMixdown = async () => {
    const activeTracks = tracks.filter((track) => track.isActive);

    if (activeTracks.length === 0) {
      toast({
        title: "Export failed",
        description: "No active tracks to export",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exporting mixdown",
      description: "Processing your audio tracks...",
    });

    try {
      // Create an offline audio context for rendering
      const offlineCtx = new OfflineAudioContext({
        numberOfChannels: 2,
        length: 44100 * 30, // 30 seconds at 44.1kHz
        sampleRate: 44100,
      });

      // Load and decode all audio files
      const audioBuffers = await Promise.all(
        activeTracks.map(async (track) => {
          // Fetch the audio data
          const response = await fetch(track.audioUrl);
          const arrayBuffer = await response.arrayBuffer();
          // Decode the audio data
          return {
            buffer: await offlineCtx.decodeAudioData(arrayBuffer),
            volume: track.volume,
          };
        })
      );

      // Create sources for each buffer and connect them to the offline context
      const sources = audioBuffers.map(({ buffer, volume }) => {
        const source = offlineCtx.createBufferSource();
        source.buffer = buffer;

        // Apply volume
        const gainNode = offlineCtx.createGain();
        gainNode.gain.value = volume;

        // Connect source -> gain -> destination
        source.connect(gainNode);
        gainNode.connect(offlineCtx.destination);

        return source;
      });

      // Start all sources
      sources.forEach((source) => source.start(0));

      // Render the audio
      const renderedBuffer = await offlineCtx.startRendering();

      // Convert AudioBuffer to WAV format
      const numberOfChannels = renderedBuffer.numberOfChannels;
      const length = renderedBuffer.length;
      const sampleRate = renderedBuffer.sampleRate;
      const wavBuffer = new ArrayBuffer(44 + length * 2 * numberOfChannels);
      const view = new DataView(wavBuffer);

      // Write WAV header
      // "RIFF" chunk descriptor
      writeString(view, 0, "RIFF");
      view.setUint32(4, 36 + length * 2 * numberOfChannels, true);
      writeString(view, 8, "WAVE");

      // "fmt " sub-chunk
      writeString(view, 12, "fmt ");
      view.setUint32(16, 16, true); // subchunk1Size
      view.setUint16(20, 1, true); // audioFormat (PCM)
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * 2 * numberOfChannels, true); // byteRate
      view.setUint16(32, 2 * numberOfChannels, true); // blockAlign
      view.setUint16(34, 16, true); // bitsPerSample

      // "data" sub-chunk
      writeString(view, 36, "data");
      view.setUint32(40, length * 2 * numberOfChannels, true);

      // Write audio data
      const offset = 44;
      const channelData = [];
      for (let channel = 0; channel < numberOfChannels; channel++) {
        channelData.push(renderedBuffer.getChannelData(channel));
      }

      let index = 0;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          // Convert float to int
          const sample = Math.max(-1, Math.min(1, channelData[channel][i]));
          const value = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
          view.setInt16(offset + index, value, true);
          index += 2;
        }
      }

      // Create Blob and download
      const blob = new Blob([wavBuffer], { type: "audio/wav" });
      const url = URL.createObjectURL(blob);

      // Create download link
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      a.download = `soundboard-mixdown-${timestamp}.wav`;
      a.href = url;
      a.click();

      // Cleanup
      URL.revokeObjectURL(url);

      // Update user stats
      const userJson = localStorage.getItem("soundboard_user");
      if (userJson) {
        const user = JSON.parse(userJson);
        const updatedUser = {
          ...user,
          stats: {
            ...user.stats,
            mixdownExports: (user.stats.mixdownExports || 0) + 1,
          },
        };
        localStorage.setItem("soundboard_user", JSON.stringify(updatedUser));
      }

      toast({
        title: "Export complete!",
        description: `Successfully exported ${activeTracks.length} tracks to WAV`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export failed",
        description: "An error occurred during export",
        variant: "destructive",
      });
    }
  };

  // Helper function to write strings to DataView
  function writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  // New function to fetch tracks from localStorage for a specific room
  const fetchNewTracks = useCallback(
    async (roomId: string): Promise<boolean> => {
      // Simulate API call by fetching from localStorage
      const allTracksString = localStorage.getItem("soundboard_tracks");

      if (!allTracksString) {
        // If no tracks exist yet, save the current ones
        if (tracks.length > 0) {
          localStorage.setItem("soundboard_tracks", JSON.stringify(tracks));
        }
        return false;
      }

      try {
        const allTracks: AudioTrack[] = JSON.parse(allTracksString);

        // Filter tracks for the current room
        const roomTracks = allTracks.filter((track) => track.roomId === roomId);

        // Check if there are any new tracks we don't have yet
        const currentTrackIds = new Set(tracks.map((track) => track.id));
        const newTracks = roomTracks.filter(
          (track) => !currentTrackIds.has(track.id)
        );

        if (newTracks.length > 0) {
          // Add new tracks to our state
          newTracks.forEach((track) => {
            // Create a new blob URL for each track's audio blob
            // Fix: We can't use Buffer.from with a Blob directly, so we'll handle it differently
            // We'll create a new Blob object since the stored audioBob is just JSON data
            const blob = new Blob([JSON.stringify(track.audioBlob)], {
              type: "audio/webm",
            });
            const audioUrl = URL.createObjectURL(blob);

            addTrack({
              ...track,
              audioBlob: blob,
              audioUrl,
            });
          });

          return true;
        }

        return false;
      } catch (error) {
        console.error("Error fetching new tracks:", error);
        return false;
      }
    },
    [tracks, addTrack]
  );

  // Save tracks to localStorage whenever they change
  useEffect(() => {
    if (currentRoomId && tracks.length > 0) {
      // Get existing tracks from localStorage
      const allTracksString = localStorage.getItem("soundboard_tracks");
      let allTracks: AudioTrack[] = [];

      if (allTracksString) {
        try {
          allTracks = JSON.parse(allTracksString);

          // Remove tracks for the current room
          allTracks = allTracks.filter(
            (track) => track.roomId !== currentRoomId
          );
        } catch (error) {
          console.error("Error parsing tracks from localStorage:", error);
        }
      }

      // Add current room tracks
      const roomTracks = tracks.map((track) => ({
        ...track,
        // Convert Blob to array buffer for storage
        audioBlob: track.audioBlob,
      }));

      // Save combined tracks back to localStorage
      localStorage.setItem(
        "soundboard_tracks",
        JSON.stringify([...allTracks, ...roomTracks])
      );
    }
  }, [tracks, currentRoomId]);

  return (
    <AudioContext.Provider
      value={{
        isRecording,
        startRecording,
        stopRecording,
        tracks,
        addTrack,
        toggleTrack,
        updateTrackVolume,
        playAllTracks,
        stopAllTracks,
        isPlaying,
        exportMixdown,
        fetchNewTracks,
        setCurrentRoomId,
      }}
    >
      {children}
    </AudioContext.Provider>
  );
};
