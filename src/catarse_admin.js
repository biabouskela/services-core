alert("App lock and loaded!");

var adminApp = window.adminApp = {
  models:{}
};

var momentify = function(date, format) {
  format = format || "DD/MM/YYYY";
  return (date) ? moment(date).format(format) : "no date";
};

var momentFromString = function(date, format){
  var european = moment(date, format || 'DD/MM/YYYY');
  return european.isValid() ? european : moment(date);
};

var generateFormatNumber = function(s, c) {
  return function(number, n, x) {
    if(number == null || number == undefined) {
      return null
    }

    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')';
    var num = number.toFixed(Math.max(0, ~~n));
    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
  }
};

var formatNumber = generateFormatNumber('.', ',');

var toggleProp = function(defaultState, alternateState) {
  var p = m.prop(defaultState);
  p.toggle = function(){
    p(((p() === alternateState) ? defaultState : alternateState));
  };

  return p;
};
