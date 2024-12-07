const API_URL = "https://trip-wiki-api.vercel.app";

export const request = async (startIdx, region, sortBy, searchWord) => {
  try {
    let url = `${API_URL}`;

    // 지역이 ALL이 아닐 때
    if (region && region !== "ALL") {
      url += `/${region}?start=${startIdx}`;
    } else {
      url += `/?start=${startIdx}`;
    }

    // 정렬 필터가 존재한다면
    if (sortBy) {
      url += `&sort=${sortBy}`;
    }

    // 검색어가 존재한다면
    if (searchWord) {
      url += `&search=${searchWord}`;
    }

    console.log(url);

    const response = await fetch(url);

    if (response) {
      let data = await response.json();
      return data;
    }
  } catch (err) {
    console.log(err);
  }
};
