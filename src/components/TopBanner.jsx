import React, { useState, useEffect } from 'react';
import './TopBanner.css';

const TopBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 배너 이미지 경로 (5개)
  const banners = [
    '/images/banners/banner1.png',
    '/images/banners/banner2.png',
    '/images/banners/banner3.png',
    '/images/banners/banner4.png',
    '/images/banners/banner5.png',
  ];

  // 자동 슬라이드 (5초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [banners.length]);

  // 이전 슬라이드
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // 다음 슬라이드
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  // 특정 슬라이드로 이동
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="top-banner">
      <div className="banner-container">
        {/* 슬라이드들 */}
        <div 
          className="banner-track"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {banners.map((banner, index) => (
            <div key={index} className="banner-slide">
              <img 
                src={banner} 
                alt={`Banner ${index + 1}`}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          ))}
        </div>

        {/* 이전/다음 버튼 */}
        <button className="banner-btn banner-btn-prev" onClick={prevSlide}>
          ‹
        </button>
        <button className="banner-btn banner-btn-next" onClick={nextSlide}>
          ›
        </button>

        {/* 인디케이터 (점) */}
        <div className="banner-indicators">
          {banners.map((_, index) => (
            <button
              key={index}
              className={`indicator ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopBanner;
