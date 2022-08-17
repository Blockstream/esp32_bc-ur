#ifndef BC_UR_CDECODER_H
#define BC_UR_CDECODER_H

extern "C" {
#include <stddef.h>
#include <stdint.h>

int urcreate_decoder(void** const decoder);
void urfree_decoder(void* const decoder);

bool urreceive_part_decoder(void* const decoder, const char* string);
bool uris_success_decoder(void* const decoder);
bool uris_failure_decoder(void* const decoder);
bool uris_complete_decoder(void* const decoder);
void urresult_ur_decoder(void* const decoder, uint8_t** result, size_t* result_len, const char** type);
}

#endif // BC_UR_CDECODER_H
