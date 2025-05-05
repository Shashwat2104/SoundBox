import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

type User = {
  id: string;
  username: string;
  email: string;
  stats: {
    roomsHosted: number;
    loopsRecorded: number;
    mixdownExports: number;
  };
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Mock user data - in real app, this would come from a backend
const MOCK_USERS = [
  {
    id: "1",
    username: "demo",
    email: "demo@example.com",
    password: "password",
    stats: {
      roomsHosted: 5,
      loopsRecorded: 23,
      mixdownExports: 3,
    },
  },
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved session
    const savedUser = localStorage.getItem("soundboard_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("soundboard_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    const foundUser = MOCK_USERS.find(
      (u) =>
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem(
        "soundboard_user",
        JSON.stringify(userWithoutPassword)
      );
      toast({
        title: "Login successful!",
        description: `Welcome back, ${foundUser.username}!`,
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  // In the register function, remove the password from the destructuring:
  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
  
    // Simulate API request delay
    await new Promise((resolve) => setTimeout(resolve, 800));
  
    // Check if user already exists
    const userExists = MOCK_USERS.some(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );
  
    if (userExists) {
      toast({
        title: "Registration failed",
        description: "This email is already registered",
        variant: "destructive",
      });
    } else {
      // In a real app, this would create a user in the database
      const newUser = {
        id: Date.now().toString(),
        username,
        email,
        stats: {
          roomsHosted: 0,
          loopsRecorded: 0,
          mixdownExports: 0,
        },
      };
  
      setUser(newUser);
      localStorage.setItem("soundboard_user", JSON.stringify(newUser));
      toast({
        title: "Registration successful!",
        description: `Welcome to SoundBoard, ${username}!`,
      });
      navigate("/dashboard");
    }
  
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("soundboard_user");
    navigate("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
