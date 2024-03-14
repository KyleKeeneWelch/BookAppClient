import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import useRefreshToken from "../hooks/useRefreshToken";
import useAuth from "../hooks/useAuth";
import ClipLoader from "react-spinners/ClipLoader";

const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { auth, persist } = useAuth();

  // Obtain access token when required and persist enabled
  useEffect(() => {
    let isMounted = true;
    const verifyRefreshToken = async () => {
      try {
        // Get access token
        await refresh();
      } catch (err) {
        console.error(err);
      } finally {
        // Not loading when finished getting new token
        isMounted && setIsLoading(false);
      }
    };

    // Get new token if do not currently have one and persistent login is enabled
    !auth?.accessToken && persist ? verifyRefreshToken() : setIsLoading(false);

    return () => (isMounted = false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!persist ? (
        <Outlet />
      ) : isLoading ? (
        <div className="loadingContainer">
          <ClipLoader
            color="var(--color-main)"
            loading={isLoading}
            size={150}
            aria-label="Loading Spinner"
          />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;
