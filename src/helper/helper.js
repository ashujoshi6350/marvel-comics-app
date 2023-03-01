
export const formatData = (arr, key, delimiter) => {
  return arr.length > 0 ? arr.map((item => item[key])).join(delimiter) : '';
}
