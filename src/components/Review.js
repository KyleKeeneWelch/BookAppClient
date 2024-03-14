/* eslint-disable no-const-assign */
import { useEffect, useRef, useState } from "react";
import Footer from "./FooterFull";
import Navbar from "./Navbar";
import axios from "../api/axios";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { convertToDateTimeMed, checkIfDatesEqual } from "../helpers/dates";
import {
  faChevronRight,
  faChevronLeft,
  faCheck,
  faPen,
  faTrash,
  faX,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";

const Review = () => {
  const errRef = useRef();
  const createCommentRef = useRef();
  const updateCommentRef = useRef();

  const [createComment, setCreateComment] = useState("");
  const [validCreateComment, setValidCreateComment] = useState(false);
  const [createCommentFocus, setCreateCommentFocus] = useState(false);

  const [updateComment, setUpdateComment] = useState("");
  const [validUpdateComment, setValidUpdateComment] = useState(false);
  const [updateCommentFocus, setUpdateCommentFocus] = useState(false);

  const [showCreateComment, setShowCreateComment] = useState(false);
  const [showDeleteReview, setShowDeleteReview] = useState(false);
  const [showUpdateComment, setShowUpdateComment] = useState("");
  const [showDeleteComment, setShowDeleteComment] = useState("");
  const [commentsChange, setCommentsChange] = useState(false);

  const [errMsg, setErrMsg] = useState("");

  const { reviewId } = useParams();
  const [review, setReview] = useState();
  const [comments, setComments] = useState();
  const [page, setPage] = useState(1);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(true);
  const LIMIT = 10;
  const COMMENT_MAX = 500;
  const axiosPrivate = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();

  // Test input in real time
  useEffect(() => {
    setValidCreateComment(
      createComment.length <= COMMENT_MAX && createComment.length > 0
    );
  }, [createComment]);

  useEffect(() => {
    setValidUpdateComment(
      updateComment.length <= COMMENT_MAX && updateComment.length > 0
    );
  }, [updateComment]);

  // Get rid of error when acknowledged
  useEffect(() => {
    setErrMsg("");
  }, [createComment, updateComment]);

  // Get review to display
  useEffect(() => {
    if (!reviewId) {
      return setErrMsg("Review ID not provided");
    }

    const REVIEW_URL = `/reviews/${reviewId}`;

    const getReview = async () => {
      try {
        // Get review
        const response = await axios.get(REVIEW_URL);
        setReview(response.data);
      } catch (err) {
        console.error(err);
        if (!err?.response) {
          setErrMsg("No Server Response");
        } else if (err.response?.status === 404) {
          setErrMsg("Review Not Found");
        }
      }
    };

    getReview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get paginated comments to display
  useEffect(() => {
    if (review) {
      const COMMENT_URL = `/reviews/${review._id}/comments?page=${page}&limit=${LIMIT}`;

      const getComments = async () => {
        try {
          // Get comments and assign whether selection has previous and next page
          const response = await axios.get(COMMENT_URL);
          response.data?.previous
            ? setHasPrevious(true)
            : setHasPrevious(false);
          response.data?.next ? setHasNext(true) : setHasNext(false);
          setComments(response.data.results);
        } catch (err) {
          console.error(err);
          if (!err?.response) {
            setErrMsg("No Server Response");
          } else {
            setErrMsg("Server Error");
          }
        }
      };

      getComments();
    }
  }, [review, page, commentsChange]);

  // Handle creating comment
  const handleCreateComment = async (e) => {
    e.preventDefault();

    const v1 = createComment.length <= COMMENT_MAX && createComment.length > 0;

    if (!v1) {
      setErrMsg("Invalid Entry");
      return;
    }

    try {
      const CREATE_COMMENT_URL = `/reviews/${review._id}/comments`;

      // Create comment
      await axiosPrivate.post(
        CREATE_COMMENT_URL,
        JSON.stringify({
          body: createComment,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setCreateComment("");
      setShowCreateComment(false);
      setCommentsChange(!commentsChange);
    } catch (err) {
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg(err.response?.data?.message || "Invalid Entry");
      } else {
        navigate("/login", { state: { from: location }, replace: true });
      }
    }
  };

  // Handle update comment
  const handleUpdateComment = async (e) => {
    e.preventDefault();

    const v1 = updateComment.length <= COMMENT_MAX && updateComment.length > 0;

    if (!v1) {
      setErrMsg("Invalid Entry");
      return;
    }

    try {
      // Each comment assigned id as it is unknown which mapped comment needs to be updated
      const UPDATE_COMMENT_URL = `/reviews/${
        review._id
      }/comments/${e.target.getAttribute("data-comment-id")}`;

      // Update comment
      await axiosPrivate.put(
        UPDATE_COMMENT_URL,
        JSON.stringify({
          body: updateComment,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );
      setUpdateComment("");
      setShowUpdateComment("");
      setCommentsChange(!commentsChange);
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 400) {
        setErrMsg(err.response?.data?.message || "Invalid Entry");
      } else {
        navigate("/login", { state: { from: location }, replace: true });
      }
    }
  };

  // Handle delete comment
  const handleDeleteComment = async (e) => {
    e.preventDefault();

    try {
      const DELETE_COMMENT_URL = `/reviews/${review._id}/comments/${showDeleteComment}`;

      // Delete comment
      await axiosPrivate.delete(DELETE_COMMENT_URL, {
        withCredentials: true,
      });
      setShowDeleteComment("");
      setCommentsChange(!commentsChange);
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 404) {
        setErrMsg(err.response?.data?.message || "Invalid Entry");
      } else {
        navigate("/login", { state: { from: location }, replace: true });
      }
    }
  };

  // Handle delete review
  const handleDeleteReview = async (e) => {
    e.preventDefault();

    try {
      const DELETE_REVIEW_URL = `/reviews/${review._id}`;

      // Delete review
      await axiosPrivate.delete(DELETE_REVIEW_URL, {
        withCredentials: true,
      });
      // Navigate to dashboard
      navigate("/");
    } catch (err) {
      console.error(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.response?.status === 404) {
        setErrMsg(err.response?.data?.message || "Invalid Entry");
      } else {
        navigate("/login", { state: { from: location }, replace: true });
      }
    }
  };

  return (
    <>
      <Navbar />
      <section className="reviewContainer">
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>

        {review ? (
          <div>
            <br />
            <div className="reviewTop">
              <div>
                <div>
                  <h1>{review.title}</h1>
                  <h1>{review.rating}</h1>
                </div>
                <div>
                  <p>Created by: {review.user.username}</p>
                </div>
                <div>
                  <small>
                    Created At: {convertToDateTimeMed(review.createdAt)}
                  </small>
                  <small>
                    {checkIfDatesEqual(review.createdAt, review.updatedAt)
                      ? ""
                      : `Updated At: ${convertToDateTimeMed(review.updatedAt)}`}
                  </small>
                </div>
                {review.user.email === auth.email && (
                  <div>
                    <button>
                      <Link to={`/review/${review._id}/update`}>
                        Update Review
                      </Link>
                    </button>
                    <button onClick={() => setShowDeleteReview(true)}>
                      Delete Review
                    </button>
                  </div>
                )}
              </div>
              <div>
                <div>
                  <img src={review.book.thumbnail} alt="Book Thumbnail" />
                  <h3>{review.book.title}</h3>
                </div>
              </div>
            </div>
            <br />
            <div className="reviewBody">
              <p>{review.body}</p>
            </div>
            <br />
            <div className="reviewComments">
              <div>
                <h2>Comments</h2>
                <button
                  onClick={() => setShowCreateComment(!showCreateComment)}
                >
                  {showCreateComment ? "Cancel" : "Create Comment"}
                </button>
              </div>
              <div className={!showCreateComment ? "offscreen" : undefined}>
                <form onSubmit={handleCreateComment}>
                  <input
                    type="text"
                    id="createComment"
                    ref={createCommentRef}
                    autoComplete="off"
                    onChange={(e) => setCreateComment(e.target.value)}
                    required
                    aria-invalid={validCreateComment ? "false" : "true"}
                    aria-describedby="createCommentNote"
                    onFocus={() => setCreateCommentFocus(true)}
                    onBlur={() => setCreateCommentFocus(false)}
                  />
                  <p
                    id="createCommentNote"
                    className={
                      createCommentFocus && createComment && !validCreateComment
                        ? "instructions"
                        : "offscreen"
                    }
                  >
                    Comment is required and can have up to 500 characters.
                  </p>
                  <button
                    type="submit"
                    disabled={!validCreateComment ? true : false}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </form>
              </div>
              <div>
                {comments?.length > 0 ? (
                  comments.map((comment, i) => (
                    <div key={i}>
                      {showUpdateComment === comment._id ? (
                        <>
                          <p>{comment.user.username}</p>
                          <br />
                          <form
                            onSubmit={handleUpdateComment}
                            data-comment-id={comment._id}
                          >
                            <input
                              type="text"
                              id="updateComment"
                              ref={updateCommentRef}
                              autoComplete="off"
                              onChange={(e) => setUpdateComment(e.target.value)}
                              required
                              aria-invalid={
                                validUpdateComment ? "false" : "true"
                              }
                              aria-describedby="updateCommentNote"
                              onFocus={() => setUpdateCommentFocus(true)}
                              onBlur={() => setUpdateCommentFocus(false)}
                              value={updateComment}
                            />
                            <p
                              id="updateCommentNote"
                              className={
                                updateCommentFocus &&
                                updateComment &&
                                !validUpdateComment
                                  ? "instructions"
                                  : "offscreen"
                              }
                            >
                              Comment is required and can have up to 500
                              characters.
                            </p>
                            <button
                              type="button"
                              onClick={() => setShowUpdateComment(false)}
                            >
                              <FontAwesomeIcon icon={faX} />
                            </button>
                            <button
                              type="submit"
                              disabled={!validUpdateComment ? true : false}
                            >
                              <FontAwesomeIcon icon={faCheck} />
                            </button>
                          </form>
                        </>
                      ) : (
                        <>
                          <div>
                            <div>
                              <p>{comment.user.username}</p>
                              {comment.user.email === auth.email && (
                                <div>
                                  <button
                                    onClick={() => {
                                      setShowUpdateComment(comment._id);
                                      setUpdateComment(comment.body);
                                    }}
                                  >
                                    <FontAwesomeIcon icon={faPen} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setShowDeleteComment(comment._id)
                                    }
                                  >
                                    <FontAwesomeIcon icon={faTrash} />
                                  </button>
                                </div>
                              )}
                            </div>
                            <div>
                              <small>
                                Created At:{" "}
                                {convertToDateTimeMed(comment.createdAt)}
                              </small>
                              <small>
                                {checkIfDatesEqual(
                                  comment.createdAt,
                                  comment.updatedAt
                                )
                                  ? ""
                                  : `Updated At: ${convertToDateTimeMed(
                                      comment.updatedAt
                                    )}`}
                              </small>
                            </div>
                          </div>
                          <br />
                          <div>
                            <p>{comment.body}</p>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p>No comments available. Be the first to the discussion.</p>
                )}
              </div>
              <div>
                <br />
                <p>Page {page}</p>
                <br />
                <div>
                  {hasPrevious && (
                    <button onClick={() => setPage(page - 1)}>
                      <FontAwesomeIcon icon={faChevronLeft} />
                    </button>
                  )}
                  {hasNext && comments?.length > 0 && (
                    <button onClick={() => setPage(page + 1)}>
                      <FontAwesomeIcon icon={faChevronRight} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p>No Review to display</p>
        )}
        {showDeleteComment && (
          <>
            <div
              className="backdrop"
              onClick={() => setShowDeleteComment(false)}
            ></div>
            <div className="deleteModal">
              <form onSubmit={handleDeleteComment}>
                <h2>Are you sure you want to delete this comment?</h2>
                <br />
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteComment("")}
                  >
                    Cancel
                  </button>
                  <button type="submit">Delete</button>
                </div>
              </form>
            </div>
          </>
        )}
        {showDeleteReview && (
          <>
            <div
              className="backdrop"
              onClick={() => setShowDeleteReview(false)}
            ></div>
            <div className="deleteModal">
              <form onSubmit={handleDeleteReview}>
                <h2>Are you sure you want to delete this review?</h2>
                <br />
                <div>
                  <button
                    type="button"
                    onClick={() => setShowDeleteReview(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit">Delete</button>
                </div>
              </form>
            </div>
          </>
        )}
      </section>
      <Footer />
    </>
  );
};

export default Review;
