import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLaptopCode,
  faChartBar,
  faPalette,
  faBullhorn,
  faProjectDiagram,
  faHandshake,
  faHeadset,
  faCloud,
  faPenNib,
  faCheckCircle,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { resolveImageUrl } from "../utils/media";
import "./JobCategorySwiper.css";
 

const JobCategorySwiper = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const swiperRef = useRef(null);

  // Consistent with TopCompanies: 4 cards per slide
  const itemsPerSlide = 4;

  // Icon mapping
  const iconFor = useMemo(() => {
    const map = [
      { kw: ["software", "development", "engineer", "developer"], icon: faLaptopCode },
      { kw: ["data", "analytics", "science", "ml", "ai"], icon: faChartBar },
      { kw: ["design", "ux", "ui", "product"], icon: faPalette },
      { kw: ["marketing", "growth", "seo"], icon: faBullhorn },
      { kw: ["project", "management", "pm"], icon: faProjectDiagram },
      { kw: ["sales", "business", "bd"], icon: faHandshake },
      { kw: ["support", "customer", "success"], icon: faHeadset },
      { kw: ["devops", "cloud", "infrastructure"], icon: faCloud },
      { kw: ["content", "writer", "copy"], icon: faPenNib },
      { kw: ["qa", "quality", "test"], icon: faCheckCircle },
    ];
    return (name) => {
      const n = String(name || "").toLowerCase();
      for (const m of map) {
        if (m.kw.some((k) => n.includes(k))) return m.icon;
      }
      return faBriefcase;
    };
  }, []);

  // Fetch categories
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const resp = await fetch('https://job-site-backend-seven.vercel.app/api/categories');
        if (!resp.ok) {
          setLoading(false);
          return;
        }
        const data = await resp.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.categories) ? data.categories : [];
        if (!cancelled) setCategories(list);
      } catch {
        void 0;
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Swiper behavior aligned with TopCompanies
  const nextSlide = useCallback(() => {
    if (currentIndex + itemsPerSlide < categories.length && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev + itemsPerSlide);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [currentIndex, isTransitioning, categories.length]);

  const prevSlide = useCallback(() => {
    if (currentIndex - itemsPerSlide >= 0 && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - itemsPerSlide);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  }, [currentIndex, isTransitioning]);

  useEffect(() => {
    const handleWheel = (e) => {
      if (!swiperRef.current) return;
      const rect = swiperRef.current.getBoundingClientRect();
      const isHovering =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (isHovering) {
        e.preventDefault();
        if (e.deltaY > 0) nextSlide();
        else if (e.deltaY < 0) prevSlide();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [nextSlide, prevSlide]);

  return (
    <section className="job-categories top-companies" style={{ marginTop: "3rem" }}>
      <div className="container">
        <h2 className="home-section-title">Browse Job Categories</h2>
        <p className="home-section-subtitle">Explore jobs in popular categories</p>

        <div className="categories-container" ref={swiperRef}>
          <div className="categories-cards-wrapper">
            <div
              className={`categories-cards ${isTransitioning ? "transitioning" : ""}`}
              style={{ transform: `translateX(-${currentIndex * (100 / itemsPerSlide)}%)` }}
            >
              {(loading
                ? Array.from({ length: 8 }).map((_, i) => ({ name: "Loading", count: null, _loading: true, i }))
                : categories
              ).map((cat, idx) => {
                const icon = iconFor(cat.name);
                const color = "#3B82F6";
                const key = cat.name ? `${cat.name}-${idx}` : `loading-${idx}`;
                const imgSrc = cat.imageUrl ? resolveImageUrl(cat.imageUrl) : '';
                return (
                  <div
                    key={key}
                    className={`category-card ${cat._loading ? "loading" : ""}`}
                    onClick={() => !cat._loading && navigate(`/jobs?category=${encodeURIComponent(cat.name)}`)}
                  >
                    <div className="category-logo-wrapper">
                      {imgSrc ? (
                        <img src={imgSrc} alt={cat.name || 'Category'} className="category-icon" style={{ objectFit: "cover" }} />
                      ) : (
                        <div className="category-icon" style={{ background: `${color}20`, color }}>
                          <FontAwesomeIcon icon={icon} size="2x" />
                        </div>
                      )}
                    </div>
                    <h3 className="category-name">{cat.name}</h3>
                  </div>
                );
              })}
            </div>
          </div>
          {(() => {
            const totalPages = Math.ceil(((loading ? 8 : categories.length) || 0) / itemsPerSlide);
            const currentPage = Math.floor(currentIndex / itemsPerSlide);
            if (totalPages <= 1) return null;
            return (
              <div className="categories-pagination" aria-label="Category slider pagination">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={`page-${i}`}
                    type="button"
                    className={`pager-dot ${i === currentPage ? "active" : ""}`}
                    aria-label={`Go to page ${i + 1}`}
                    onClick={() => setCurrentIndex(i * itemsPerSlide)}
                  />
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </section>
  );
};

export default JobCategorySwiper;
