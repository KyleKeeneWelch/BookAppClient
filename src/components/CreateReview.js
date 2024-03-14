import { useState, useEffect, useRef } from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "./Navbar";
import Footer from "./FooterFull";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
const CREATE_REVIEW_URL = "/reviews";

const BOOK_MAX = 200;
const TITLE_MAX = 200;
const BODY_MAX = 5000;
const RATING_MAX = 5;

const CreateReview = () => {
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const bookRef = useRef();
  const titleRef = useRef();
  const bodyRef = useRef();
  const ratingRef = useRef();
  const errRef = useRef();

  const [book, setBook] = useState(searchParams.get("bookTitle") || "");
  const [validBook, setValidBook] = useState(false);
  const [bookFocus, setBookFocus] = useState(false);

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
  const { auth } = useAuth();

  // Focus on first field
  useEffect(() => {
    bookRef.current.focus();
  }, []);

  // Test input in real time
  useEffect(() => {
    setValidBook(book.length <= BOOK_MAX && book.length > 0);
  }, [book]);

  useEffect(() => {
    setValidTitle(title.length <= TITLE_MAX && title.length > 0);
  }, [title]);

  useEffect(() => {
    setValidBody(body.length <= BODY_MAX && body.length > 0);
  }, [body]);

  useEffect(() => {
    setValidRating(rating <= RATING_MAX && rating > 0);
  }, [rating]);

  useEffect(() => {
    setErrMsg("");
  }, [book, title, body, rating]);

  // Navigate to dashboard on cancel
  const handleCancel = () => {
    navigate("/");
  };

  // Handle creating review
  const handleSubmit = async (e) => {
    e.preventDefault();

    // If button enabled with JS hack
    const v1 = book.length <= BOOK_MAX && book.length > 0;
    const v2 = title.length <= TITLE_MAX && title.length > 0;
    const v3 = body.length <= BODY_MAX && body.length > 0;
    const v4 = rating <= RATING_MAX && rating > 0;

    if (!v1 || !v2 || !v3 || !v4) {
      setErrMsg("Invalid Entry");
      return;
    }

    try {
      // Create review
      const response1 = await axiosPrivate.post(
        CREATE_REVIEW_URL,
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
      setBook(response1.data);

      const REVIEW_URL = `/reviews/${response1.data.id}`;
      const USER_URL = `/users/email/${auth.email}`;

      // Get review (for the book id)
      const response2 = await axios.get(REVIEW_URL);

      // Get user
      const response3 = await axios.get(USER_URL);

      if (response2.data && response3.data) {
        const RATE_BOOK_URL = `/recommendations/users/${response3.data._id}/rate-book`;

        // Post rate book event
        await axiosPrivate.post(
          RATE_BOOK_URL,
          {
            isbn: response2.data.book.isbn,
            categories: response2.data.book.categories,
            rating: response2.data.rating,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      }

      // Navigate to created review
      navigate(`/review/${response1?.data?.id}`);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg(err.response?.data?.message || "Invalid Entry");
      } else if (err.response?.status === 404) {
        setErrMsg("Book does not exist");
      } else {
        navigate("/login", { state: { from: location }, replace: true });
      }
    }
  };

  return (
    <>
      <Navbar />
      <section className="createReviewContainer">
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1>Create Review</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="book">
              Book:
              <FontAwesomeIcon
                icon={faCheck}
                className={validBook ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validBook || !book ? "hide" : "invalid"}
              />
            </label>
            <input
              type="text"
              id="book"
              ref={bookRef}
              autoComplete="off"
              onChange={(e) => setBook(e.target.value)}
              required
              aria-invalid={validBook ? "false" : "true"}
              aria-describedby="bookNote"
              onFocus={() => setBookFocus(true)}
              onBlur={() => setBookFocus(false)}
              value={book || ""}
            />
            <p
              id="bookNote"
              className={
                bookFocus && book && !validBook ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Enter a valid book title to base this review on.
              <br />
              Book must be less than 200 characters.
            </p>
          </div>

          <div>
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
          </div>

          <div>
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
            <br />
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
          </div>

          <div>
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
          </div>

          <div>
            <button type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                !validBook || !validTitle || !validBody || !validRating
                  ? true
                  : false
              }
            >
              Submit
            </button>
          </div>
        </form>
      </section>
      <Footer />
    </>
  );
};

export default CreateReview;
