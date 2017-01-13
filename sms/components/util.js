const weekname = ['零', '一', '二', '三', '四', '五', '六', '日'];
function formatTime(target, now) {
  let time = '';
  let year = target.getYear();
  let month = target.getMonth();
  let date = target.getDate();
  let day = target.getDay();
  if(year < now.getYear()) {
    time = `${(1900 + year)}年`;
  } else if (month < now.getMonth()) {
    time = `${(month + 1)}月${date}`;
  } else if (date > now.getDate() - (now.getDay() - 1)) {
    time = `周${weekname[day]}`;
  }
  return time;
}

function json2Form(json) {  
    var str = [];  
    for(var p in json){  
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]));  
    }  
    return str.join("&");  
}

module.exports = {
  formatTime: formatTime,
  json2Form: json2Form
}
