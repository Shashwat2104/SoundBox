import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="w-full py-4 px-4 md:px-6 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-music-primary to-purple-400 flex items-center justify-center">
            <span className="text-white font-bold text-lg">SB</span>
          </div>
          <span className="text-xl font-bold gradient-text">SoundBoard</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className="text-foreground hover:text-music-primary transition-colors"
          >
            Home
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                className="text-foreground hover:text-music-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/profile"
                className="text-foreground hover:text-music-primary transition-colors"
              >
                Profile
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <div className="w-6 h-6 rounded-full bg-music-primary flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user?.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden md:inline">{user?.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link to="/?login=true">Login</Link>
              </Button>
              <Button
                asChild
                className="bg-music-primary hover:bg-music-secondary"
              >
                <Link to="/?register=true">Sign Up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
