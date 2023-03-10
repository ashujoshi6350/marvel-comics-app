import './App.css';
import { useEffect, useRef, useState } from 'react';
import { Card } from './components/cards/Card';
import MD5 from "crypto-js/md5";
import axios from 'axios';
import { FilterCarousel } from './components/filter/FilterCarousel';
import { formatData } from './helper/helper';
import { PageButtons } from './components/pagination/PageButtons';

function App() {
  const [filterData, setFilterData] = useState([]);
  const [filterArr, setFilterArr] = useState([]);
  const [cardsData, setCardsData] = useState([]);
  const [text, setText] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [offset, setOffset] = useState(0);
  const [isCardsLoading, setIsCardsLoading] = useState(false);
  const [isFiltersLoading, setIsFiltersLoading] = useState(false);

  const id = useRef(null);
  const isFirstLoad = useRef(true);
  const isSearchLoad = useRef(false);
  
  const limit = 20;
  const PUBLIC_KEY = process.env.REACT_APP_PUBLIC_KEY;
  const PRIVATE_KEY = process.env.REACT_APP_PRIVATE_KEY;
  const DEBOUNCE_DELAY = 500;
  const GET_COMICS_BASE_URL = 'https://gateway.marvel.com:443/v1/public/comics';

  const getUrl = () => {
    const ts = Date.now();
    const key = ts + PRIVATE_KEY + PUBLIC_KEY;
    const hash = MD5(key);
    let url = `${GET_COMICS_BASE_URL}?ts=${ts}&apikey=${PUBLIC_KEY}&hash=${hash}`;
    let filterQuery = formatData(filterArr, 'id', ',');
    let queryParams = {
      characters: filterQuery,
      titleStartsWith: text,
      limit,
      offset
    };
    Object.keys(queryParams).map(key => {
      if (queryParams[key] === 0 || queryParams[key]) {
        url = url + `&${key}=${queryParams[key]}`
      }
      return true
    });

    return url
  }

  useEffect(() => {
    if (isFirstLoad.current) {
      fetchCardAndFilterData();
      isFirstLoad.current = false;
    } else if (isSearchLoad.current) {
      if (id.current) {
        clearTimeout(id.current);
      }
      id.current = setTimeout(() => {
        fetchCardData();
        isSearchLoad.current = false;
      }, DEBOUNCE_DELAY)
    } else {
      fetchCardData();
    }
  }, [offset, filterArr, text]);

  const handleOffsetChange = (newOffset) => {
    setOffset(newOffset);
  }

  const handleSearch = (value) => {
    isSearchLoad.current = true;
    setText(value);
    setOffset(0);
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
    setOffset(0);
  }

  const fetchCardAndFilterData = async() => {
    setIsCardsLoading(true);
    let result = await getData();
    setCardsData(result.data.data.results);
    setTotalPages(Math.ceil(result.data.data.total / limit));
    setIsCardsLoading(false);
    setIsFiltersLoading(true);
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
      setIsFiltersLoading(false);
    });
  }

  const fetchCardData = async () => {
    setIsCardsLoading(true);
    let result = await getData();
    setCardsData(result.data.data.results);
    setTotalPages(Math.ceil(result.data.data.total / limit));
    setIsCardsLoading(false);
  }

  const getData = () => {
    const url = getUrl();
    return axios.get(url);
  }

  const resetFilters = () => {
    let data = filterData.map(val => {
      if (val.isSelected) {
        return {...val, isSelected: false}
      }
      return val
    });
    setFilterData(data);
    setFilterArr([]);
    setText('');
    setOffset(0);
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
      {isFiltersLoading ? <div className="filter-loader">
        <div className="shimmer"></div>
      </div> : filterData.length ? <FilterCarousel
        filterData={filterData}
        handleItemClick={handleItemClick}
        filterArr={filterArr}
        resetFilters={resetFilters}
      /> : null}
      <div className='cards-wrapper'>
        {isCardsLoading ? <div className='info'>
          Loading data...
        </div> : cardsData.length ? <>
          <div className='cards'>
            {
              cardsData.map(item => {
                return <Card className='card' key={item.id} data={item}/>
              })
            }
          </div>
          <div className='page-btns-wrapper'>
            <PageButtons
              handleOffsetChange={handleOffsetChange}
              limit={limit}
              offset={offset}
              totalPages={totalPages}
            />
          </div>
        </> : <div className='info'>
          Sorry, No comic found. Please try with different filters.
        </div>}
      </div>
    </div>
  );
}

export default App;
