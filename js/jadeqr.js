var qrTransport = function() {
    const videoElem = document.getElementById('video');
    const progressBarElem = document.getElementById('progressbar');
    const labelProgressElem = document.getElementById('labelprogressbar');
    let decoder_ptr = Module._malloc(4);
    Module.setValue(decoder_ptr, null, '*');
    ccall('urcreate_decoder', null, [['number']], [[decoder_ptr]]);
    let last_result = '';

    const onResult = function(result, qrScanner) {
        if (result.data == last_result) {
            return;
        }
        let decoder_deref = Module.getValue(decoder_ptr, '*');
        const result_receive = ccall(
            'urreceive_part_decoder', 'number', ['number', 'string'],
            [decoder_deref, result.data]);
        last_result = result.data;
        var received = ccall(
            'urreceived_parts_count_decoder', 'number', ['number'], [decoder_deref]);
        var expected = ccall(
            'urexpected_part_count_decoder', 'number', ['number'], [decoder_deref]);
        progressBarElem.setAttribute('max', expected);
        progressBarElem.setAttribute('value', received);
        var is_complete = ccall(
            'uris_complete_decoder', 'number', ['number'], [decoder_deref]);
        if (!is_complete) {
            return;
        }
        labelProgressElem.classList.add('hidden');
        progressBarElem.classList.add('hidden');
        progressBarElem.setAttribute('max', 10);
        progressBarElem.setAttribute('value', 0);
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

        const decoded = cbor.decodeAllSync(cbor_data);
        ccall('urfree_decoder', null, [['number']], decoder_deref);
        cbor_data = null;
        decoder_deref = null;
        Module._free(decoder_ptr);
        const isonion =
            document.location.hostname.split('.').at(-1) === 'onion';
        let url = decoded[0]['result']['http_request']['params']['urls'][0];

        if (isonion) {
            for (const u in
                 decoded[0]['result']['http_request']['params']['urls']) {
                // FIXME: this doesn't handle urls if there is a port in it
                if (u.substr(0, u.lastIndexOf('/')).endsWith('onion')) {
                    url = u;
                    break;
                }
            }
        }

        fetch(url, {
            method: 'POST',
            body: JSON.stringify(
                decoded[0]['result']['http_request']['params']['data'])
        })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                // at this point we show a qrcode on the web page and ask
                // user to scan it with jade
                const encoded = cbor.encode({
                    'id': '0',
                    'method': decoded[0]['result']['http_request']['on-reply'],
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
                        [encoder_ptr], 'jade-pin', encoded, encoded.length, 400,
                        0, 8
                    ]);
                let encoder_deref = Module.getValue(encoder_ptr, '*');
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
                        'urnext_part_encoder', null, ['number', [['number']]],
                        [encoder_deref, [[next_piece]]]);
                    const next_deref = Module.getValue(next_piece, '*');
                    qrs.push(UTF8ToString(next_deref).toUpperCase());
                }

                ccall('urfree_encoder', null, [['number']], encoder_deref);
                encoder_deref = null;
                Module._free(encoder_ptr);
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
                    if (counter + 1 >= qrs.length) {
                        counter = -1;
                    }
                    timeout = setTimeout(function() {
                        qr_updater(counter + 1)
                    }, 5000);
                };
                qr_updater(0);
                // at this point we show a button to go back to scan
                // FIXME: don't show button again if this is the final step or rename to restart
                const next_btn = document.getElementById('nextstep');
                next_btn.classList.remove('hidden');
                next_btn.onclick = function() {
                    clearTimeout(timeout);
                    decoder_ptr = Module._malloc(4);
                    Module.setValue(decoder_ptr, null, '*');
                    ccall(
                        'urcreate_decoder', null, [['number']],
                        [[decoder_ptr]]);
                    next_btn.classList.add('hidden');
                    qrcode_instance.clear();
                    qr.classList.add('hidden');
                    qr.innerHTML = '';
                    qrScanner.start();
                    progressBarElem.classList.remove('hidden');
                    labelProgressElem.classList.remove('hidden');
                }
            })
            .catch(function(err) {
                console.log('failed to hit pin server url');
                console.log(err);
            });
    };

    const qrScanner =
        new QrScanner(videoElem, result => onResult(result, qrScanner), {
            returnDetailedScanResult: true,
            highlightScanRegion: true,
            highlightCodeOutline: true,

        });
    qrScanner.start();
};

var Module = {
    preRun: [],
    postRun: [qrTransport],
};
