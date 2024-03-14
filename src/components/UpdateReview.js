import { useState, useEffect, useRef } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "./Navbar";
import Footer from "./FooterFull";
import axios from "../api/axios";
import ClipLoader from "react-spinners/ClipLoader";

const TITLE_MAX = 200;
const BODY_MAX = 5000;
const RATING_MAX = 5;

const CreateReview = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const titleRef = useRef();
  const bodyRef = useRef();
  const ratingRef = useRef();
  const errRef = useRef();
  const { reviewId } = useParams();

  const [review, setReview] = useState();

  const [book, setBook] = useState();

  const [title, setTitle] = useState("");
  const [validTitle, setValidTitle] = useState(false);
  const [titleFocus, setTitleFocus] = useState(false);

  const [body, setBody] = useState("");
  const [validBody, setValidBody] = useState(false);
  const [bodyFocus, setBodyFocus] = useState(false);

  const [rating, setRating] = useState("");
  const [validRating, setValidRating] = useState(false);
  const [ratingFocus, setRatingFocus] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  // Focus on first field when review loaded
  useEffect(() => {
    if (review) {
      titleRef.current.focus();
    }
  }, [review]);

  // Test input in real time
  useEffect(() => {
    setValidTitle(title.length <= TITLE_MAX && title.length > 0);
  }, [title]);

  useEffect(() => {
    setValidBody(body.length <= BODY_MAX && body.length > 0);
  }, [body]);

  useEffect(() => {
    setValidRating(rating <= RATING_MAX && rating > 0);
  }, [rating]);

  // Get rid of error once acknowledged
  useEffect(() => {
    setErrMsg("");
  }, [book, title, body, rating]);

  // Get review to display
  useEffect(() => {
    if (!reviewId) {
      return setErrMsg("Review ID not provided");
    }

    const REVIEW_URL = `/reviews/${reviewId}`;

    const getReview = async () => {
      try {
        const response = await axios.get(REVIEW_URL);
        setReview(response.data);
        setBook(response.data.book.title);
        setTitle(response.data.title);
        setBody(response.data.body);
        setRating(response.data.rating);
      } catch (err) {
        console.error(err);
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 404) {
          setErrMsg("Review Not Found");
        } else {
          setErrMsg("Server Error");
        }
      }
    };

    getReview();
  }, [reviewId]);

  // Navigate back to review page on cancel
  const handleCancel = () => {
    navigate(`/review/${reviewId}` || "/", { replace: true });
  };

  // Handle updating review
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If button enabled with JS hack
    const v1 = title.length <= TITLE_MAX && title.length > 0;
    const v2 = body.length <= BODY_MAX && body.length > 0;
    const v3 = rating <= RATING_MAX && rating > 0;

    if (!v1 || !v2 || !v3) {
      setErrMsg("Invalid Entry");
      return;
    }

    const UPDATE_REVIEW_URL = `/reviews/${review._id}`;

    try {
      // Update review
      await axiosPrivate.put(
        UPDATE_REVIEW_URL,
        JSON.stringify({
          book,
          title,
          body,
          rating,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      // Navigate to review page
      navigate(`/review/${review._id}`);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg(err.response?.data?.message || "Invalid Entry");
      } else if (err.response?.status === 404) {
        setErrMsg("Review does not exist");
      } else {
        navigate("/login", { state: { from: location }, replace: true });
      }
    }
  };

  return (
    <>
      <Navbar />
      <section className="updateReviewContainer">
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1>Update Review</h1>
        {review ? (
          <form onSubmit={handleSubmit}>
            <label htmlFor="book">Book</label>
            <input
              type="text"
              id="book"
              autoComplete="off"
              required
              aria-invalid="false"
              value={review.book.title}
              disabled
            />

            <label htmlFor="title">
              Title:
              <FontAwesomeIcon
                icon={faCheck}
                className={validTitle ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validTitle || !title ? "hide" : "invalid"}
              />
            </label>
            <input
              type="text"
              id="title"
              ref={titleRef}
              autoComplete="off"
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-invalid={validTitle ? "false" : "true"}
              aria-describedby="titleNote"
              onFocus={() => setTitleFocus(true)}
              onBlur={() => setTitleFocus(false)}
              value={title}
            />

            <p
              id="titleNote"
              className={
                titleFocus && title && !validTitle
                  ? "instructions"
                  : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Title is required and can have up to 200 characters.
            </p>

            <label htmlFor="body">
              Body:
              <FontAwesomeIcon
                icon={faCheck}
                className={validBody ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validBody || !body ? "hide" : "invalid"}
              />
            </label>
            <textarea
              id="body"
              ref={bodyRef}
              autoComplete="off"
              onChange={(e) => setBody(e.target.value)}
              required
              aria-invalid={validBody ? "false" : "true"}
              aria-describedby="bodyNote"
              onFocus={() => setBodyFocus(true)}
              onBlur={() => setBodyFocus(false)}
              value={body}
            ></textarea>

            <p
              id="bodyNote"
              className={
                bodyFocus && body && !validBody ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Body is required with a maximum of 5000 characters.
            </p>

            <label htmlFor="rating">
              Rating:
              <FontAwesomeIcon
                icon={faCheck}
                className={validRating ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validRating || !rating ? "hide" : "invalid"}
              />
            </label>
            <input
              type="number"
              step="0.1"
              id="rating"
              ref={ratingRef}
              autoComplete="off"
              onChange={(e) => setRating(e.target.value)}
              required
              aria-invalid={validRating ? "false" : "true"}
              aria-describedby="ratingNote"
              onFocus={() => setRatingFocus(true)}
              onBlur={() => setRatingFocus(false)}
              value={rating}
            />

            <p
              id="ratingNote"
              className={
                ratingFocus && rating && !validRating
                  ? "instructions"
                  : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Rating is required and must be between 0 and 5.
            </p>

            <div>
              <button type="button" onClick={handleCancel}>
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  !validTitle || !validBody || !validRating ? true : false
                }
              >
                Submit
              </button>
            </div>
          </form>
        ) : (
          <div className="loadingContainer">
            <ClipLoader
              color="var(--color-main)"
              loading={true}
              size={150}
              aria-label="Loading Spinner"
            />
          </div>
        )}
      </section>
      <Footer />
    </>
  );
};

export default CreateReview;
