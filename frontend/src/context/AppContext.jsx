import { createContext, useContext, useEffect, useState } from "react";
import baseAxios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// Create a custom axios instance
const axiosInstance = baseAxios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

// Add a request interceptor to include the token automatically
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [input, setInput] = useState("");

  // Fetch all blogs (optional utility)
  const fetchBlogs = async () => {
    try {
      const { data } = await axiosInstance.get("/api/blog/all");
      data.success ? setBlogs(data.blogs) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Load token on startup
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
    fetchBlogs();
  }, []);

  const value = {
    axios: axiosInstance,
    navigate,
    token,
    setToken,
    blogs,
    setBlogs,
    input,
    setInput,
    fetchBlogs,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use app-wide context
export const useAppContext = () => useContext(AppContext);
