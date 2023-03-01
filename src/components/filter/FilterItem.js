import React from 'react';
import DoneIcon from '@mui/icons-material/Done';
import "./filterItem.css";

export const FilterItem = ({handleItemClick, data}) => {

  return (
    <div style={{position: 'relative'}} onClick={() => handleItemClick(data)}>
      <img src={data.image} className={`filterItem ${data.isSelected ? 'checked' : ''}`} alt='pic'/>
      {data.isSelected ? <DoneIcon className='selected-icon'/> : null}
    </div>
  )
}
