const browser = bowser.getParser(window.navigator.userAgent);
// UI elements
const mainContainer = document.getElementsByTagName('main')[0];
const controls = document.querySelector('.controls');
const prev_btn = document.getElementById('backstep');
const stepIcon = document.getElementById('step-icon');
const stepInfo = document.getElementById('step-info');
const title = document.getElementById('title');
const subtitle = document.getElementById('subtitle');
const finalImg = document.getElementById('finalImg');
const heroImg = document.getElementById('heroImg');
const videoElem = document.getElementById('video');
// const qrCode = document.getElementById('qrcode');
const next_btn = document.getElementById('nextstep');
const qr = document.getElementById('qrcode');
const helpText = document.getElementById('helptext');
const progressBarElem = document.getElementById('progressbar');
const exploreLink = document.getElementById('explore');
// const labelProgressElem = document.getElementById('labelprogressbar');
const errorCameraMsg = document.getElementById('camera-error');

// End UI elements

// State
const screen = ["start", "stepOne", "stepTwo", "stepThree", "stepFour", "final"];
let setScreen = "start";

// End State

function openHome(){
    window.open('/pinqr/', '_self');
}

function eventScreenOne() {
    setScreen = screen[1];
    showStepOne();
}

function eventScreenThree() {
    setScreen = screen[3];
    showStepThree();
}

function eventScreenFinal() {
    setScreen = screen[5];
    showFinal();
}

// Control UI elements
function showStart(){
    setScreen = screen[0];
    errorCameraMsg.classList.add('hidden');
    prev_btn.removeEventListener('click', showStart);
    prev_btn.addEventListener('click', openHome)
    next_btn.classList.remove('hidden');
    if(setScreen === 'start') {
        next_btn.addEventListener('click', eventScreenOne);
    }
    stepIcon.classList.add('hidden');
    stepInfo.classList.add('hidden');
    title.innerText = 'Enter your PIN on Jade to Unlock';
    subtitle.innerText = "Unlock your Jade to continue";
    videoElem.classList.add('hidden');
    heroImg.classList.remove('hidden');
    progressBarElem.classList.add('hidden');
}

function showStepOne(){
    qrTransport();
    if(setScreen === 'stepOne') {
        next_btn.removeEventListener('click', eventScreenOne);
    }
    errorCameraMsg.classList.add('hidden');
    videoElem.style.backgroundImage = './images/background.svg';
    // console.log(browser.getBrowser().name);
    if (browser.getBrowser().name !== 'Safari'){
        checkIfCameraIsEnabled();
    }
    stepIcon.classList.remove('hidden');
    stepInfo.innerText = 'STEP 1 OF 4';
    stepInfo.classList.remove('hidden');
    title.innerText = 'Scan QR on Jade';
    subtitle.innerText = "Locate your Jade's blind oracle";
    heroImg.classList.add('hidden');
    videoElem.classList.remove('hidden');
    progressBarElem.classList.remove('hidden');
    next_btn.classList.add('hidden');
    helpText.classList.add('hidden');
    prev_btn.removeEventListener('click', openHome);
}

function showStepTwo(){
    setScreen = screen[2];
    prev_btn.removeEventListener('click', showStart);
    controls.style.justifyContent = 'flex-end';
    prev_btn.classList.add('hidden');
    console.log('this is step 2');
    videoElem.classList.add('hidden');
    stepIcon.src="./images/shield-check-light.svg";
    stepInfo.innerText = 'STEP 2 OF 4';
    title.innerText = 'Scan the QR code';
    subtitle.innerText = 'Establish secure channel';
    qr.classList.remove('hidden');
    qr.style.display = "flex";
    progressBarElem.classList.add('hidden');
    next_btn.innerText = 'Next';
    if(setScreen === 'stepTwo') {
        next_btn.addEventListener('click', eventScreenThree);
    }
    helpText.classList.remove('hidden');
}

function showStepThree(){
    setScreen = screen[3];
    console.log('this is step 3');
    controls.style.justifyContent = 'space-between';
    prev_btn.classList.remove('hidden');
    videoElem.classList.remove('hidden');
    stepIcon.src="./images/device-mobile-camera.svg";
    stepInfo.innerText = 'STEP 3 OF 4';
    title.innerText = 'Scan QR on Jade';
    subtitle.innerText = 'Provide PIN data';
    // qrCode.classList.remove('hidden');
    qr.style.display = "none";
    progressBarElem.classList.remove('hidden');
    helpText.classList.add('hidden');
}

