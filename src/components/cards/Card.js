import React from 'react';
import './card.css';

export const Card = ({data}) => {
  
  const getImageUrl = () => {
    return data.thumbnail.path + '.' + data.thumbnail.extension
  }

  return (
    <div className='card-container'>
      <img src={getImageUrl()} className='card-image' alt='pic'/>
      <div className='card-info'>
        <div className='card-title' title={data.title}>
          {data.title}
        </div>
        <div className='card-id'>
          #{data.id}
        </div>
      </div>
    </div>
  )
}
