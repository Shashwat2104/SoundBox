import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumberWithSuffix } from "@/utils/formatters";

const Profile = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/?login=true");
    }
  }, [isAuthenticated, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <p>Loading profile...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">
            View and manage your music stats and account details
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* User Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-music-primary to-purple-400 flex items-center justify-center text-white text-2xl font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-medium">{user.username}</h3>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <div className="flex justify-between py-2 border-b">
                  <span>Member Since</span>
                  <span className="font-medium">May 2023</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span>Account Type</span>
                  <span className="font-medium">Standard</span>
                </div>
                <div className="flex justify-between py-2">
                  <span>Total Storage Used</span>
                  <span className="font-medium">25 MB</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle>Music Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-music-primary/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-music-primary">
                    {formatNumberWithSuffix(user.stats.roomsHosted)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Jam Rooms Hosted
                  </div>
                </div>

                <div className="bg-music-primary/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-music-primary">
                    {formatNumberWithSuffix(user.stats.loopsRecorded)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Loops Recorded
                  </div>
                </div>

                <div className="bg-music-primary/10 p-4 rounded-lg text-center">
                  <div className="text-3xl font-bold text-music-primary">
                    {formatNumberWithSuffix(user.stats.mixdownExports)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Mixdowns Exported
                  </div>
                </div>
              </div>

              <div className="bg-music-light dark:bg-music-dark/30 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Activity Summary</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  You average{" "}
                  {(
                    user.stats.loopsRecorded /
                    Math.max(1, user.stats.roomsHosted)
                  ).toFixed(1)}{" "}
                  loops per jam session.
                </p>

                <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-music-primary h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        (user.stats.loopsRecorded / 30) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-right text-muted-foreground mt-1">
                  {user.stats.loopsRecorded} of 30 loops (goals)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings/Preferences Section */}
        <Card className="mt-8">
          <CardHeader className="pb-2">
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Account settings and preferences coming soon!
            </p>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-white dark:bg-gray-900 py-6 border-t">
        <div className="container px-4 md:px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SoundBoard. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Profile;
