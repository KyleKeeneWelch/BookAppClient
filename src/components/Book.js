import Navbar from "./Navbar";
import Footer from "./FooterFull";
import { Link, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  faChevronRight,
  faChevronLeft,
  faThumbsUp as solidThumbsUp,
  faThumbsDown as solidThumbsDown,
} from "@fortawesome/free-solid-svg-icons";
import {
  faThumbsUp as regularThumbsUp,
  faThumbsDown as regularThumbsDown,
} from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "../api/axios";
import { convertToDateTimeMed, checkIfDatesEqual } from "../helpers/dates";
import useAuth from "../hooks/useAuth";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const Book = () => {
  const { bookId } = useParams();
  const [book, setBook] = useState();
  const [reviews, setReviews] = useState();
  const errRef = useRef();
  const [page, setPage] = useState(1);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const [like, setLike] = useState(false);
  const [unlike, setUnlike] = useState(false);
  const LIMIT = 5;
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();

  const [errMsg, setErrMsg] = useState("");

  useEffect(() => {
    if (!bookId) {
      return setErrMsg("Book ID not provided");
    }

    const BOOK_URL = `/books/${bookId}`;

    const getBook = async () => {
      try {
        const response = await axios.get(BOOK_URL);
        setBook(response.data);
      } catch (err) {
        console.error(err);
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 404) {
          setErrMsg("No Book Found");
        } else {
          setErrMsg("Server Error");
        }
      }
    };

    getBook();
  }, [bookId]);

  useEffect(() => {
    if (book) {
      const LIKE_URL = `/likes/${auth.email}/${book._id}`;
      const UNLIKE_URL = `/unlikes/${auth.email}/${book._id}`;

      const getLike = async () => {
        try {
          const response = await axios.get(LIKE_URL);
          !response?.data?.message && setLike(true);
        } catch (err) {
          console.error(err);
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else if (err.response?.status === 404) {
            return;
          } else {
            setErrMsg("Server Error");
          }
        }
      };

      const getUnlike = async () => {
        try {
          const response = await axios.get(UNLIKE_URL);
          !response?.data?.message && setUnlike(true);
        } catch (err) {
          console.error(err);
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else if (err.response?.status === 404) {
            return;
          } else {
            setErrMsg("Server Error");
          }
        }
      };

      getLike();
      getUnlike();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book]);

  useEffect(() => {
    if (book) {
      const REVIEW_URL = `/reviews?page=${page}&limit=${LIMIT}&bookId=${bookId}`;

      const getReviews = async () => {
        try {
          const response = await axios.get(REVIEW_URL);
          response.data?.previous
            ? setHasPrevious(true)
            : setHasPrevious(false);
          response.data?.next ? setHasNext(true) : setHasNext(false);
          setReviews(response.data.results);
        } catch (err) {
          console.error(err);
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else {
            setErrMsg("Server Error");
          }
        }
      };

      getReviews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book, page]);

  const handleLike = async () => {
    // Changes like after rerender so checks to see if need to create and delete will be reversed while in this call.
    setLike(!like);
    const LIKE_URL = `/likes/${auth.email}/${book._id}`;

    if (!like) {
      try {
        await axiosPrivate.post(
          LIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error(err);
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else {
          setErrMsg("Server Error");
        }
      }
    } else if (like) {
      try {
        await axiosPrivate.delete(
          LIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error(err);
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else {
          setErrMsg("Server Error");
        }
      }
    }
  };

  const handleUnlike = async () => {
    setUnlike(!unlike);
    const UNLIKE_URL = `/unlikes/${auth.email}/${book._id}`;

    if (!unlike) {
      try {
        await axiosPrivate.post(
          UNLIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error(err);
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else {
          setErrMsg("Server Error");
        }
      }
    } else if (unlike) {
      try {
        await axiosPrivate.delete(
          UNLIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );
      } catch (err) {
        console.error(err);
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else {
          setErrMsg("Server Error");
        }
      }
    }
  };

  return (
    <section>
      <Navbar />

      <p
        ref={errRef}
        className={errMsg ? "errmsg" : "offscreen"}
        aria-live="assertive"
      >
        {errMsg}
      </p>

      {book ? (
        <div>
          <h1>{book.title}</h1>
          <h2>{book.subtitle || ""}</h2>
          <div>
            <button onClick={handleLike} disabled={unlike ? true : false}>
              {like ? (
                <FontAwesomeIcon icon={solidThumbsUp} />
              ) : (
                <FontAwesomeIcon icon={regularThumbsUp} />
              )}
            </button>
            <button onClick={handleUnlike} disabled={like ? true : false}>
              {unlike ? (
                <FontAwesomeIcon icon={solidThumbsDown} />
              ) : (
                <FontAwesomeIcon icon={regularThumbsDown} />
              )}
            </button>
            <h3>{book.averageRating}</h3>
          </div>
          <div>
            <div>
              <h3>Description</h3>
              <p>
                {book.description
                  ? book.description
                  : "No description provided"}
              </p>
            </div>

            <div>
              <h3>Book Details</h3>
              <p>ISBN: {book.isbn}</p>
              <p>
                Author(s): {book.authors[0]}
                {book.authors[1] && `, ${book.authors[1]}`}
              </p>
              <p>
                Categories: {book.categories[0]}
                {book.categories[1] && `, ${book.categories[1]}`}
              </p>
              <p>Published Year: {book.publishedYear}</p>
              <p>Number of Pages: {book.numPages}</p>
            </div>
            <div>
              <Link to={`/reviews/create?bookTitle=${book.title}`}>
                Create Review
              </Link>
            </div>
            <div>
              <img src={book.thumbnail} alt="Book Thumbnail" />
            </div>
          </div>
          <div>
            <h1>Reviews</h1>
            {reviews?.length ? (
              reviews.map((review, i) => (
                <div key={i}>
                  <Link to={`../review/${review._id}`}>{review?.title}</Link>
                  <p>{review.user.username}</p>
                  <p>{review.rating}</p>
                  <p>Created At: {convertToDateTimeMed(review.createdAt)}</p>
                  <p>
                    {checkIfDatesEqual(review.createdAt, review.updatedAt)
                      ? ""
                      : `Updated At: ${convertToDateTimeMed(review.updatedAt)}`}
                  </p>
                  <p>{`${review.body.slice(0, 50)}...`}</p>
                </div>
              ))
            ) : (
              <p>No Reviews Found</p>
            )}

            {hasPrevious && (
              <button onClick={() => setPage(page - 1)}>
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
            )}
            {hasNext && reviews?.length > 0 && (
              <button onClick={() => setPage(page + 1)}>
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <p>Book Not Found</p>
          <Link to="/">Return to Dashboard</Link>
        </>
      )}

      <Footer />
    </section>
  );
};

export default Book;
