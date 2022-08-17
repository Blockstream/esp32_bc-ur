#!/bin/bash

rm -fr testbcur.html
rm -fr *.a src/*.a *.o src/*.o
rm -fr *.wasm src/*wasm

if [[ ! -f emsdk/emsdk_env.sh ]]; then
    git clone https://github.com/emscripten-core/emsdk.git
    pushd emsdk
    ./emsdk install latest
    ./emsdk activate latest
    popd
fi

source emsdk/emsdk_env.sh

num_jobs=4
if [ -f /proc/cpuinfo ]; then
    num_jobs=$(grep ^processor /proc/cpuinfo | wc -l)
fi


emconfigure ./configure
emmake make -j ${num_jobs}

# -s EXPORTED_FUNCTIONS=urcreate_decoder,urreceive_part_decoder,urfree_decoder,urreceive_part_decoder,uris_success_decoder,uris_failure_decoder,uris_complete_decoder,urresult_ur_decoder \
# FIXME: if we use linkable the result binary is much bigger but i can't seem to tell emcc which functions i want to export
emcc -O3 -v \
    -s EXPORTED_RUNTIME_METHODS=ccall,cwrap \
    ./src/libbc-ur.a \
    -s ASSERTIONS \
    -s LINKABLE \
    -o testbcur.html \
    -std=c++17 \
    --shell-file shell_minimal.html \
    --minify 0
