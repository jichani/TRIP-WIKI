import Header from "./components/Header.js";
import RegionList from "./components/RegionList.js";
import CityList from "./components/CityList.js";
import CityDetail from "./components/CityDetail.js";

import { request } from "./components/api.js";

export default function App($app) {
  // 새로고침을 위해 값을 가져오는 메서드
  const getSortBy = () => {
    if (window.location.search) {
      return window.location.search.split("sort=")[1].split("&")[0];
    }
    return "total";
  };
  const getSearchWord = () => {
    if (window.location.search && window.location.search.includes("search=")) {
      return window.location.search.split("search=")[1];
    }
    return "";
  };

  this.state = {
    startIdx: 0,
    sortBy: getSortBy(),
    searchWord: getSearchWord(),
    region: "",
    cities: "",
  };

  const header = new Header({
    $app,
    initialState: { sortBy: this.state.sortBy, searchWord: this.state.searchWord },
    // 정렬 기준 변경 메서드
    handleSortChange: async sortBy => {
      const pageUrl = `/${this.state.region}?sort=${sortBy}`;
      // 페이지 이동
      history.pushState(null, null, this.state.searchWord ? pageUrl + `&search=${this.state.searchWord}` : pageUrl);
      // 정렬기준이 변경되었기 때문에 startIndex는 0으로 시작
      const cities = await request(0, this.state.region, sortBy, this.state.searchWord);
      this.setState({
        ...this.state,
        startIdx: 0,
        sortBy: sortBy,
        cities: cities,
      });
    },
    // 검색 메서드 (값을 입력받고 엔터키를 클릭 시 발생할 이벤트)
    handleSearch: async searchWord => {
      history.pushState(null, null, `/${this.state.region}?sort=${this.state.sortBy}&search=${searchWord}`);
      const cities = await request(0, this.state.region, this.state.sortBy, searchWord);
      this.setState({
        ...this.state,
        startIdx: 0,
        searchWord: searchWord,
        cities: cities,
      });
    },
  });
  const regionList = new RegionList({
    $app,
    initialState: this.state.region,
    handleRegion: async region => {
      history.pushState(null, null, `/${region}/sort=total`);
      const cities = await request(0, region, "total");
      this.setState({
        ...this.state,
        startIdx: 0,
        sortBy: "total",
        region: region,
        searchWord: "",
        cities: cities,
      });
    },
  });

  const cityList = new CityList({
    $app,
    initialState: this.state.cities,
    // 더보기 클릭 메서드
    handleLoadMore: async () => {
      const newStartIdx = this.state.startIdx + 40;

      const newCities = await request(newStartIdx, this.state.region, this.state.sortBy, this.state.searchWord);

      this.setState({
        ...this.state,
        startIdx: newStartIdx,
        cities: {
          cities: [...this.state.cities.cities, ...newCities.cities],
          isEnd: newCities.isEnd,
        },
      });
    },
  });

  const cityDetail = new CityDetail();

  this.setState = newState => {
    this.state = newState;
    cityList.setState(this.state.cities);
    header.setState({ sortBy: this.state.sortBy, searchWord: this.state.searchWord });
    regionList.setState(this.state.region);
  };

  // 뒤로가기 앞으로가기 시 발생하는 이벤트
  window.addEventListener("popstate", async () => {
    const urlPath = window.location.pathname;

    const prevRegion = urlPath.replace("/", "");
    const prevSortBy = getSortBy();
    const prevSearchWord = getSearchWord();
    const prevStartIdx = 0;
    const prevCities = await request(prevStartIdx, prevRegion, prevSortBy, prevSearchWord);

    this.setState({
      ...this.state,
      startIdx: prevStartIdx,
      sortBy: prevSortBy,
      region: prevRegion,
      searchWord: prevSearchWord,
      cities: prevCities,
    });
  });

  const init = async () => {
    const cities = await request(this.state.startIdx, this.state.region, this.state.sortBy, this.state.searchWord);
    this.setState({
      ...this.state,
      cities: cities,
    });
  };

  init();
}
