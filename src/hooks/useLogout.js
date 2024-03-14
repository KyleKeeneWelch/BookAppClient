import axios from "../api/axios";
import useAuth from "./useAuth";

const useLogout = () => {
  const { setAuth } = useAuth();

  // Clear the auth context and reach the logout endpoint to delete the cookie
  const logout = async () => {
    setAuth({});
    try {
      await axios.delete("/auth/logout", {
        withCredentials: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return logout;
};

export default useLogout;
