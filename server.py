#!/usr/bin/env python
# -*- coding: utf-8 -*-
# ┬ ┬┌─┐┬ ┬┌─┐┌┐┌ ┌─┐┌─┐┌┬┐
# │││└─┐├─┤│ ││││ │  │ ││││
# └┴┘└─┘┴ ┴└─┘┘└┘o└─┘└─┘┴ ┴
import pathlib

import pypst_web.bottle as bt

from apis.files import handle_file

ROOT_PATH = pathlib.Path(__file__).parent
WEB_ROOT_PATH = ROOT_PATH.parent / 'web'


@bt.route('/<path:re:(?:css|fonts|js)*>/<filename>')
def server_static(path, filename):
    return bt.static_file(filename, root=WEB_ROOT_PATH / path)


@bt.route('/<path:re:.*>')
def catch_page(path):
    return bt.static_file('index.html', root=WEB_ROOT_PATH)


@bt.get('/api/file')
def get_server():
    return {
        'data': handle_file(bt.request.query.get("path"))
    }


if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--bind', '-b', metavar='ADDRESS',
                        default='0.0.0.0',
                        help='Specify alternate bind address '
                             '[default: all interfaces]')
    parser.add_argument('port', action='store',
                        default=8000, type=int,
                        nargs='?',
                        help='Specify alternate port [default: 8000]')
    args = parser.parse_args()

    bt.run(host=args.bind, port=args.port)
