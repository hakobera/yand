# Yet Another Node Document

Yand is a yet another Node.js documentation viewer.
This document is made from official [Node.js documentaion](http://nodejs.org/docs/latest/api/index.html)

# How to build specified version docs

You can build documents for specified Node.js version.

First, run `redis-server` for temporary datastore.

```sh
$ redis-server
```

Then run `make NODE_VERSION=(specified version) build` command.
If you want to build document for Node.js v0.8.18, run following command.

```sh
$ make NODE_VERSION=v0.8.18 build
```

## License

    (The MIT License)

    Copyright (c) 2013 Kazuyuki Honda <hakobera@gmail.com>

    Permission is hereby granted, free of charge, to any person obtaining
    a copy of this software and associated documentation files (the
    'Software'), to deal in the Software without restriction, including
    without limitation the rights to use, copy, modify, merge, publish,
    distribute, sublicense, and/or sell copies of the Software, and to
    permit persons to whom the Software is furnished to do so, subject to
    the following conditions:

    The above copyright notice and this permission notice shall be
    included in all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
    IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
    CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
    TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
    SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
    