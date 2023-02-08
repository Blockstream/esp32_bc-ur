#!/bin/bash

rm -fr testbcur.html
rm -fr *.a src/*.a *.o src/*.o
rm -fr *.wasm src/*wasm

if [[ ! -f emsdk/emsdk_env.sh ]]; then
    git clone https://github.com/emscripten-core/emsdk.git
    pushd emsdk
    ./emsdk install 3.1.30
    ./emsdk activate 3.1.30
    popd
fi

source emsdk/emsdk_env.sh

num_jobs=4
if [ -f /proc/cpuinfo ]; then
    num_jobs=$(grep ^processor /proc/cpuinfo | wc -l)
fi


for filename in src/*.c; do
    emcc -gsource-map -v \
         -std=c99 \
         ${filename} \
    -s SAFE_HEAP=1 \
    -fsanitize=undefined \
    -s WARN_UNALIGNED=1 \
    -fsanitize=null \
    -Wcast-align -Wover-aligned \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s WASM=1 \
    -s ASSERTIONS=2 \
    -s STACK_OVERFLOW_CHECK=2 \
    -s ENVIRONMENT=web \
    -s EXIT_RUNTIME=0 \
         -c \
        -o ${filename}.o
done
em++ -gsource-map -v \
    src/*.o \
    --profiling \
    -fsanitize=undefined \
    -fsanitize=null \
    -std=c++17 \
    -s SAFE_HEAP=1 \
    -s ENVIRONMENT=web \
    -s WARN_UNALIGNED=1 \
    -s ALLOW_MEMORY_GROWTH=1 \
    -Wcast-align -Wover-aligned \
    -stdlib=libc++ \
     src/*.cpp \
    -s WASM=1 \
    -s ASSERTIONS=2 \
    -Wcast-align -Wover-aligned \
    -s STACK_OVERFLOW_CHECK=2 \
    -s EXIT_RUNTIME=0 \
    -s EXPORTED_RUNTIME_METHODS=ccall,cwrap,getValue,setValue \
    -o testbcur.html \
    --shell-file shell_minimal.html
