#!/usr/bin/env python3
# encoding: utf-8

"""
@Time    : 2020/1/6 11:16
@Author  : Skogen
@Email   : muumlover@live.com
@Blog    : https://blog.ronpy.com
@Project : zeronas
@FileName: files
@Software: PyCharm
@license : (C) Copyright 2019 by Sam Wang. All rights reserved.
@Desc    : 
    
"""
import os
from datetime import datetime

from util.file_size import approximate_size


def get_ext(file_path):
    if not os.path.isfile(file_path):
        return '.dir'
    return os.path.splitext(file_path)[-1]


def get_size(file_path):
    if not os.path.isfile(file_path):
        return '-'
    return approximate_size(os.path.getsize(file_path))


def get_time(file_path):
    if not os.path.isfile(file_path):
        return '-'
    return datetime.fromtimestamp(os.path.getmtime(file_path)).strftime('%Y-%m-%d %H:%M:%S')


def get_url_path(file_path, base_path):
    return '/'.join(os.path.relpath(file_path, base_path).split(os.path.sep))


def get_files(base_path, target_path):
    file_list = []
    for file_name in os.listdir(target_path):
        file_path = os.path.join(target_path, file_name)
        file_list.append({
            'type': get_ext(file_path),
            'name': file_name,
            'path': '/' + get_url_path(file_path, base_path),
            'size': get_size(file_path),
            'time': get_time(file_path)
        })
    return file_list


def handle_file(path=""):
    base_path = 'd:/'

    target_path = base_path + path
    if os.path.isdir(target_path):
        return {'code': 0, 'message': '', 'type': '.dir', 'items': get_files(base_path, target_path)}
    else:
        pass
        # try:
        #     response = make_response(send_from_directory(*os.path.split(target_path), as_attachment=True))
        #     return response
        # except Exception as e:
        #     return jsonify({'code': -1, 'message': '{}'.format(e)})
