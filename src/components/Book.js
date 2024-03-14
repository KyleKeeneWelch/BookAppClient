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

  // Get book to display
  useEffect(() => {
    if (!bookId) {
      return setErrMsg("Book ID not provided");
    }

    const BOOK_URL = `/books/${bookId}`;
    const USER_URL = `/users/email/${auth.email}`;

    const getBook = async () => {
      try {
        // Get book and assign to state
        const response1 = await axios.get(BOOK_URL);
        setBook(response1.data);

        // Get user
        const response2 = await axios.get(USER_URL);

        if (response1.data && response2.data) {
          const VIEW_BOOK_URL = `/recommendations/users/${response2.data._id}/view-book`;

          // Post view book event
          await axiosPrivate.post(
            VIEW_BOOK_URL,
            {
              isbn: response1.data.isbn,
              categories: response1.data.categories,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
              withCredentials: true,
            }
          );
        }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  // Obtain whether the user likes or unlikes this book
  useEffect(() => {
    if (book) {
      const LIKE_URL = `/likes/${auth.email}/${book._id}`;
      const UNLIKE_URL = `/unlikes/${auth.email}/${book._id}`;

      const getLike = async () => {
        try {
          // Get like and set if data
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
          // Get unlike and set if data
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

  // Get paginated book reviews
  useEffect(() => {
    if (book) {
      const REVIEW_URL = `/reviews?page=${page}&limit=${LIMIT}&bookId=${bookId}`;

      const getReviews = async () => {
        try {
          // Get reviews and set whether the selection has a previous or next page
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

  // Handle like toggle
  const handleLike = async () => {
    // Changes like after rerender so checks to see if need to create and delete will be reversed while in this call.
    setLike(!like);
    const LIKE_URL = `/likes/${auth.email}/${book._id}`;
    const USER_URL = `/users/email/${auth.email}`;

    try {
      // If now like
      if (!like) {
        // Create new like
        await axiosPrivate.post(
          LIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );

        // Get user
        const response = await axios.get(USER_URL);

        const LIKE_BOOK_URL = `/recommendations/users/${response.data._id}/like-book`;

        // Post like book event
        await axiosPrivate.post(
          LIKE_BOOK_URL,
          {
            isbn: book.isbn,
            categories: book.categories,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      } else if (like) {
        // Delete like
        await axiosPrivate.delete(
          LIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );
      }
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 404) {
        setErrMsg("User not found");
      } else {
        setErrMsg("Server Error");
      }
    }
  };

  // Handle unlike toggle
  const handleUnlike = async () => {
    // Changes like after rerender so checks to see if need to create and delete will be reversed while in this call.
    setUnlike(!unlike);
    const UNLIKE_URL = `/unlikes/${auth.email}/${book._id}`;
    const USER_URL = `/users/email/${auth.email}`;

    try {
      // If now unlike
      if (!unlike) {
        // Create unlike
        await axiosPrivate.post(
          UNLIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );

        // Get user
        const response = await axios.get(USER_URL);

        const UNLIKE_BOOK_URL = `/recommendations/users/${response.data._id}/unlike-book`;

        // Post unlike book event
        await axiosPrivate.post(
          UNLIKE_BOOK_URL,
          {
            isbn: book.isbn,
            categories: book.categories,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        );
      } else if (unlike) {
        // Delete unlike
        await axiosPrivate.delete(
          UNLIKE_URL,
          {},
          {
            withCredentials: true,
          }
        );
      }
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else {
        setErrMsg("Server Error");
      }
    }
  };

  return (
    <>
      <Navbar />
      <section className="bookContainer">
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>

        {book ? (
          <div>
            <br />
            <div className="bookTop">
              <div>
                <h1>{book.title}</h1>
                <h2>{book.subTitle || ""}</h2>
              </div>
              <div>
                <div>
                  <div>
                    <button>
                      <Link to={`/reviews/create?bookTitle=${book.title}`}>
                        Create Review
                      </Link>
                    </button>
                  </div>
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
                </div>
                <h1>{book.averageRating}</h1>
              </div>
            </div>
            <br />
            <div className="bookDetails">
              <div>
                <h2>Description</h2>
                <p>
                  {book.description
                    ? book.description
                    : "No description provided"}
                </p>
              </div>
              <div>
                <h2>Book Details</h2>
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
                <h2>Reviews</h2>
                {reviews?.length ? (
                  reviews.map((review, i) => (
                    <div key={i}>
                      <div>
                        <Link to={`../review/${review._id}`}>
                          {review?.title}
                        </Link>
                      </div>
                      <div>
                        <small>
                          Created At: {convertToDateTimeMed(review.createdAt)}
                        </small>
                        <small>
                          {checkIfDatesEqual(review.createdAt, review.updatedAt)
                            ? ""
                            : `Updated At: ${convertToDateTimeMed(
                                review.updatedAt
                              )}`}
                        </small>
                      </div>
                      <p>Created by {review.user.username}</p>
                      <p>Rating: {review.rating}</p>
                      <p>{`${review.body.slice(0, 50)}...`}</p>
                    </div>
                  ))
                ) : (
                  <p>No Reviews Found</p>
                )}
              </div>
              <div>
                <p>Page {page}</p>
                <div>
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
              <img src={book.thumbnail} alt="Book Thumbnail" />
            </div>
          </div>
        ) : (
          <>
            <p>Book Not Found</p>
            <Link to="/">Return to Dashboard</Link>
          </>
        )}
      </section>
      <Footer />
    </>
  );
};

export default Book;
