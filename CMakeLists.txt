if(DEFINED ESP_PLATFORM AND ESP_PLATFORM EQUAL 1)
    idf_component_register(SRC_DIRS "src"
            PRIV_REQUIRES mbedtls cbor
            INCLUDE_DIRS "src")

    target_compile_features(${COMPONENT_LIB} PRIVATE cxx_std_20)
    target_compile_options(${COMPONENT_LIB} PRIVATE -ffast-math)
else()
    file(GLOB_RECURSE COMPONENT_SOURCES "src/*.c" "src/*.cpp")
    add_library(bcur STATIC ${COMPONENT_SOURCES})
    set_target_properties(bcur PROPERTIES POSITION_INDEPENDENT_CODE ON)
    target_compile_features(bcur PRIVATE cxx_std_20)
    target_compile_options(bcur PRIVATE -ffast-math -fno-exceptions -fno-rtti)
    target_include_directories(bcur PUBLIC "src")
    target_include_directories(bcur PRIVATE ${CBOR_INCLUDE_DIR} ${ESP_MOCKED})
endif()
