
export const js_date_time = (unixtime) => {
  var dateTime = new Date(parseInt(unixtime))
  var year = dateTime.getFullYear();
  var month = dateTime.getMonth() + 1;
  var day = dateTime.getDate() <10 ? '0' + dateTime.getDate() : dateTime.getDate();
  var hour = dateTime.getHours() < 10 ? '0' + dateTime.getHours() : dateTime.getHours();
  var minute = dateTime.getMinutes() < 10 ? '0' + dateTime.getMinutes() : dateTime.getMinutes();
  var second = dateTime.getSeconds() < 10 ? '0' + dateTime.getSeconds() : dateTime.getSeconds();
  var now = new Date();
  var now_new = Date.parse(now.toDateString());  //typescript转换写法
  var milliseconds = now_new - dateTime;
  var timeSpanStr = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second;
  return timeSpanStr;
}

export const uniq = (array) => {
  var temp = [];
  var index = [];
  console.log('array', array)
  var l = array.length;
  for(var i = 0; i < l; i++) {
      for(var j = i + 1; j < l; j++){
          if (array[i] === array[j]){
              i++;
              j = i;
          }
      }
      temp.push(array[i]);
      index.push(i);
  }
  console.log(index);
  return temp;
}


