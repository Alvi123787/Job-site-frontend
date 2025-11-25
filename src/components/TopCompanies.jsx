import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./TopCompanies.css";
import { resolveImageUrl } from "../utils/media";
import { useNavigate } from "react-router-dom";

const itemsPerSlide = 4;

const TopCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState({ loading: true, error: "" });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setStatus({ loading: true, error: "" });
        // Prefer active companies based on non-expired jobs
        const resp = await fetch('https://job-site-backend-seven.vercel.app/api/companies?active=true&sort=openPositions&limit=12');
        if (!resp.ok) throw new Error("Failed to load companies");
        const data = await resp.json();
        let finalList = Array.isArray(data?.companies) ? data.companies : [];
        if (finalList.length === 0) {
          const alt = await fetch('https://job-site-backend-seven.vercel.app/api/companies?sort=openPositions&limit=12');
          const altData = await alt.json();
          finalList = Array.isArray(altData?.companies) ? altData.companies : [];
        }
        // Only show companies that currently have open positions
        finalList = finalList.filter(c => Number(c?.openPositions || 0) > 0);
        setCompanies(finalList);
      } catch (err) {
        setStatus({ loading: false, error: err.message || "Unable to fetch companies" });
        return;
      } finally {
        setStatus((s) => ({ ...s, loading: false }));
      }
    };
    load();
  }, []);

  const nextSlide = useCallback(() => {
    if (currentIndex + itemsPerSlide < companies.length && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + itemsPerSlide);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [currentIndex, companies.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (currentIndex - itemsPerSlide >= 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - itemsPerSlide);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [currentIndex, isTransitioning]);

  const totalPages = useMemo(() => Math.ceil(((status.loading ? 8 : companies.length) || 0) / itemsPerSlide), [companies.length, status.loading]);
  const currentPage = useMemo(() => Math.floor(currentIndex / itemsPerSlide), [currentIndex]);

  return (
    <section className="top-companies">
      <div className="container">
        <h2 className="section-title">Top Companies Hiring</h2>
        <p className="section-subtitle">Trusted by leading companies</p>

        {status.error && (
          <div className="alert alert-warning" role="alert" style={{ maxWidth: 960, margin: "0 auto 16px" }}>
            {status.error}
          </div>
        )}

        {!status.loading && companies.length === 0 && (
          <div className="text-center" style={{ color: "#6b7280" }}>
            No companies to show yet.
          </div>
        )}

        <div className="companies-container" onWheel={(e) => {
          if (e.deltaY > 0) nextSlide();
          else if (e.deltaY < 0) prevSlide();
        }}>
          <div className="companies-cards-wrapper">
            <div
              className={`companies-cards ${isTransitioning ? "transitioning" : ""}`}
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerSlide)}%)` }}
            >
              {(status.loading ? Array.from({ length: 8 }) : companies).map((c, idx) => (
                <div
                  className="company-card"
                  key={(c && (c._id || c.companyName)) || idx}
                  role="button"
                  tabIndex={0}
                  onClick={() => {
                    if (c?.companyName) {
                      navigate({ pathname: "/jobs", search: `?company=${encodeURIComponent(c.companyName)}` });
                    }
                  }}
                  onKeyDown={(e) => {
                    if ((e.key === "Enter" || e.key === " ") && c?.companyName) {
                      navigate({ pathname: "/jobs", search: `?company=${encodeURIComponent(c.companyName)}` });
                    }
                  }}
                >
                  <div className="company-logo-wrapper">
                    <img
                      className="company-logo"
                      src={resolveImageUrl(c?.logo || "/company-placeholder.svg")}
                      alt={`${c?.companyName || "Company"} logo`}
                      onError={(e) => { e.currentTarget.src = '/company-placeholder.svg'; }}
                    />
                  </div>
                  <h3 className="company-name">{c?.companyName || "—"}</h3>
                  <div className="job-count">{Number(c?.openPositions || 0)} open positions</div>
                </div>
              ))}
            </div>
          </div>
          {/* pagination dots */}
          <div className="categories-pagination" aria-label="Companies slider pagination">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                className={`pager-dot ${i === currentPage ? "active" : ""}`}
                onClick={() => setCurrentIndex(i * itemsPerSlide)}
                aria-label={`Go to companies page ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopCompanies;