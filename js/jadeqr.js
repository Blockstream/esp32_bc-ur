var qrTransport = function() {
    const videoElem = document.getElementById('video');
    var decoder_ptr = Module._malloc(4);
    ccall('urcreate_decoder', null, ['number'], [decoder_ptr]);

    const onResult = function(result, qrScanner) {
        console.log('decoded qr code:', result);
        var result_receive = ccall(
            'urreceive_part_decoder', 'number', ['number', 'string'],
            [decoder_ptr, result.data]);
        console.log(result_receive);
        console.assert(result_receive);
        var is_complete =
            ccall('uris_complete_decoder', 'number', ['number'], [decoder_ptr]);
        console.log(is_complete);
        if (is_complete) {
            qrScanner.stop();
        }
    };

    const qrScanner =
        new QrScanner(videoElem, result => onResult(result, qrScanner), {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
        });
    qrScanner.start();
    return;


    // void urresult_ur_decoder(void* const decoder, uint8_t** result, size_t*
    // result_len, const char** type) {
    var result_ptr = Module._malloc(4);
    var result_len_ptr = Module._malloc(4);
    var type_ptr = Module._malloc(4);
    ccall(
        'urresult_ur_decoder', null, ['number', 'number', 'number', 'number'],
        [decoder_ptr, result_ptr, result_len_ptr, type_ptr]);
    console.log(UTF8ToString(getValue(result_ptr, '*')));

    Module._free(type_ptr);
    Module._free(result_len_ptr);
    Module._free(result_ptr);
    Module._free(decoder_ptr);
    /*
    var instance = new Module.VectorUint8_t();
    console.log(instance);
    instance.delete();
    var decoder = new Module.URDecoder();
    console.log(decoder);
    var done = decoder.receive_part(bcur_bip39);
    console.log(done);
    decoder.delete();
     */
};

var Module = {
    preRun: [],
    postRun: [qrTransport],
};
