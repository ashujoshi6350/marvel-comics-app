import './App.css';
import { useEffect, useRef, useState } from 'react';
import { Card } from './components/cards/Card';
import MD5 from "crypto-js/md5";
import axios from 'axios';
import { FilterCarousel } from './components/filter/FilterCarousel';
import { formatData } from './helper/helper';

function App() {
  const [filterData, setFilterData] = useState([]);
  const [filterArr, setFilterArr] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [text, setText] = useState('');

  const id = useRef(null);

  const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const DEBOUNCE_DELAY = 500;
  const GET_COMICS_BASE_URL = 'https://gateway.marvel.com:443/v1/public/comics';

  const getUrl = (qp={}) => {
    const ts = Date.now();
    const key = ts + PRIVATE_KEY + PUBLIC_KEY;
    const hash = MD5(key);
    let url = `${GET_COMICS_BASE_URL}?ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}`;
    Object.keys(qp).map(key => {
      if (qp[key]) {
        url = url + `&${key}=${qp[key]}`
      }
      return true
    });

    return url
  }

  const handleSearch = (value) => {
    setText(value);
    if (id.current) {
      clearTimeout(id.current);
    }
    id.current = setTimeout(async () => {
      let filterQuery = formatData(filterArr, 'id', ',');
      let optionalQueryParams = {
        characters: filterQuery,
        titleStartsWith: value
      }
      const url = getUrl(optionalQueryParams);
      const result = await axios.get(url);
      setCardsData(result.data.data.results);
    }, DEBOUNCE_DELAY)
  }

  const handleItemClick = async (item) => {
    let index = filterArr.findIndex((val) => {
      return val.id === item.id
    })
    let arr = [...filterArr];
    if (index === -1) {
      arr.push(item);  
    } else {
      arr = filterArr.filter(val => val.id !== item.id);
    }
    setFilterArr([...arr]);
    let data = filterData.map(val => {
      if (val.id === item.id) {
        return {...val, isSelected: !val.isSelected}
      }
      return val
    });
    setFilterData(data);
    let filterQuery = formatData(arr, 'id', ',');
    let optionalQueryParams = {
      characters: filterQuery,
      titleStartsWith: text
    }
    const url = getUrl(optionalQueryParams);
    const result = await axios.get(url);
    setCardsData(result.data.data.results);
  }

  const getData = async () => {
    const url = getUrl();
    const result = await axios.get(url);
    setCardsData(result.data.data.results);
    let mymap = new Map();  
    let uniqueHeroes = [];
    result.data.data.results.map(item => item.characters.items.map(charac => {
        let val = mymap.get(charac.name);
        if (!val) {
          uniqueHeroes.push(charac);
          mymap.set(charac.name, 1)
        }
        return true
      })
    )
    let tempFilterData = [];
    let promiseArr = [];
    const ts = Date.now();
    const key = ts + PRIVATE_KEY + PUBLIC_KEY;
    const hash = MD5(key);
    uniqueHeroes.map(heroData => {
      promiseArr.push(axios.get(`${heroData.resourceURI}?ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}`));
      return true
    });
    Promise.all(promiseArr).then((values) => {
      values.map(value => {
        const tempObj = {};
        tempObj.image = value.data.data.results[0].thumbnail.path + '.' + value.data.data.results[0].thumbnail.extension;
        tempObj.id = value.data.data.results[0].id;
        tempObj.name = value.data.data.results[0].name;
        tempObj.isSelected = false;
        tempFilterData.push(tempObj);
        return true
      })
      setFilterData(tempFilterData);
    });
  }

  useEffect(() => {
    getData();
  }, []);

  const resetFilters = () => {
    setFilterArr([]);
    setText('');
    getData();
  }

  return (
    <div className='app'>
      <header className='app-header'>
        <span className='title'>MARVEL</span>
        <span className='search-wrapper'>
          <input type='text'
            placeholder='Search for comics ...'
            className='search-box'
            value={text}
            onChange={e => handleSearch(e.target.value)}
          ></input>
        </span>
      </header>
      {filterData.length > 0 && <FilterCarousel
        filterData={filterData}
        handleItemClick={handleItemClick}
        filterArr={filterArr}
        resetFilters={resetFilters}
      /> }
      <div className='cards-wrapper'>
        <div className='cards'>
          {
            cardsData.map(item => {
              return <Card className='card' key={item.id} data={item}/>
            })
          }
        </div>
      </div>
    </div>
  );
}

export default App;
