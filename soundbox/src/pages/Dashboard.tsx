import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/layout/Header";
import RoomCard, { Room } from "@/components/rooms/RoomCard";
import CreateRoomModal from "@/components/rooms/CreateRoomModal";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { generateRoomCode } from "@/utils/formatters";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/?login=true");
      return;
    }

    // Load rooms from local storage or use mock data
    const storedRooms = localStorage.getItem("soundboard_rooms");
    let roomData: Room[] = [];

    if (storedRooms) {
      try {
        roomData = JSON.parse(storedRooms);
      } catch (error) {
        console.error("Failed to parse stored rooms:", error);
      }
    }

    // If no stored rooms, create mock rooms
    if (roomData.length === 0) {
      const mockRooms: Room[] = [
        {
          id: "room-1",
          title: "Jazz Fusion Jam",
          hostId: "host1",
          hostName: "JazzMaster",
          bpm: 120,
          key: "D",
          isPublic: true,
          roomCode: generateRoomCode(),
          createdAt: Date.now() - 3600000, // 1 hour ago
          participants: 3,
          trackCount: 8,
        },
        {
          id: "room-2",
          title: "Lofi Beats Session",
          hostId: "host2",
          hostName: "LofiProducer",
          bpm: 90,
          key: "C",
          isPublic: true,
          roomCode: generateRoomCode(),
          createdAt: Date.now() - 7200000, // 2 hours ago
          participants: 2,
          trackCount: 5,
        },
        {
          id: "room-3",
          title: "Rock Band Practice",
          hostId: user?.id || "host3",
          hostName: user?.username || "RockStar",
          bpm: 140,
          key: "E",
          isPublic: false,
          roomCode: generateRoomCode(),
          createdAt: Date.now() - 86400000, // 1 day ago
          participants: 4,
          trackCount: 12,
        },
      ];

      setRooms(mockRooms);
      localStorage.setItem("soundboard_rooms", JSON.stringify(mockRooms));
    } else {
      setRooms(roomData);
    }
  }, [isAuthenticated, navigate, user]);

  // Filter rooms when search term or active tab changes
  useEffect(() => {
    let filtered = rooms;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (room) =>
          room.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.hostName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.roomCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by tab
    if (activeTab === "my-rooms") {
      filtered = filtered.filter((room) => room.hostId === user?.id);
    } else if (activeTab === "public") {
      filtered = filtered.filter((room) => room.isPublic);
    } else if (activeTab === "private") {
      filtered = filtered.filter((room) => !room.isPublic);
    }

    setFilteredRooms(filtered);
  }, [rooms, searchTerm, activeTab, user?.id]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Jam Rooms</h1>
            <p className="text-muted-foreground">
              Find a room to join or create your own
            </p>
          </div>

          <CreateRoomModal />
        </div>

        <div className="mb-6">
          <Input
            placeholder="Search rooms by name, host, or room code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
        </div>

        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="my-rooms">My Rooms</TabsTrigger>
            <TabsTrigger value="public">Public</TabsTrigger>
            <TabsTrigger value="private">Private</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No rooms found matching your search.
                </p>
                <CreateRoomModal />
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-rooms" className="mt-6">
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  You haven't created any rooms yet.
                </p>
                <CreateRoomModal />
              </div>
            )}
          </TabsContent>

          <TabsContent value="public" className="mt-6">
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No public rooms available.
                </p>
                <CreateRoomModal />
              </div>
            )}
          </TabsContent>

          <TabsContent value="private" className="mt-6">
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No private rooms found.
                </p>
                <CreateRoomModal />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <footer className="bg-white dark:bg-gray-900 py-6 border-t">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SoundBoard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
