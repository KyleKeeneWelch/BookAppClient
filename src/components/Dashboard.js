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

  useEffect(() => {
    const USER_URL = `/users/email/${auth?.email}`;
    let isMounted = true;
    const controller = new AbortController();

    const getUser = async () => {
      try {
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

  useEffect(() => {
    if (user != null) {
      const VIEW_URL = `/recommendations/users/${user._id}/views`;
      const LIKE_URL = `/recommendations/users/${user._id}/likes`;
      const RATING_URL = `/recommendations/users/${user._id}/ratings`;

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

      getViewRecommendations();
      getLikeRecommendations();
      getRatingRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <section>
      <Navbar />
      <div>
        <h1>Welcome, {user?.username || "user"}</h1>
      </div>
      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>

      <div>
        <div>
          <h2>View Recommendations</h2>
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

        <div>
          <h2>Like Recommendations</h2>
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

        <div>
          <h2>Rating Recommendations</h2>
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

      <Link to="reviews/create">Create Review</Link>
      <Footer />
    </section>
  );
};

export default Dashboard;
