import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AudioProvider, useAudio } from "@/context/AudioContext";
import Header from "@/components/layout/Header";
import AudioRecorder from "@/components/ui/AudioRecorder";
import AudioTrack from "@/components/ui/AudioTrack";
import { Room } from "@/components/rooms/RoomCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Square, Download, Share2, Users } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

// This is a wrapper component that ensures AudioProvider is available
const JamRoomWrapper: React.FC = () => (
  <AudioProvider>
    <JamRoomContent />
  </AudioProvider>
);

const JamRoomContent = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [room, setRoom] = useState<Room | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    tracks,
    isPlaying,
    playAllTracks,
    stopAllTracks,
    exportMixdown,
    fetchNewTracks,
    setCurrentRoomId,
  } = useAudio();
  const [isPolling, setIsPolling] = useState(true);
  const [newTrackCount, setNewTrackCount] = useState(0);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/?login=true");
      return;
    }
  }, [isAuthenticated, navigate]);

  // Set current room ID in AudioContext
  useEffect(() => {
    if (roomId) {
      setCurrentRoomId(roomId);
    }

    return () => {
      setCurrentRoomId(null);
    };
  }, [roomId, setCurrentRoomId]);

  // Load room data
  useEffect(() => {
    const loadRoom = () => {
      const storedRooms = localStorage.getItem("soundboard_rooms");
      if (storedRooms) {
        try {
          const rooms: Room[] = JSON.parse(storedRooms);
          const foundRoom = rooms.find((r) => r.id === roomId);
          if (foundRoom) {
            setRoom(foundRoom);
          } else {
            toast({
              title: "Room not found",
              description: "This jam room doesn't exist or has been deleted",
              variant: "destructive",
            });
            navigate("/dashboard");
          }
        } catch (error) {
          console.error("Failed to parse stored rooms:", error);
        }
      }
    };

    loadRoom();
  }, [roomId, navigate, toast]);

  // Setup polling for new tracks
  useEffect(() => {
    if (!isPolling || !roomId) return;

    const pollInterval = setInterval(async () => {
      try {
        // Fetch new tracks from server/localStorage
        const hasNewTracks = await fetchNewTracks(roomId);

        if (hasNewTracks) {
          setNewTrackCount((prevCount) => prevCount + 1);
          toast({
            title: "New loop available",
            description: "A new audio loop has been added to the session",
          });
        }
      } catch (error) {
        console.error("Error polling for new tracks:", error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [isPolling, roomId, fetchNewTracks, toast]);

  // Handle share room link
  const handleShareRoom = () => {
    if (!room) return;

    // Copy room link to clipboard
    const shareUrl = `${window.location.origin}/jam/${room.id}`;
    navigator.clipboard.writeText(shareUrl);

    toast({
      title: "Link copied!",
      description: "Room link copied to clipboard for sharing",
    });
  };

  if (!room) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading jam room...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{room.title}</h1>
              <Badge variant={room.isPublic ? "outline" : "secondary"}>
                {room.isPublic ? "Public" : "Private"}
              </Badge>
            </div>
            <p className="text-muted-foreground flex items-center gap-2">
              <span>Hosted by {room.hostName}</span>
              <span>•</span>
              <span>BPM: {room.bpm}</span>
              <span>•</span>
              <span>Key: {room.key}</span>
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleShareRoom}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              {room.participants} Online
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tracks and Controls Panel */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center">
                    Audio Tracks
                    {newTrackCount > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-2 animate-pulse bg-music-primary text-white"
                      >
                        +{newTrackCount} new
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    {isPlaying ? (
                      <Button
                        onClick={stopAllTracks}
                        variant="outline"
                        size="sm"
                      >
                        <Square className="h-4 w-4 mr-2" />
                        Stop
                      </Button>
                    ) : (
                      <Button
                        onClick={playAllTracks}
                        className="bg-music-primary hover:bg-music-secondary"
                        size="sm"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Play All
                      </Button>
                    )}
                    <Button onClick={exportMixdown} variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {tracks.length > 0 ? (
                  <div className="grid gap-4">
                    {tracks
                      .slice()
                      .sort((a, b) => a.createdAt - b.createdAt)
                      .map((track) => (
                        <AudioTrack key={track.id} track={track} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/20 rounded-md">
                    <p className="text-muted-foreground">
                      No tracks recorded yet.
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use the recorder to add the first loop!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recording Panel */}
          <div>
            <Tabs defaultValue="record" className="h-full flex flex-col">
              <TabsList className="mb-4 grid grid-cols-2">
                <TabsTrigger value="record">Record</TabsTrigger>
                <TabsTrigger value="chat">Chat</TabsTrigger>
              </TabsList>

              <TabsContent value="record" className="flex-grow">
                <AudioRecorder roomId={room.id} />
              </TabsContent>

              <TabsContent value="chat" className="flex-grow">
                <Card className="h-[400px] flex flex-col">
                  <CardHeader>
                    <CardTitle>Chat</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow overflow-y-auto pb-2">
                    <div className="text-center text-muted-foreground">
                      <p>Chat functionality coming soon!</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>

      <footer className="bg-white dark:bg-gray-900 py-6 border-t">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SoundBoard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default JamRoomWrapper;
