import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { generateRoomCode } from "@/utils/formatters";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock room data storage
const mockRooms: any[] = [];

const CreateRoomModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [roomData, setRoomData] = useState({
    title: "",
    bpm: 120,
    key: "C",
    isPublic: true,
  });
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!roomData.title) {
      toast({
        title: "Missing title",
        description: "Please provide a name for your jam room",
        variant: "destructive",
      });
      return;
    }

    // Create new room with mock data
    const newRoom = {
      id: `room-${Date.now()}`,
      title: roomData.title,
      hostId: user?.id || "unknown",
      hostName: user?.username || "Anonymous",
      bpm: roomData.bpm,
      key: roomData.key,
      isPublic: roomData.isPublic,
      roomCode: generateRoomCode(),
      createdAt: Date.now(),
      participants: 1,
      trackCount: 0,
    };

    // In a real app, this would send to an API
    mockRooms.push(newRoom);

    // Update user stats
    const userJson = localStorage.getItem("soundboard_user");
    if (userJson) {
      const userData = JSON.parse(userJson);
      const updatedUser = {
        ...userData,
        stats: {
          ...userData.stats,
          roomsHosted: (userData.stats.roomsHosted || 0) + 1,
        },
      };
      localStorage.setItem("soundboard_user", JSON.stringify(updatedUser));
    }

    // Store room in local storage for persistence
    const existingRooms = JSON.parse(
      localStorage.getItem("soundboard_rooms") || "[]"
    );
    localStorage.setItem(
      "soundboard_rooms",
      JSON.stringify([...existingRooms, newRoom])
    );

    toast({
      title: "Room created!",
      description: `Your jam room "${roomData.title}" is ready`,
    });

    setIsOpen(false);

    // Navigate to the new room
    navigate(`/jam/${newRoom.id}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-music-primary hover:bg-music-secondary">
          Create Jam Room
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New Jam Room</DialogTitle>
          <DialogDescription>
            Set up a space for your music collaboration. Add details about your
            jam session.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Room Name</Label>
            <Input
              id="title"
              value={roomData.title}
              onChange={(e) =>
                setRoomData({ ...roomData, title: e.target.value })
              }
              placeholder="Late Night Beats"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="bpm">BPM</Label>
              <Input
                id="bpm"
                type="number"
                value={roomData.bpm}
                onChange={(e) =>
                  setRoomData({
                    ...roomData,
                    bpm: parseInt(e.target.value) || 120,
                  })
                }
                min={40}
                max={240}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="key">Key</Label>
              <Select
                value={roomData.key}
                onValueChange={(value) =>
                  setRoomData({ ...roomData, key: value })
                }
              >
                <SelectTrigger id="key">
                  <SelectValue placeholder="Select key" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="C">C</SelectItem>
                  <SelectItem value="C#">C#</SelectItem>
                  <SelectItem value="D">D</SelectItem>
                  <SelectItem value="D#">D#</SelectItem>
                  <SelectItem value="E">E</SelectItem>
                  <SelectItem value="F">F</SelectItem>
                  <SelectItem value="F#">F#</SelectItem>
                  <SelectItem value="G">G</SelectItem>
                  <SelectItem value="G#">G#</SelectItem>
                  <SelectItem value="A">A</SelectItem>
                  <SelectItem value="A#">A#</SelectItem>
                  <SelectItem value="B">B</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="public">Public Room</Label>
            <Switch
              id="public"
              checked={roomData.isPublic}
              onCheckedChange={(checked) =>
                setRoomData({ ...roomData, isPublic: checked })
              }
            />
          </div>

          <div className="text-sm text-muted-foreground">
            {roomData.isPublic
              ? "Anyone can find and join this room."
              : "Only people with the room code can join."}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateRoom}
            className="bg-music-primary hover:bg-music-secondary"
          >
            Create Room
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRoomModal;
