import  { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/layout/Header";
import LoginForm from "@/components/auth/LoginForm";
import { Button } from "@/components/ui/button";
import WaveformVisualizer from "@/components/ui/WaveformVisualizer";

const Index = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const showLogin = searchParams.get("login") === "true";
  const showRegister = searchParams.get("register") === "true";
  const navigate = useNavigate();
  const [showAuthForm, setShowAuthForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }

    if (showLogin || showRegister) {
      setShowAuthForm(true);
    }
  }, [isAuthenticated, navigate, showLogin, showRegister]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow">
        {showAuthForm ? (
          <div className="container py-12">
            <LoginForm defaultTab={showRegister ? "register" : "login"} />
          </div>
        ) : (
          <>
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-gray-800 py-16 md:py-24">
              <div className="container px-4 md:px-6 flex flex-col items-center text-center">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight gradient-text mb-4">
                  Jam Together, Miles Apart
                </h1>
                <p className="text-xl text-muted-foreground max-w-[700px] mb-8">
                  Record, loop, and mix with musicians around the world. Create
                  collaborative jams without complex software.
                </p>

                <div className="flex gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="bg-music-primary hover:bg-music-secondary"
                  >
                    <Link to="?register=true">Start Jamming</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline">
                    <Link to="?login=true">Login</Link>
                  </Button>
                </div>

                {/* Waveform Visual */}
                <div className="w-full max-w-4xl mt-12">
                  <WaveformVisualizer isActive={true} />
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white dark:bg-gray-900">
              <div className="container px-4 md:px-6">
                <h2 className="text-3xl font-bold text-center mb-12">
                  How It Works
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-music-primary/20 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-music-primary">
                        1
                      </span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      Create a Jam Room
                    </h3>
                    <p className="text-muted-foreground">
                      Set up a session with your preferred tempo, key, and
                      privacy settings.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-music-primary/20 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-music-primary">
                        2
                      </span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      Record Audio Loops
                    </h3>
                    <p className="text-muted-foreground">
                      Use your microphone to record up to 30-second loops. Layer
                      multiple tracks.
                    </p>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-music-primary/20 flex items-center justify-center mb-4">
                      <span className="text-2xl font-bold text-music-primary">
                        3
                      </span>
                    </div>
                    <h3 className="text-xl font-medium mb-2">
                      Mix & Collaborate
                    </h3>
                    <p className="text-muted-foreground">
                      Adjust levels, collaborate with others in real-time, and
                      export your creation.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-music-primary/10">
              <div className="container px-4 md:px-6 flex flex-col items-center text-center">
                <h2 className="text-3xl font-bold mb-4">
                  Ready to Make Music Together?
                </h2>
                <p className="text-xl text-muted-foreground max-w-[600px] mb-8">
                  Join our community of musicians and start creating
                  collaborative tracks today.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-music-primary hover:bg-music-secondary"
                >
                  <Link to="?register=true">Create Free Account</Link>
                </Button>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="bg-white dark:bg-gray-900 py-6 border-t">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SoundBoard. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-music-primary"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-music-primary"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:text-music-primary"
            >
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
