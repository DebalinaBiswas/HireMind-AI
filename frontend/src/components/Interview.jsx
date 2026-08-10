import { useEffect, useState } from "react";
import API from "../services/api";
import "./Interview.css";

function Interview({ candidateId, role, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);

  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [error, setError] = useState("");
  const [evaluation, setEvaluation] = useState(null);

  const [completed, setCompleted] = useState(false);
  const [report, setReport] = useState(null);
  const [loadingReport, setLoadingReport] = useState(false);

  /*
   * ============================================================
   * GENERATE / FETCH QUESTIONS
   * ============================================================
   */

  useEffect(() => {
    generateQuestions();
  }, [candidateId, role]);

  const generateQuestions = async () => {
    try {
      setLoadingQuestions(true);
      setError("");

      console.log(
        "Fetching generated questions for candidate:",
        candidateId
      );

      const response = await API.get(
        `/api/v1/candidate/${candidateId}/questions`
      );

      console.log(
        "GENERATED QUESTIONS RESPONSE:",
        response.data
      );

      let generatedQuestions =
        response.data?.questions || [];

      /*
       * Backend must return an array.
       */

      if (!Array.isArray(generatedQuestions)) {
        throw new Error(
          "Invalid question data received from the backend."
        );
      }

      /*
       * ========================================================
       * NORMALIZE BACKEND QUESTIONS
       * ========================================================
       */

      generatedQuestions = generatedQuestions.map(
        (question, index) => ({
          id:
            question.id ??
            question.question_id ??
            question.questionId ??
            null,

          question:
            question.question ??
            question.text ??
            question.question_text ??
            "",

          topic:
            question.topic ??
            question.category ??
            "Technical",

          difficulty:
            question.difficulty ??
            "Medium",
        })
      );

      console.log(
        "QUESTIONS USED BY INTERVIEW:",
        generatedQuestions
      );

      /*
       * ========================================================
       * VALIDATE QUESTIONS
       * ========================================================
       *
       * IMPORTANT:
       * We DO NOT expect exactly 10 questions.
       *
       * Any number of valid questions is accepted.
       */

      if (generatedQuestions.length === 0) {
        throw new Error(
          "No interview questions were generated for this candidate."
        );
      }

      /*
       * Validate question text.
       */

      const invalidQuestion =
        generatedQuestions.find(
          (question) =>
            !question.question ||
            !question.question.trim()
        );

      if (invalidQuestion) {
        console.error(
          "Invalid question:",
          invalidQuestion
        );

        throw new Error(
          "One or more generated questions are invalid."
        );
      }

      /*
       * Validate question IDs.
       *
       * Do not invent database IDs on frontend.
       */

      const questionWithoutId =
        generatedQuestions.find(
          (question) => !question.id
        );

      if (questionWithoutId) {
        console.error(
          "Question without ID:",
          questionWithoutId
        );

        throw new Error(
          "One or more interview questions are missing a valid question ID."
        );
      }

      /*
       * ========================================================
       * STORE QUESTIONS
       * ========================================================
       */

      setQuestions(generatedQuestions);

      setQuestionIndex(0);
      setAnswer("");
      setSubmitted(false);
      setEvaluation(null);
      setCompleted(false);
      setReport(null);
      setError("");

    } catch (err) {
      console.error(
        "QUESTION FETCH ERROR:",
        err
      );

      const message =
        err.response?.data?.detail ||
        err.message ||
        "Unable to load your interview questions.";

      setError(
        Array.isArray(message)
          ? message[0]?.msg ||
              "Unable to load interview questions."
          : message
      );

    } finally {
      setLoadingQuestions(false);
    }
  };

  /*
   * ============================================================
   * CURRENT QUESTION
   * ============================================================
   */

  const currentQuestion =
    questions[questionIndex];

  /*
   * ============================================================
   * PROGRESS
   * ============================================================
   *
   * This is completely dynamic.
   *
   * Example:
   *
   * 6 questions:
   * 1/6 → 2/6 → ... → 6/6
   *
   * 10 questions:
   * 1/10 → 2/10 → ... → 10/10
   *
   * 15 questions:
   * 1/15 → 2/15 → ... → 15/15
   */

  const totalQuestions =
    questions.length;

  const currentQuestionNumber =
    questionIndex + 1;

  const progress =
    totalQuestions > 0
      ? (currentQuestionNumber /
          totalQuestions) *
        100
      : 0;

  /*
   * ============================================================
   * SUBMIT ANSWER
   * ============================================================
   */

  const handleSubmit = async () => {
    if (!answer.trim()) {
      return;
    }

    if (!currentQuestion?.id) {
      setError(
        "This question does not have a valid question ID."
      );
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setEvaluation(null);

      console.log(
        "Submitting answer:",
        {
          candidate_id: candidateId,
          question_id: currentQuestion.id,
          answer: answer.trim(),
        }
      );

      const response = await API.post(
        "/api/v1/interview/evaluate",
        {
          candidate_id: candidateId,
          question_id: currentQuestion.id,
          answer: answer.trim(),
        }
      );

      console.log(
        "ANSWER EVALUATION RESPONSE:",
        response.data
      );

      setEvaluation(response.data);
      setSubmitted(true);

    } catch (err) {
      console.error(
        "ANSWER EVALUATION ERROR:",
        err
      );

      const message =
        err.response?.data?.detail ||
        "Unable to evaluate your answer. Please try again.";

      setError(
        Array.isArray(message)
          ? message[0]?.msg ||
              "Invalid answer data."
          : message
      );

    } finally {
      setSubmitting(false);
    }
  };

  /*
   * ============================================================
   * NEXT QUESTION / FINISH
   * ============================================================
   */

  const handleNext = async () => {
    /*
     * Safety check.
     */

    if (!currentQuestion) {
      setError(
        "Unable to determine the current interview question."
      );
      return;
    }

    /*
     * ========================================================
     * LAST QUESTION
     * ========================================================
     *
     * If current question is the final question:
     *
     * 6/6 → Finish
     * 10/10 → Finish
     * 15/15 → Finish
     */

    if (
      questionIndex ===
      questions.length - 1
    ) {
      await finishInterview();
      return;
    }

    /*
     * ========================================================
     * MOVE TO NEXT QUESTION
     * ========================================================
     */

    setQuestionIndex(
      (prev) => prev + 1
    );

    setAnswer("");
    setSubmitted(false);
    setEvaluation(null);
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /*
   * ============================================================
   * FINISH INTERVIEW
   * ============================================================
   *
   * Called after the LAST answer has been evaluated.
   *
   * Example:
   *
   * 6/6
   * ↓
   * Finish interview
   * ↓
   * GET /report/{candidateId}
   * ↓
   * Completion screen
   * ↓
   * View results
   */

  const finishInterview = async () => {
    try {
      setLoadingReport(true);
      setError("");

      console.log(
        "Interview completed."
      );

      console.log(
        "Fetching final report for candidate:",
        candidateId
      );

      const response = await API.get(
        `/api/v1/report/${candidateId}`
      );

      console.log(
        "FINAL REPORT:",
        response.data
      );

      /*
       * Store report.
       */

      setReport(response.data);

      /*
       * Show completion screen.
       */

      setCompleted(true);

    } catch (err) {
      console.error(
        "REPORT GENERATION ERROR:",
        err
      );

      const message =
        err.response?.data?.detail ||
        "Your interview is complete, but the evaluation report could not be generated yet.";

      /*
       * We still show completion screen so the
       * candidate knows the interview is finished.
       */

      setError(
        Array.isArray(message)
          ? message[0]?.msg ||
              "Unable to generate report."
          : message
      );

      setCompleted(true);

    } finally {
      setLoadingReport(false);
    }
  };

  /*
   * ============================================================
   * LOADING QUESTIONS SCREEN
   * ============================================================
   */

  if (loadingQuestions) {
    return (
      <div className="interview-page">

        <header className="interview-navbar">

          <div className="interview-brand">

            <span className="brand-main">
              HireMind
            </span>

            <span className="brand-ai">
              AI
            </span>

          </div>

          <div className="interview-nav-right">

            <div className="live-status">

              <span className="live-dot"></span>

              Preparing interview

            </div>

          </div>

        </header>

        <main className="interview-loading">

          <div className="loading-card">

            <div className="loading-spinner"></div>

            <div className="interview-eyebrow">

              <span></span>

              AI INTERVIEW

            </div>

            <h1>
              Preparing your interview...
            </h1>

            <p>
              HireMind AI is generating
              role-specific questions based on
              your candidate profile.
            </p>

            <div className="loading-role">

              <span>
                Target role
              </span>

              <strong>
                {role}
              </strong>

            </div>

          </div>

        </main>

      </div>
    );
  }

  /*
   * ============================================================
   * QUESTION ERROR SCREEN
   * ============================================================
   */

  if (
    error &&
    questions.length === 0
  ) {
    return (
      <div className="interview-page">

        <header className="interview-navbar">

          <div className="interview-brand">

            <span className="brand-main">
              HireMind
            </span>

            <span className="brand-ai">
              AI
            </span>

          </div>

        </header>

        <main className="interview-loading">

          <div className="loading-card error-card">

            <div className="error-icon">
              !
            </div>

            <div className="interview-eyebrow">

              <span></span>

              INTERVIEW ERROR

            </div>

            <h1>
              We couldn't prepare your interview.
            </h1>

            <p>
              {error}
            </p>

            <button
              className="submit-answer-button"
              onClick={generateQuestions}
            >
              Try again
              <span>→</span>
            </button>

          </div>

        </main>

      </div>
    );
  }

  /*
   * ============================================================
   * COMPLETED SCREEN
   * ============================================================
   */

  if (completed) {
    return (
      <div className="interview-page completed-page">

        <header className="interview-navbar">

          <div className="interview-brand">

            <span className="brand-main">
              HireMind
            </span>

            <span className="brand-ai">
              AI
            </span>

          </div>

          <div className="interview-nav-right">

            <div className="live-status">

              <span className="live-dot"></span>

              Interview completed

            </div>

          </div>

        </header>

        <main className="completion-container">

          {/* COMPLETION ICON */}

          <div className="completion-icon">
            ✓
          </div>

          {/* EYEBROW */}

          <div className="completion-eyebrow">
            INTERVIEW COMPLETED
          </div>

          {/* TITLE */}

          <h1>

            Great work.

            <br />

            <span>
              Your interview is complete.
            </span>

          </h1>

          {/* DESCRIPTION */}

          <p className="completion-description">

            You've completed your technical
            interview for the{" "}

            <strong>
              {role}
            </strong>{" "}

            position.

            Your responses have been recorded
            and evaluated.

          </p>

          {/* SUMMARY CARD */}

          <div className="completion-card">

            <div className="completion-item">

              <span>
                CANDIDATE
              </span>

              <strong>
                #{candidateId}
              </strong>

            </div>

            <div className="completion-divider"></div>

            <div className="completion-item">

              <span>
                TARGET ROLE
              </span>

              <strong>
                {role}
              </strong>

            </div>

            <div className="completion-divider"></div>

            <div className="completion-item">

              <span>
                QUESTIONS
              </span>

              <strong>
                {questions.length} / {questions.length}
              </strong>

            </div>

          </div>

          {/* REPORT STATUS */}

          <div className="evaluation-notice">

            <div className="evaluation-notice-icon">
              ◈
            </div>

            <div>

              <strong>
                AI evaluation complete
              </strong>

              <p>
                Your answers have been recorded
                and your interview evaluation is
                ready to view.
              </p>

            </div>

          </div>

          {/* REPORT ERROR */}

          {error && (
            <div className="error-message completion-error">

              <span>
                !
              </span>

              {error}

            </div>
          )}

          {/* ==================================================
              VIEW RESULTS
              ================================================== */}

          {report ? (

            <button
              className="submit-answer-button completion-button"
              onClick={() => {

                if (onFinish) {
                  onFinish(report);
                }

              }}
            >

              View results

              <span>
                →
              </span>

            </button>

          ) : (

            /*
             * If report generation failed,
             * allow the user to retry.
             */

            <button
              className="submit-answer-button completion-button"
              onClick={finishInterview}
              disabled={loadingReport}
            >

              {loadingReport ? (

                <>

                  <span className="button-spinner"></span>

                  Generating results...

                </>

              ) : (

                <>

                  Generate results

                  <span>
                    →
                  </span>

                </>

              )}

            </button>

          )}

        </main>

      </div>
    );
  }

  /*
   * ============================================================
   * SAFETY CHECK
   * ============================================================
   */

  if (!currentQuestion) {
    return (
      <div className="interview-page">

        <main className="interview-loading">

          <div className="loading-card error-card">

            <div className="error-icon">
              !
            </div>

            <h1>
              Interview question unavailable
            </h1>

            <p>
              We could not load the current
              interview question.
            </p>

            <button
              className="submit-answer-button"
              onClick={generateQuestions}
            >
              Reload interview
              <span>→</span>
            </button>

          </div>

        </main>

      </div>
    );
  }

  /*
   * ============================================================
   * MAIN INTERVIEW SCREEN
   * ============================================================
   */

  return (
    <div className="interview-page">

      {/* ======================================================
          NAVBAR
          ====================================================== */}

      <header className="interview-navbar">

        <div className="interview-brand">

          <span className="brand-main">
            HireMind
          </span>

          <span className="brand-ai">
            AI
          </span>

        </div>

        <div className="interview-nav-right">

          <div className="live-status">

            <span className="live-dot"></span>

            Interview in progress

          </div>

        </div>

      </header>

      {/* ======================================================
          PROGRESS STEPS
          ====================================================== */}

      <div className="interview-progress-wrapper">

        <div className="progress-container">

          <div className="progress-step active">

            <span className="progress-number">
              01
            </span>

            Candidate

          </div>

          <div className="progress-line active"></div>

          <div className="progress-step active">

            <span className="progress-number">
              02
            </span>

            Interview

          </div>

          <div className="progress-line"></div>

          <div className="progress-step">

            <span className="progress-number">
              03
            </span>

            Results

          </div>

        </div>

      </div>

      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main className="interview-container">

        {/* HEADER */}

        <section className="interview-header">

          <div>

            <div className="interview-eyebrow">

              <span></span>

              TECHNICAL INTERVIEW

            </div>

            <h1>

              Let's see how you

              <span>
                {" "}think.
              </span>

            </h1>

            <p>

              Answer each question clearly and
              explain your reasoning where appropriate.

            </p>

          </div>

          {/* CANDIDATE */}

          <div className="candidate-info">

            <div className="candidate-avatar">
              {candidateId}
            </div>

            <div>

              <span>
                Candidate
              </span>

              <strong>
                #{candidateId}
              </strong>

            </div>

          </div>

        </section>

        {/* ====================================================
            GRID
            ==================================================== */}

        <div className="interview-grid">

          {/* ==================================================
              LEFT QUESTION AREA
              ================================================== */}

          <section className="question-section">

            {/* QUESTION META */}

            <div className="question-meta">

              <div className="question-count">

                Question{" "}

                {String(
                  currentQuestionNumber
                ).padStart(2, "0")}

                <span>
                  {" "}
                  / {totalQuestions}
                </span>

              </div>

              <div className="question-tags">

                <span className="tag topic-tag">

                  {currentQuestion.topic}

                </span>

                <span className="tag difficulty-tag">

                  {currentQuestion.difficulty}

                </span>

              </div>

            </div>

            {/* QUESTION CARD */}

            <div className="question-card">

              <div className="question-icon">
                Q
              </div>

              <div className="question-content">

                <span className="question-label">

                  INTERVIEW QUESTION

                </span>

                <h2>
                  {currentQuestion.question}
                </h2>

              </div>

            </div>

            {/* ANSWER SECTION */}

            <div className="answer-section">

              <div className="answer-header">

                <div>

                  <label htmlFor="answer">
                    Your answer
                  </label>

                  <p>

                    Explain your reasoning and
                    use examples where possible.

                  </p>

                </div>

                <span className="character-count">

                  {answer.length} characters

                </span>

              </div>

              {/* TEXTAREA */}

              <textarea
                id="answer"
                value={answer}
                onChange={(e) => {

                  setAnswer(e.target.value);

                  setSubmitted(false);

                  setEvaluation(null);

                  setError("");

                }}
                placeholder="Type your answer here..."
                maxLength={3000}
                disabled={
                  submitting ||
                  submitted
                }
              />

              {/* ANSWER EVALUATION */}

              {submitted &&
                evaluation && (

                  <div className="answer-evaluation">

                    <div className="evaluation-icon">
                      ✓
                    </div>

                    <div>

                      <strong>
                        Answer evaluated
                      </strong>

                      <p>
                        Your response has been
                        recorded successfully.
                      </p>

                    </div>

                  </div>

                )}

              {/* ERROR */}

              {error &&
                questions.length > 0 &&
                !completed && (

                  <div className="error-message">

                    <span>
                      !
                    </span>

                    {error}

                  </div>

                )}

              {/* ANSWER FOOTER */}

              <div className="answer-footer">

                <span className="answer-hint">

                  <span className="hint-icon">
                    ✦
                  </span>

                  Take your time. Technical accuracy
                  matters more than speed.

                </span>

                {/* SUBMIT */}

                {!submitted ? (

                  <button
                    className="submit-answer-button"
                    onClick={handleSubmit}
                    disabled={
                      !answer.trim() ||
                      submitting
                    }
                  >

                    {submitting ? (

                      <>

                        <span className="button-spinner"></span>

                        Evaluating...

                      </>

                    ) : (

                      <>

                        Submit answer

                        <span>
                          →
                        </span>

                      </>

                    )}

                  </button>

                ) : (

                  /*
                   * NEXT / FINISH
                   */

                  <button
                    className="submit-answer-button"
                    onClick={handleNext}
                    disabled={loadingReport}
                  >

                    {loadingReport ? (

                      <>

                        <span className="button-spinner"></span>

                        Generating results...

                      </>

                    ) : (

                      <>

                        {currentQuestionNumber ===
                        totalQuestions
                          ? "Finish interview"
                          : "Next question"}

                        <span>
                          →
                        </span>

                      </>

                    )}

                  </button>

                )}

              </div>

            </div>

          </section>

          {/* ==================================================
              RIGHT SIDEBAR
              ================================================== */}

          <aside className="interview-sidebar">

            {/* ROLE */}

            <div className="sidebar-card role-card">

              <div className="sidebar-card-label">
                TARGET ROLE
              </div>

              <h3>
                {role}
              </h3>

              <div className="role-status">

                <span></span>

                Personalized interview

              </div>

            </div>

            {/* PROGRESS */}

            <div className="sidebar-card">

              <div className="sidebar-heading">

                <span>
                  Interview progress
                </span>

                <strong>
                  {currentQuestionNumber}/
                  {totalQuestions}
                </strong>

              </div>

              <div className="progress-track">

                <div
                  className="progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                ></div>

              </div>

              <p className="progress-description">

                {totalQuestions -
                  currentQuestionNumber}{" "}

                question
                {totalQuestions -
                  currentQuestionNumber !==
                1
                  ? "s"
                  : ""}{" "}

                remaining

              </p>

            </div>

            {/* TIPS */}

            <div className="sidebar-card tips-card">

              <div className="tips-header">

                <div className="tips-icon">
                  ✦
                </div>

                <h3>
                  Interview tips
                </h3>

              </div>

              <div className="tip">

                <span>
                  01
                </span>

                <p>

                  Explain concepts in your own
                  words rather than memorizing
                  definitions.

                </p>

              </div>

              <div className="tip">

                <span>
                  02
                </span>

                <p>

                  Give practical examples when
                  you can.

                </p>

              </div>

              <div className="tip">

                <span>
                  03
                </span>

                <p>

                  If you're unsure, explain how
                  you would approach the problem.

                </p>

              </div>

            </div>

            {/* AI INFO */}

            <div className="ai-info">

              <div className="ai-info-icon">
                ◈
              </div>

              <div>

                <strong>
                  AI-powered evaluation
                </strong>

                <p>

                  Your responses are evaluated
                  for technical accuracy, depth
                  and clarity.

                </p>

              </div>

            </div>

          </aside>

        </div>

      </main>

      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer className="interview-footer">

        <span>

          HireMind <b>AI</b>

        </span>

        <span>

          AI-powered technical interviewing

        </span>

      </footer>

    </div>
  );
}

export default Interview;