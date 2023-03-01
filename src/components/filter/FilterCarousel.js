import React, { useEffect, useMemo } from 'react';
import { useState, useRef } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { FilterItem } from './FilterItem';
import './filterCarousel.css';
import { formatData } from '../../helper/helper';

export const FilterCarousel = ({
  filterData,
  handleItemClick,
  filterArr,
  resetFilters
}) => {
  const [slideNumber, setSlideNumber] = useState(0);

  const itemRef = useRef();

  const handleSlide = (dir) => {
    const { x, width } = itemRef.current.getBoundingClientRect();
    let distance = x - (0.2 * window.innerWidth);
    let itemsInView = Math.floor(width/120);
    let maxSlides = filterData.length - itemsInView;
    if (dir === 'left' && slideNumber > 0) {
      setSlideNumber(slideNumber - 1);
      itemRef.current.style.transform = `translateX(${120 + distance}px)`;
    }
    if (dir === 'right' && slideNumber < maxSlides) {
      setSlideNumber(slideNumber + 1);
      itemRef.current.style.transform = `translateX(${-120 + distance}px)`;
    }
  }

  return (
    <div className='filter'>
      <div className='filter-items-wrapper'>
        <div className='icon-btn left'>
          <ArrowBackIcon className='arrow-icon' onClick={() => handleSlide('left')}/>
        </div>
        <div className='item-wrapper' ref={itemRef}>
          {
            filterData && filterData.map(item => <FilterItem key={item.id} handleItemClick={handleItemClick} data={item}/>)
          }
        </div>
        <div className='icon-btn right'>
          <ArrowForwardIcon className='arrow-icon' onClick={() => handleSlide('right')}/>
        </div>
      </div>
      <div className='filter-details-wrapper'>
        {filterArr.length > 0 ? <div className='filter-details'>
          <div className='filter-names'>
            Explore - {formatData(filterArr, 'name', ', ')}
          </div>
          <button style={{minWidth: 'fit-content'}} onClick={resetFilters}>Clear all filters</button>
        </div> : null}
      </div>
    </div>
  )
}
