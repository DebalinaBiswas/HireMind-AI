import "./Results.css";

function Results({ candidateId, role, report }) {
  // ---------------------------------------------------------
  // SAFE REPORT VALUES
  // ---------------------------------------------------------

  const overallScore = Number(report?.overall_score ?? 0);
  const technicalScore = Number(report?.technical_score ?? 0);
  const communicationScore = Number(
    report?.communication_score ?? 0
  );

  const strengths = Array.isArray(report?.strengths)
    ? report.strengths
    : [];

  const weaknesses = Array.isArray(report?.weaknesses)
    ? report.weaknesses
    : [];

  const recommendation =
    report?.recommendation ||
    "Continue developing your technical and practical skills.";

  const summary =
    report?.summary ||
    "Your interview evaluation has been completed successfully.";

  // ---------------------------------------------------------
  // SCORE HELPERS
  // ---------------------------------------------------------

  const scorePercent = (score) =>
    `${Math.min(Math.max(score * 10, 0), 100)}%`;

  const getScoreLabel = (score) => {
    if (score >= 8.5) return "Excellent performance";
    if (score >= 7) return "Strong performance";
    if (score >= 5) return "Good potential";
    return "Needs improvement";
  };

  return (
    <div className="results-page">

      {/* =====================================================
          NAVBAR
          ===================================================== */}

      <header className="results-navbar">

        <div className="results-brand">
          <span className="results-brand-main">
            HireMind
          </span>

          <span className="results-brand-ai">
            AI
          </span>
        </div>

        <div className="results-status">
          <span className="results-status-dot"></span>
          Interview completed
        </div>

      </header>


      {/* =====================================================
          PROGRESS
          ===================================================== */}

      <div className="results-progress">

        <div className="results-progress-inner">

          <div className="results-progress-item completed">
            <span>01</span>
            Candidate
          </div>

          <div className="results-progress-line completed"></div>

          <div className="results-progress-item completed">
            <span>02</span>
            Interview
          </div>

          <div className="results-progress-line completed"></div>

          <div className="results-progress-item active">
            <span>03</span>
            Results
          </div>

        </div>

      </div>


      {/* =====================================================
          MAIN
          ===================================================== */}

      <main className="results-container">

        {/* HEADER */}

        <div className="results-eyebrow">
          <span></span>
          INTERVIEW RESULTS
        </div>

        <h1>
          Your interview
          <br />
          <span>results are ready.</span>
        </h1>

        <p className="results-description">
          Your technical interview for the{" "}
          <strong>{role}</strong> position has been
          evaluated by HireMind AI.
        </p>


        {/* ===================================================
            OVERVIEW
            =================================================== */}

        <section className="results-overview">

          <div className="results-overview-header">

            <div>
              <span className="results-label">
                CANDIDATE
              </span>

              <strong>
                #{candidateId}
              </strong>
            </div>

            <div>
              <span className="results-label">
                TARGET ROLE
              </span>

              <strong>
                {role}
              </strong>
            </div>

            <div>
              <span className="results-label">
                STATUS
              </span>

              <strong className="completed-text">
                <span>●</span>
                Completed
              </strong>
            </div>

          </div>


          {/* OVERALL SCORE */}

          <div className="overall-score">

            <div className="score-circle">

              <strong>
                {overallScore.toFixed(1)}
              </strong>

              <span>
                OUT OF 10
              </span>

            </div>

            <div className="score-content">

              <span className="score-kicker">
                OVERALL PERFORMANCE
              </span>

              <h2>
                {getScoreLabel(overallScore)}
              </h2>

              <p>
                Your interview performance was evaluated
                across technical knowledge, communication,
                depth, clarity, and relevance.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            PERFORMANCE BREAKDOWN
            =================================================== */}

        <section className="evaluation-section">

          <div className="section-heading">

            <span>01</span>

            <div>
              <p>PERFORMANCE BREAKDOWN</p>
              <h2>Evaluation scores</h2>
            </div>

          </div>


          <div className="evaluation-grid">

            {/* TECHNICAL */}

            <div className="evaluation-metric">

              <div className="metric-top">

                <span>
                  Technical knowledge
                </span>

                <strong>
                  {technicalScore.toFixed(1)} / 10
                </strong>

              </div>

              <div className="metric-track">

                <div
                  className="metric-fill"
                  style={{
                    width: scorePercent(
                      technicalScore
                    ),
                  }}
                ></div>

              </div>

            </div>


            {/* COMMUNICATION */}

            <div className="evaluation-metric">

              <div className="metric-top">

                <span>
                  Communication
                </span>

                <strong>
                  {communicationScore.toFixed(1)} / 10
                </strong>

              </div>

              <div className="metric-track">

                <div
                  className="metric-fill"
                  style={{
                    width: scorePercent(
                      communicationScore
                    ),
                  }}
                ></div>

              </div>

            </div>

          </div>

        </section>


        {/* ===================================================
            STRENGTHS
            =================================================== */}

        {strengths.length > 0 && (
          <section className="question-results">

            <div className="section-heading">

              <span>02</span>

              <div>
                <p>STRENGTHS</p>
                <h2>What you did well</h2>
              </div>

            </div>


            <div className="question-result-list">

              {strengths.map((strength, index) => (

                <div
                  className="question-result-card"
                  key={index}
                >

                  <div className="question-result-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="question-result-content">

                    <p>
                      {strength}
                    </p>

                  </div>

                  <div className="question-result-score success">
                    Strength
                  </div>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* ===================================================
            AREAS TO IMPROVE
            =================================================== */}

        {weaknesses.length > 0 && (
          <section className="question-results">

            <div className="section-heading">

              <span>03</span>

              <div>
                <p>AREAS TO IMPROVE</p>
                <h2>Where you can improve</h2>
              </div>

            </div>


            <div className="question-result-list">

              {weaknesses.map((weakness, index) => (

                <div
                  className="question-result-card improvement"
                  key={index}
                >

                  <div className="question-result-number improvement-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div className="question-result-content">

                    <p>
                      {weakness}
                    </p>

                  </div>

                  <div className="question-result-score improve">
                    Focus
                  </div>

                </div>

              ))}

            </div>

          </section>
        )}


        {/* ===================================================
            RECOMMENDATION
            =================================================== */}

        <section className="results-feedback">

          <div className="section-heading">

            <span>04</span>

            <div>
              <p>AI RECOMMENDATION</p>
              <h2>Hiring recommendation</h2>
            </div>

          </div>


          <div className="recommendation-box">

            <div className="recommendation-icon">
              ✓
            </div>

            <div>

              <span>
                RECOMMENDATION
              </span>

              <strong>
                {recommendation}
              </strong>

            </div>

          </div>

        </section>


        {/* ===================================================
            SUMMARY
            =================================================== */}

        <section className="results-summary">

          <div className="section-heading">

            <span>05</span>

            <div>
              <p>EXECUTIVE SUMMARY</p>
              <h2>Overall assessment</h2>
            </div>

          </div>


          <div className="summary-card">

            <p>
              {summary}
            </p>

          </div>

        </section>


        {/* ===================================================
            COMPLETION NOTE
            =================================================== */}

        <div className="report-fallback">

          <div className="report-fallback-icon">
            ✓
          </div>

          <div>

            <strong>
              Evaluation complete
            </strong>

            <p>
              HireMind AI analyzed your responses and
              generated this personalized interview report.
            </p>

          </div>

        </div>

      </main>


      {/* =====================================================
          FOOTER
          ===================================================== */}

      <footer className="results-footer">

        <span>
          HireMind{" "}
          <b>AI</b>
        </span>
        <span>
          AI-powered technical interviewing
        </span>
      </footer>
    </div>
  );
}
export default Results;