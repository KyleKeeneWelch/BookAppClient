import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import Navbar from "./Navbar";
import Footer from "./FooterFull";
import axios from "../api/axios";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [user, setUser] = useState(null);
  const [viewRecommendations, setViewRecommendations] = useState([]);
  const [likeRecommendations, setLikeRecommendations] = useState([]);
  const [ratingRecommendations, setRatingRecommendations] = useState([]);

  const errRef = useRef();
  const [errMsg, setErrMsg] = useState("");

  // Get user
  useEffect(() => {
    const USER_URL = `/users/email/${auth?.email}`;
    let isMounted = true;
    const controller = new AbortController();

    const getUser = async () => {
      try {
        // Get user
        const response = await axios.get(USER_URL, {
          signal: controller.signal,
        });
        isMounted && setUser(response.data);
      } catch (err) {
        console.error(err);
        navigate("/login", { state: { from: location }, replace: true });
      }
    };

    getUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obtain recommendations once user is retrieved
  useEffect(() => {
    if (user != null) {
      const VIEW_URL = `/recommendations/users/${user._id}/views`;
      const LIKE_URL = `/recommendations/users/${user._id}/likes`;
      const RATING_URL = `/recommendations/users/${user._id}/ratings`;
      const CURRENT_STATE_URL = `/recommendations/users/${user._id}`;

      // Get the current state from the read model
      const getCurrentState = async () => {
        try {
          await axiosPrivate.get(CURRENT_STATE_URL, {
            withCredentials: true,
          });
          getViewRecommendations();
          getLikeRecommendations();
          getRatingRecommendations();
        } catch (err) {
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else if (err.response?.status === 400) {
            setErrMsg(err.response.data.message);
          } else if (err.response?.status === 502) {
            setErrMsg(err.response.data.message);
          } else {
            navigate("/login", { state: { from: location }, replace: true });
          }
        }
      };

      // Get view recommendations
      const getViewRecommendations = async () => {
        try {
          const response = await axiosPrivate.get(VIEW_URL, {
            withCredentials: true,
          });
          setViewRecommendations(response.data.books);
        } catch (err) {
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else if (err.response?.status === 404) {
            if (err.response.data.message === "Recommendation not found") {
              setErrMsg(err.response.data.message);
            } else if (
              err.response.data.message ===
              "Could not find books matching your profile"
            ) {
              setErrMsg(err.response.data.message);
            }
          } else {
            navigate("/login", { state: { from: location }, replace: true });
          }
        }
      };

      // Get like recommendations
      const getLikeRecommendations = async () => {
        try {
          const response = await axiosPrivate.get(LIKE_URL, {
            withCredentials: true,
          });
          setLikeRecommendations(response.data.books);
        } catch (err) {
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else if (err.response?.status === 404) {
            if (err.response.data.message === "Recommendation not found") {
              setErrMsg(err.response.data.message);
            } else if (
              err.response.data.message ===
              "Could not find books matching your profile"
            ) {
              setErrMsg(err.response.data.message);
            }
          } else {
            navigate("/login", { state: { from: location }, replace: true });
          }
        }
      };

      // Get rating recommendations
      const getRatingRecommendations = async () => {
        try {
          const response = await axiosPrivate.get(RATING_URL, {
            withCredentials: true,
          });
          setRatingRecommendations(response.data.books);
        } catch (err) {
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else if (err.response?.status === 404) {
            if (err.response.data.message === "Recommendation not found") {
              setErrMsg(err.response.data.message);
            } else if (
              err.response.data.message ===
              "Could not find books matching your profile"
            ) {
              setErrMsg(err.response.data.message);
            }
          } else {
            navigate("/login", { state: { from: location }, replace: true });
          }
        }
      };

      getCurrentState();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <>
      <Navbar />
      <section className="dashboardContainer">
        <br />
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <div>
          <h1>Welcome, {user?.username || "user"}</h1>
          <br />
          <div className="dashboardTop">
            <p>
              Welcome to the Insight Dashboard. Here you can access personalized
              recommendations based on your profile with us. Interacting with
              the site will provide more up-to-date recommendations so be sure
              to come back and try something new!
            </p>
            <div>
              <p>Have your own thoughts?</p>
              <button>
                <Link to="reviews/create">Create Review</Link>
              </button>
            </div>
          </div>
        </div>
        <br />
        <div className="recommendationContainer">
          <h2>View Recommendations</h2>
          <div>
            {viewRecommendations?.length ? (
              viewRecommendations.map((book, id) => (
                <div key={id}>
                  <Link to={`book/${book._id}`}>
                    <img src={book.thumbnail} alt="Book Thumbnail" />
                    <h3>{book.title}</h3>
                  </Link>
                </div>
              ))
            ) : (
              <p>No View Recommendations Available</p>
            )}
          </div>
        </div>
        <br />
        <div className="recommendationContainer">
          <h2>Like Recommendations</h2>
          <div>
            {likeRecommendations?.length ? (
              likeRecommendations.map((book, id) => (
                <div key={id}>
                  <Link to={`book/${book._id}`}>
                    <img src={book.thumbnail} alt="Book Thumbnail" />
                    <h3>{book.title}</h3>
                  </Link>
                </div>
              ))
            ) : (
              <p>No Like Recommendations Available</p>
            )}
          </div>
        </div>
        <br />
        <div className="recommendationContainer">
          <h2>Rating Recommendations</h2>
          <div>
            {ratingRecommendations?.length ? (
              ratingRecommendations.map((book, id) => (
                <div key={id}>
                  <Link to={`book/${book._id}`}>
                    <img src={book.thumbnail} alt="Book Thumbnail" />
                    <h3>{book.title}</h3>
                  </Link>
                </div>
              ))
            ) : (
              <p>No Rating Recommendations Available</p>
            )}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Dashboard;
