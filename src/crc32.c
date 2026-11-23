//
//  crc32.c
//
//  Copyright © 2020 by Blockchain Commons, LLC
//  Licensed under the "BSD-2-Clause Plus Patent License"
//

#include "crc32.h"
#include <stdbool.h>
#include <memory.h>

#ifdef ARDUINO
#define htonl(x) __builtin_bswap32((uint32_t) (x))
#elif _WIN32
#include <winsock2.h>
#else
#include <arpa/inet.h>
#endif

uint32_t ur_crc32(const uint8_t* bytes, size_t len) {
    static uint32_t table[256];
    static bool table_ready = false;

    if(!table_ready) {
        for(int i = 0; i < 256; i++) {
            uint32_t c = i;
            for(int j = 0; j < 8; j++) {
                c = (c % 2 == 0) ? (c >> 1) : (0xEDB88320 ^ (c >> 1));
            }
            table[i] = c;
        }
        table_ready = true;
    }

    uint32_t crc = ~0;
    for(int i = 0; i < len; i++) {
        uint32_t byte = bytes[i];
        crc = (crc >> 8) ^ table[(crc ^ byte) & 0xFF];
    }
    return ~crc;
}

uint32_t ur_crc32n(const uint8_t* bytes, size_t len) {
    return htonl(ur_crc32(bytes, len));
}
