//
//  ur-encoder.cpp
//
//  Copyright © 2020 by Blockchain Commons, LLC
//  Licensed under the "BSD-2-Clause Plus Patent License"
//

#include "ur-encoder.hpp"
#include "bytewords.hpp"
#include <cstring>
#include "emscripten.h"

extern "C" {

void EMSCRIPTEN_KEEPALIVE urcreate_encoder(void** const encoder, const char* type, const uint8_t* cbor, size_t cbor_len, size_t max_fragment_len, uint32_t first_seq_num, size_t min_fragment_len) {
    assert(encoder && !*encoder);
    ur::ByteVector bv(cbor, cbor + cbor_len);
    ur::UR ur(type, bv);
    *encoder = new(std::nothrow) ur::UREncoder(ur, max_fragment_len, first_seq_num, min_fragment_len);
    assert(*encoder);
}

void EMSCRIPTEN_KEEPALIVE urfree_encoder(void* const encoder) {
    if (encoder) {
        ur::UREncoder* urencoder = (ur::UREncoder*) encoder;
        delete urencoder;
    }
}

uint32_t EMSCRIPTEN_KEEPALIVE urseqnum_encoder(void* const encoder)
{
    assert(encoder);
    ur::UREncoder* urencoder = (ur::UREncoder*) encoder;
    return urencoder->seq_num();
}

uint32_t EMSCRIPTEN_KEEPALIVE urseqlen_encoder(void* const encoder)
{
    assert(encoder);
    ur::UREncoder* urencoder = (ur::UREncoder*) encoder;
    return urencoder->seq_len();
}

bool EMSCRIPTEN_KEEPALIVE uris_complete_encoder(void* const encoder) {
    assert(encoder);
    ur::UREncoder* urencoder = (ur::UREncoder*) encoder;
    return urencoder->is_complete();
}

bool EMSCRIPTEN_KEEPALIVE uris_single_part_encoder(void* const encoder) {
    assert(encoder);
    ur::UREncoder* urencoder = (ur::UREncoder*) encoder;
    return urencoder->is_single_part();
}

void EMSCRIPTEN_KEEPALIVE urnext_part_encoder(void* const encoder, char**next) {
    assert(encoder);
    ur::UREncoder* urencoder = (ur::UREncoder*) encoder;
    std::string encoded = urencoder->next_part();
    (*next) = (char*)malloc(encoded.size() + 1);
    strlcpy(*next, encoded.c_str(), encoded.size() + 1);
}

void EMSCRIPTEN_KEEPALIVE urfree_encoded_encoder(char * encoded) {
    free(encoded);
}

}


using namespace std;

namespace ur {

string UREncoder::encode(const UR& ur) {
    auto body = Bytewords::encode(Bytewords::style::minimal, ur.cbor());
    return encode_ur({ur.type(), body});
}

UREncoder::UREncoder(const UR& ur, size_t max_fragment_len, uint32_t first_seq_num, size_t min_fragment_len)
    : ur_(ur),
    fountain_encoder_(FountainEncoder(ur.cbor(), max_fragment_len, first_seq_num, min_fragment_len))
{
}

std::string UREncoder::next_part() {
    auto part = fountain_encoder_.next_part();
    if(is_single_part()) {
        return encode(ur_);
    } else {
        return encode_part(ur_.type(), part);
    }
}

string UREncoder::encode_part(const string& type, const FountainEncoder::Part& part) {
    auto seq = to_string(part.seq_num()) + "-" + to_string(part.seq_len());
    auto body = Bytewords::encode(Bytewords::style::minimal, part.cbor());
    return encode_ur({type, seq, body});
}

string UREncoder::encode_uri(const string& scheme, const StringVector& path_components) {
    auto path = join(path_components, "/");
    return join({scheme, path}, ":");
}

string UREncoder::encode_ur(const StringVector& path_components) {
    return encode_uri("ur", path_components);
}

}
