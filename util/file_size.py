#!/usr/bin/env python3
# encoding: utf-8

"""
@Time    : 2020/1/8 15:51
@Author  : Skogen
@Email   : muumlover@live.com
@Blog    : https://blog.ronpy.com
@Project : zeronas
@FileName: file_size
@Software: PyCharm
@license : (C) Copyright 2019 by Sam Wang. All rights reserved.
@Desc    : 
    
"""

SUFFIXES = {1000: ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            1024: ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']}


def approximate_size(size, a_kilobyte_is_1024_bytes=True):
    """Convert a file size to human-readable form.

    Keyword arguments:
    size -- file size in bytes
    a_kilobyte_is_1024_bytes -- if True (default), use multiples of 1024
                                if False, use multiples of 1000

    Returns: string

    """
    if size < 0:
        raise ValueError('number must be non-negative')

    multiple = 1024 if a_kilobyte_is_1024_bytes else 1000
    for suffix in SUFFIXES[multiple]:
        if size < multiple:
            return '{0:.1f} {1}'.format(size, suffix)
        size = 1.0 * size / multiple

    raise ValueError('number too large')
