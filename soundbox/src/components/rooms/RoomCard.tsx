import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utils/formatters";
import WaveformVisualizer from "../ui/WaveformVisualizer";

export interface Room {
  id: string;
  title: string;
  hostId: string;
  hostName: string;
  bpm: number;
  key: string;
  isPublic: boolean;
  roomCode: string;
  createdAt: number;
  participants: number;
  trackCount: number;
}

interface RoomCardProps {
  room: Room;
}

const RoomCard: React.FC<RoomCardProps> = ({ room }) => {
  return (
    <Card className="w-full overflow-hidden hover:border-music-primary/40 transition-all duration-300">
      <CardHeader className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{room.title}</CardTitle>
            <div className="text-sm text-muted-foreground mt-1">
              Hosted by {room.hostName} • {formatDate(room.createdAt)}
            </div>
          </div>
          <Badge variant={room.isPublic ? "outline" : "secondary"}>
            {room.isPublic ? "Public" : "Private"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
          <div>
            <div className="text-muted-foreground">BPM</div>
            <div className="font-medium">{room.bpm}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Key</div>
            <div className="font-medium">{room.key}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Code</div>
            <div className="font-medium font-mono">{room.roomCode}</div>
          </div>
        </div>

        <WaveformVisualizer />

        <div className="flex justify-between mt-4 text-sm">
          <div>
            <span className="text-muted-foreground mr-1">Participants:</span>
            <span className="font-medium">{room.participants}</span>
          </div>
          <div>
            <span className="text-muted-foreground mr-1">Tracks:</span>
            <span className="font-medium">{room.trackCount}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          asChild
          className="w-full bg-music-primary hover:bg-music-secondary"
        >
          <Link to={`/jam/${room.id}`}>Join Session</Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoomCard;
