import axios from "../api/axios";
import useAuth from "./useAuth";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  // Obtain access token form refresh endpoint which checks for a refresh cookie
  const refresh = async () => {
    const response = await axios.get("/auth/refresh", {
      withCredentials: true,
    });
    // Set auth context to include the new access token and email
    setAuth((prev) => {
      return {
        ...prev,
        email: response.data.email,
        accessToken: response.data.accessToken,
      };
    });
    return response.data.accessToken;
  };

  return refresh;
};

export default useRefreshToken;
