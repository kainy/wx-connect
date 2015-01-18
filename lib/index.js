/**
 * WXConnect
 * Copyright(c) 2014 tianxia <tianxia@tencent.com>
 * MIT Licensed
 */

var util = require('util');
var connect = require('connect');
var bodyParser = require('body-parser');

var message = require('./message');
var signature = require('./signature');

module.exports = wxConnect;

/**
 * wxConnect，基于connect实现对微信消息事件处理的简单封装
 *
 * @param config
 * @returns {*|exports}
 */
function wxConnect(config) {
  var app = connect();
  app.use(bodyParser.text({type: 'text/xml'})); // 获取请求体内容
  app.use(signature(config)); // 验证接受来自微信端发送的消息真实性
  app.use(message); // 解析微信端发送的XML消息

  app.onSubscribe=
  app.onUnsubscribe=
  app.onScan=
  app.onLocation=
  app.onClick=
  
  app.text=
  app.image=
  app.location=
  app.link=
  app.voice= function(){};
  app.unknow= function(req, res, next){
    res.text('请求异常，内容为:'+ util.inspect(req.message));
  }
  
  // 分派消息处理
  app.use(function(req, res, next) {
  
  var msgType= req.message.msgType;
  //事件推送
  if(msgType== 'event') {
    msgType= 'on'+ firstToUpperCase(req.message.event.toLowerCase());
  }
  
  if(app[msgType]){
    return app[msgType].call(app, req, res, next);
  }else{
    return app.unknow.call(app, req, res, next);
  }

  });

  // 默认消息处理，在消息/事件没有被分派时调用
  app.use(function(req, res, next) {
    res.text(util.inspect(req.message));
  });

  // 错误处理
  app.use(function(error, req, res, next) {
    console.log(error);
    res.text('' + error);
  });

  return app;
}

function firstToUpperCase( str ) {
  return str.substr(0, 1).toUpperCase() + str.substr(1);
}
