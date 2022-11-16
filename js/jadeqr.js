var qrTransport = function() {
    const videoElem = document.getElementById('video');
    var decoder_ptr = Module._malloc(4);
    Module.setValue(decoder_ptr, null, '*');
    ccall('urcreate_decoder', null, [['number']], [[decoder_ptr]]);
    var last_result = '';

    const onResult = function(result, qrScanner) {
        console.log('MATCH');
        if (result.data == last_result) {
            return;
        }
        const decoder_deref = Module.getValue(decoder_ptr, '*');
        var result_receive = ccall(
            'urreceive_part_decoder', 'number', ['number', 'string'],
            [decoder_deref, result.data]);
        last_result = result.data;
        var is_complete = ccall(
            'uris_complete_decoder', 'number', ['number'], [decoder_deref]);
        if (is_complete) {
            qrScanner.stop();
            var decoder_res_ptr = Module._malloc(4);
            var decoder_len_ptr = Module._malloc(4);
            var result_type_str = Module._malloc(4);

            ccall(
                'urresult_ur_decoder', null,
                ['number', [['number']], 'number', [['number']]], [
                    decoder_deref, [[decoder_res_ptr]], decoder_len_ptr,
                    [[result_type_str]]
                ]);

            let cbor_data = new Uint8Array(
                Module.HEAPU8.buffer, Module.getValue(decoder_res_ptr, '*'),
                Module.getValue(decoder_len_ptr, 'i32'));

            let decoded = cbor.decodeAllSync(cbor_data);
            // FIXME: clean up decoder
            console.log(decoded);
            console.log("Doing a fetch");
            console.log(new Date());
            fetch(
                decoded[0]['result']['http_request']['params']['urls'][0],
                {method: 'POST'})
                .then(function(response) {
                    return response.json();
                })
                .then(function(data) {
                    // at this point we show a qrcode on the web page and ask
                    // user to scan it with jade
                    const encoded = cbor.encode({
                        'id': '0',
                        'method':
                            decoded[0]['result']['http_request']['on-reply'],
                        'params': data
                    });
                    var encoder_ptr = Module._malloc(4);
                    Module.setValue(encoder_ptr, null, '*');
                    ccall(
                        'urcreate_encoder', null,
                        [
                            ['number'], 'string', 'array', 'number', 'number',
                            'number', 'number'
                        ],
                        [
                            [encoder_ptr], 'jade-pin', encoded, encoded.length,
                            250, 0, 8
                        ]);
                    const encoder_deref = Module.getValue(encoder_ptr, '*');
                    var next_piece = Module._malloc(4);
                    var qrs = [];
                    while (true) {
                        var is_complete = ccall(
                            'uris_complete_encoder', 'number', ['number'],
                            [encoder_deref]);
                        if (is_complete) {
                            break;
                        }
                        ccall(
                            'urnext_part_encoder', null,
                            ['number', [['number']]],
                            [encoder_deref, [[next_piece]]]);
                        const next_deref = Module.getValue(next_piece, '*');
                        qrs.push(UTF8ToString(next_deref).toUpperCase());
                    }
                    var qrcode_instance = null;

                    const qr = document.getElementById('qrcode');
                    timeout = null;
                    let qr_updater = function(counter) {
                        if (qrcode_instance) {
                            qrcode_instance.clear();
                            qrcode_instance.makeCode(qrs[counter]);
                        } else {
                            qr.classList.remove('hidden');
                            qrcode_instance = new QRCode('qrcode', {
                                text: qrs[counter],
                                width: 256 * 3,
                                height: 256 * 3,
                                colorDark: '#000000',
                                colorLight: '#ffffff',
                                correctLevel: QRCode.CorrectLevel.L
                            });
                        }
                        console.log(qrs[counter]);
                        if (counter + 1 >= qrs.length) {
                            counter = -1;
                        }
                        timeout = setTimeout(function() {
                            qr_updater(counter + 1)
                        }, 1500);
                    };
                    qr_updater(0);
                    // at this point we show a button to go back to scan
                    const next_btn = document.getElementById('nextstep');
                    next_btn.classList.remove('hidden');
                    next_btn.onclick = function() {
                        console.log('We did something yay');
                        clearTimeout(timeout);
                        decoder_ptr = Module._malloc(4);
                        Module.setValue(decoder_ptr, null, '*');
                        ccall(
                            'urcreate_decoder', null, [['number']],
                            [[decoder_ptr]]);
                        next_btn.classList.add('hidden');
                        qrcode_instance.clear();
                        qr.classList.add('hidden');
                        qrScanner.start();
                    }
                })
                .catch(function(err) {
                    console.log('failed to hit pin server url');
                    console.log(err);
                });
        }
    };

    const qrScanner =
        new QrScanner(videoElem, result => onResult(result, qrScanner), {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
        });
    qrScanner.start();
};

var Module = {
    preRun: [],
    postRun: [qrTransport],
};
