var http = require('http'),
//    socket = require('socket.io'),
    fs = require('fs'),
//    io,
    recent_messages = [],
    messages = [];

var list_reverse = function (l) {
  var reversed = [],
      len = l.length,
      i = len - 1;

  for(i; i >= 0; i -= 1) {
    reversed[reversed.length] = l[i];
  };
  return reversed;
};

var sanitize = function (input) {
  var detector = input.toLowerCase();
  // strip out any foul attempts to be stupid
  if (
    detector.indexOf('<html') >= 0 ||
    detector.indexOf('<script') >= 0 ||
    detector.indexOf('<iframe') >= 0 ||
    detector.indexOf('<form') >= 0 ||
    detector.indexOf('<noscript') >= 0 ||
    detector.indexOf('<meta') >= 0
 ) {
    input = input.
      replace(/</g, '&lt;').
      replace(/>/g, '&gt;');
  } 

  // any blank lines get turned into paragraphs
  input = input.replace(/\r?\n/g, '<p />');
  return input;
};

var app = http.createServer(function (req, res) { 
  // Prevent caching in IE
  res.writeHead(200, {'Pragma': 'no-cache'});
  res.writeHead(200, {'Cache-Control': 'no-cache'});
  res.writeHead(200, {'Expires': -1});

  if (req.url === '/') {
    res.writeHead(200, {'Content-Type': 'text/html'});
    fs.readFile('./index.html', function (err, data) {
      if (err) { throw err; }
      res.end(data);
    });
  } else if (req.url === '/post') {
    req.on('data', function (data) { 
      messages.push(sanitize(data.toString()));
    });
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('OK');
  } else if (req.url === '/chat') {
    var buildStringResponse = function (list, resStr) {
      if (list.length == 0) {
        return resStr;  
      } else {
        return buildStringResponse(list.slice(1), resStr + '<li>' + list[0] + '</li>'); 
      }
    };

    var data = buildStringResponse(messages, "");

    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('<ul>' + data + '</ul>');
  } else if (req.url === '/latest') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end(messages[messages.length - 1]);
  } else {
    res.writeHead(404, {'Content-Type': 'text/plain'});
    res.end('File not found');  
  }
});

app.listen(3000);

// io = socket.listen(app);
// 
// io.sockets.on('connection', function (s) {
//   console.log('got a connection');
//   
//   s.on('wb_message', function (data, ack) {
//     recent_messages.push(data);
//     s.broadcast.emit('wb_message', data);
//     ack('OK');
//   });
// });

console.log('app listening on port 3000');