function showStepFourth() {
    setScreen = screen[4];
    console.log('this is step 4');
    controls.style.justifyContent = 'flex-end';
    prev_btn.classList.add('hidden');
    videoElem.classList.add('hidden');
    stepIcon.src="./images/checks-light.svg";
    stepInfo.innerText = 'STEP 4 OF 4';
    title.innerText = 'Scan the QR code';
    subtitle.innerText = 'Validate PIN entry';
    qr.classList.remove('hidden');
    qr.style.display = "flex";
    progressBarElem.classList.add('hidden');
    next_btn.innerText = 'Done';
    helpText.classList.remove('hidden');
    if(setScreen === 'stepFour') {
        next_btn.removeEventListener('click', eventScreenThree);
        next_btn.addEventListener('click', eventScreenFinal);
    }
}

function showFinal(){
    next_btn.onclick = null;
    setScreen = screen[5];
    console.log('this is final step');
    controls.style.display = "none";
    finalImg.classList.remove('hidden');
    stepIcon.classList.add('hidden');
    stepInfo.innerText = 'CONGRATULATIONS!';
    title.innerText = "You are now all set! Enjoy your Jade QR Mode";
    subtitle.innerText = "Visit Jade QR compatible companion apps";
    videoElem.classList.add('hidden');
    qr.style.display = "none";
    helpText.classList.add('hidden');
    progressBarElem.classList.add('hidden');
    exploreLink.classList.remove('hidden');
    exploreLink.style.display = "flex";
    next_btn.removeEventListener('click', eventScreenFinal);
}


// End Control UI elements
// Check if a camera is enabled on the browser
function checkIfCameraIsEnabled(){
    navigator.mediaDevices.enumerateDevices()
    .then(function(devices) {
      var hasCamera = devices.some(function(device) {
        return device.kind === 'videoinput';
      });
      if(hasCamera){
        navigator.permissions.query({ name: 'camera' }).then(function(permissionStatus) {
          if(permissionStatus.state !== 'granted') {
            console.log("Permission denied for the camera");
            errorCameraMsg.classList.remove('hidden');
            videoElem.style.backgroundImage = "none";
          }
        });
      } else {
        errorCameraMsg.classList.remove('hidden');
        videoElem.style.backgroundImage = "none";
        console.log("Web camera is not available");
        // alert("Web camera is not available");
      }
    })
    .catch(function(error) {
      console.log("Error occurred: " + error);
    });
}

//

var qrTransport = function() {
    // const videoElem = document.getElementById('video');
    // const progressBarElem = document.getElementById('progressbar');
    // const labelProgressElem = document.getElementById('labelprogressbar');

    if(setScreen === "start"){
        console.log('start screen is active');
        showStart();
    } else if (setScreen === "final") {
        showFinal();
    } else {
        console.log('scanning...');
        let decoder_ptr = Module._malloc(4);
        Module.setValue(decoder_ptr, null, '*');
        ccall('urcreate_decoder', null, [['number']], [[decoder_ptr]]);
        let last_result = '';

        const onResult = function(result, qrScanner) {
            // console.log(result.data);
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
            // labelProgressElem.classList.add('hidden');
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
                            [encoder_ptr], 'jade-pin', encoded, encoded.length, 10,
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

                    // const qr = document.getElementById('qrcode');
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
                        }, 3000);
                    };
                    qr_updater(0);
                    if( setScreen === "stepOne") {
                        showStepTwo();
                    } else if (setScreen === "stepTwo") {
                        showStepThree();
                    } else if (setScreen === "stepThree") {
                        showStepFourth();
                        qrScanner.stop();
                        qrScanner.destroy();
                        qrScanner = null;
                    }
                    
                    // at this point we show a button to go back to scan
                    // FIXME: don't show button again if this is the final step or rename to restart
                    // const next_btn = document.getElementById('nextstep');
                    next_btn.classList.remove('hidden');


                    // REMOVE THIS EVENT LISTENER ON THE FINAL SCREEN TO FIX THE ERROR
                    // -------------------
                    //
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
                        // labelProgressElem.classList.remove('hidden');
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
        function stopCamera() {
            qrScanner.stop();
            qrScanner.destroy();
            // qrScanner = null;
            showStart();
            console.log(setScreen);
            console.log("camera stopped");
        }
        prev_btn.addEventListener("click", ()=> {
            stopCamera();
            console.log('prev btn clicked');
            
        });
    }
}

var Module = {
    preRun: [],
    postRun: [qrTransport],
};
