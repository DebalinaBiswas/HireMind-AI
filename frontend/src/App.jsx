import { useState } from "react";
import API from "./services/api";
import "./App.css";

import Interview from "./components/Interview";
import Results from "./components/Results";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("AI / ML Engineer");
  const [resume, setResume] = useState(null);

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const [screen, setScreen] = useState("candidate");

  const [report, setReport] = useState(null);

  /*
   * ============================================================
   * FILE HANDLING
   * ============================================================
   */

  const handleFile = (file) => {
    setError("");
    setSuccess(null);

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Please upload your resume as a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Resume size must be less than 10 MB.");
      return;
    }

    setResume(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];

    handleFile(file);
  };

  /*
   * ============================================================
   * RESUME SUBMIT
   * ============================================================
   */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess(null);

    if (!name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!resume) {
      setError("Please upload your resume.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("role", role);
      formData.append("resume", resume);

      const response = await API.post(
        "/api/v1/resume/upload",
        formData
      );

      console.log("UPLOAD RESPONSE:", response);
      console.log("UPLOAD DATA:", response.data);

      const candidateId = response.data?.candidate_id;

      if (!candidateId) {
        throw new Error(
          "Candidate ID was not returned by the backend."
        );
      }

      setSuccess({
        candidateId: candidateId,
        message:
          response.data?.message ||
          "Resume processed successfully.",
      });

      setError("");

    } catch (err) {
      console.error("RESUME UPLOAD ERROR:", err);

      const message =
        err.response?.data?.detail ||
        err.message ||
        "We couldn't process your resume. Please try again.";

      setError(
        Array.isArray(message)
          ? message[0]?.msg || "Invalid information."
          : message
      );

    } finally {
      setUploading(false);
    }
  };

  /*
   * ============================================================
   * START INTERVIEW
   * ============================================================
   */

  const handleStartInterview = () => {
    if (!success?.candidateId) {
      setError(
        "Candidate information is missing. Please upload your resume again."
      );
      return;
    }

    setReport(null);
    setError("");
    setScreen("interview");
  };

  /*
   * ============================================================
   * INTERVIEW FINISHED
   *
   * Interview.jsx sends the final report here.
   * App switches to the Results screen.
   * ============================================================
   */

  const handleInterviewFinish = (finalReport) => {
    console.log(
      "FINAL REPORT RECEIVED IN APP:",
      finalReport
    );

    if (!finalReport) {
      console.error(
        "No final report received."
      );

      return;
    }

    setReport(finalReport);
    setScreen("results");
  };

  /*
   * ============================================================
   * RESULTS SCREEN
   * ============================================================
   */

  if (screen === "results") {
    return (
      <Results
        candidateId={success?.candidateId}
        role={role}
        report={report}
      />
    );
  }

  /*
   * ============================================================
   * INTERVIEW SCREEN
   * ============================================================
   */

  if (screen === "interview") {
    return (
      <Interview
        candidateId={success?.candidateId}
        role={role}
        onFinish={handleInterviewFinish}
      />
    );
  }

  /*
   * ============================================================
   * CANDIDATE SETUP SCREEN
   * ============================================================
   */

  return (
    <div className="app">

      {/* ======================================================
          NAVBAR
          ====================================================== */}

      <header className="navbar">

        <div className="brand">

          <span className="brand-main">
            HireMind
          </span>

          <span className="brand-ai">
            AI
          </span>

        </div>

        <div className="nav-status">

          <span className="status-dot"></span>

          AI Interview Platform

        </div>

      </header>


      {/* ======================================================
          MAIN
          ====================================================== */}

      <main className="main-container">

        {/* ====================================================
            LEFT HERO
            ==================================================== */}

        <section className="hero-section">

          <div className="eyebrow">

            <span className="eyebrow-line"></span>

            INTELLIGENT INTERVIEWING

          </div>


          <h1>

            Interviews that

            <br />

            <span>understand</span>

            <br />

            your potential.

          </h1>


          <p className="hero-description">

            HireMind AI creates role-specific technical
            interviews using your resume, selected role,
            and relevant knowledge.

          </p>


          {/* FEATURES */}

          <div className="feature-list">

            <div className="feature">

              <div className="feature-icon">
                ✦
              </div>

              <div>

                <strong>
                  Resume-aware
                </strong>

                <p>
                  Questions are influenced by your experience.
                </p>

              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">
                ⌁
              </div>

              <div>

                <strong>
                  Role-specific
                </strong>

                <p>
                  Interview topics adapt to the target position.
                </p>

              </div>

            </div>


            <div className="feature">

              <div className="feature-icon">
                ◈
              </div>

              <div>

                <strong>
                  AI-powered
                </strong>

                <p>
                  Questions are generated dynamically using
                  relevant context.
                </p>

              </div>

            </div>

          </div>


          {/* PIPELINE */}

          <div className="pipeline">

            <div className="pipeline-step active">

              <span>
                01
              </span>

              Candidate

            </div>


            <div className="pipeline-line"></div>


            <div className="pipeline-step">

              <span>
                02
              </span>

              Interview

            </div>


            <div className="pipeline-line"></div>


            <div className="pipeline-step">

              <span>
                03
              </span>

              Results

            </div>

          </div>

        </section>


        {/* ====================================================
            RIGHT CARD
            ==================================================== */}

        <section className="card-section">

          {!success ? (

            /* ==================================================
               CANDIDATE FORM
               ================================================== */

            <form
              className="setup-card"
              onSubmit={handleSubmit}
            >

              <div className="card-header">

                <div>

                  <p className="card-label">
                    STEP 01
                  </p>

                  <h2>
                    Set up your interview
                  </h2>

                </div>


                <div className="step-number">
                  01
                </div>

              </div>


              <p className="card-description">

                Tell us a little about yourself and upload
                your resume. We'll use this information to
                build your interview.

              </p>


              {/* NAME */}

              <div className="field">

                <label>
                  Full name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Debalina Biswas"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                />

              </div>


              {/* EMAIL */}

              <div className="field">

                <label>
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />

              </div>


              {/* ROLE */}

              <div className="field">

                <label>
                  Target role
                </label>

                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    setError("");
                  }}
                >

                  <option>
                    AI / ML Engineer
                  </option>

                  <option>
                    Backend Engineer
                  </option>

                  <option>
                    Software Engineer
                  </option>

                  <option>
                    Data Scientist
                  </option>

                  <option>
                    Data Engineer
                  </option>

                  <option>
                    Full Stack Developer
                  </option>

                </select>

              </div>


              {/* RESUME */}

              <div className="field">

                <label>
                  Resume
                </label>


                <div
                  className={`drop-zone ${
                    dragActive
                      ? "drag-active"
                      : ""
                  } ${
                    resume
                      ? "has-file"
                      : ""
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => {
                    setDragActive(false);
                  }}
                  onDrop={handleDrop}
                >

                  <input
                    id="resume"
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={(e) =>
                      handleFile(
                        e.target.files?.[0]
                      )
                    }
                  />


                  {!resume ? (

                    <label
                      htmlFor="resume"
                      className="upload-content"
                    >

                      <div className="upload-icon">
                        ↑
                      </div>

                      <strong>
                        Drop your resume here
                      </strong>

                      <span>
                        or <b>browse files</b>
                      </span>

                      <small>
                        PDF only · Maximum 10 MB
                      </small>

                    </label>

                  ) : (

                    <label
                      htmlFor="resume"
                      className="selected-file"
                    >

                      <div className="pdf-icon">
                        PDF
                      </div>


                      <div className="file-info">

                        <strong>
                          {resume.name}
                        </strong>

                        <span>
                          {(
                            resume.size /
                            1024 /
                            1024
                          ).toFixed(2)}{" "}
                          MB
                        </span>

                      </div>


                      <span className="change-file">
                        Change
                      </span>

                    </label>

                  )}

                </div>

              </div>


              {/* ERROR */}

              {error && (

                <div className="error-message">

                  <span>
                    !
                  </span>

                  {error}

                </div>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="continue-button"
                disabled={uploading}
              >

                {uploading ? (

                  <>
                    <span className="spinner"></span>
                    Processing resume...
                  </>

                ) : (

                  <>
                    Continue to interview
                    <span>→</span>
                  </>

                )}

              </button>


              <p className="privacy-note">

                Your resume is processed securely and used
                only to personalize your interview.

              </p>

            </form>

          ) : (

            /* ==================================================
               RESUME SUCCESS
               ================================================== */

            <div className="success-card">

              <div className="success-icon">
                ✓
              </div>


              <p className="card-label">
                RESUME PROCESSED
              </p>


              <h2>
                You're ready to begin.
              </h2>


              <p className="success-description">

                Your resume has been successfully uploaded
                and your candidate profile has been created.

              </p>


              <div className="candidate-box">

                <span>
                  Candidate ID
                </span>

                <strong>
                  #{success.candidateId}
                </strong>

              </div>


              <div className="success-status">

                <span>
                  ✓
                </span>

                {success.message}

              </div>


              <button
                className="continue-button"
                type="button"
                onClick={handleStartInterview}
              >

                Begin AI interview

                <span>
                  →
                </span>

              </button>

            </div>

          )}

        </section>

      </main>


      {/* ======================================================
          FOOTER
          ====================================================== */}

      <footer>

        <span>
          HireMind AI
        </span>

        <span>
          AI-powered technical interviewing
        </span>

      </footer>

    </div>
  );
}

export default App;