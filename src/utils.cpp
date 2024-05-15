//
//  utils.cpp
//
//  Copyright © 2020 by Blockchain Commons, LLC
//  Licensed under the "BSD-2-Clause Plus Patent License"
//

#include "utils.hpp"

#include <array>
#include <vector>
#include <algorithm>
#include <cctype>


using namespace std;

namespace ur {

ByteVector string_to_bytes(const string& s) {
    return {s.begin(), s.end()};
}

string data_to_hex(const ByteVector& in) {
    const string hex = "0123456789abcdef";
    string result;
    for(auto c: in) {
        result.append(1, hex[(c >> 4) & 0xF]);
        result.append(1, hex[c & 0xF]);
    }
    return result;
}

string data_to_hex(uint32_t n) {
    return data_to_hex(int_to_bytes(n));
}

ByteVector int_to_bytes(uint32_t n) {
    ByteVector b;
    b.reserve(4);
    b.push_back((n >> 24 & 0xff));
    b.push_back((n >> 16) & 0xff);
    b.push_back((n >> 8) & 0xff);
    b.push_back(n & 0xff);
    return b;
}

uint32_t bytes_to_int(const ByteVector& in) {
    assert(in.size() >= 4);
    uint32_t result = 0;
    result |= in[0] << 24;
    result |= in[1] << 16;
    result |= in[2] << 8;
    result |= in[3];
    return result;
}

string join(const StringVector &strings, const string &separator) {
    std::string result;
    size_t total_size = 0;
    for (const auto& s : strings) {
        total_size += s.size();
    }
    if (!strings.empty()) {
        result.reserve(total_size
                        + (separator.size() * (strings.size() - 1))
                        + 1);  // extra 1 in case of nul-terminator
    }
    bool first = true;
    for (const auto& s : strings) {
        if (!first) {
            result += separator;
        }
        result += s;
        first = false;
    }
    return result;
}

StringVector split(const string& s, char separator) {
	StringVector result;
	string buf;

	for(auto c: s) {
		if(c != separator) {
            buf += c;
        } else if(buf.length() > 0) {
            result.push_back(buf);
            buf = "";
        }
	}

	if(!buf.empty()) {
        result.push_back(buf);
    }

	return result;
}

StringVector partition(const string& s, size_t size) {
    StringVector result;
    auto remaining = s;
    while(remaining.length() > 0) {
        result.push_back(take_first(remaining, size));
        remaining = drop_first(remaining, size);
    }
    return result;
}

string take_first(const string &s, size_t count) {
    auto first = s.begin();
    auto c = min(s.size(), count);
    auto last = first + c;
    return {first, last};
}

string drop_first(const string& s, size_t count) {
    if(count >= s.length()) { return ""; }
    return {s.begin() + count, s.end()};
}

void xor_into(ByteVector& target, const ByteVector& source) {
    auto count = target.size();
    assert(count == source.size());
    for(int i = 0; i < count; i++) {
        target[i] ^= source[i];
    }
}

ByteVector xor_with(const ByteVector& a, const ByteVector& b) {
    auto target = a;
    xor_into(target, b);
    return target;
}

bool is_ur_type(char c) {
    if('a' <= c && c <= 'z') return true;
    if('0' <= c && c <= '9') return true;
    if(c == '-') return true;
    return false;
}

bool is_ur_type(const string& s) {
    return none_of(s.begin(), s.end(), [](auto c) { return !is_ur_type(c); });
}

string to_lowercase(const string& s) {
    string result;
    transform(s.begin(), s.end(), back_inserter(result), [](char c){ return tolower(c); });
    return result;
}

bool has_prefix(const string& s, const string& prefix) {
    return s.rfind(prefix, 0) == 0;
}

}
