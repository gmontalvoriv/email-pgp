// Decrypt Worker
//
// Decrypting function of openpgpjs takes too much time. This worked will
// prevent UI freezing.

var openpgp = require('openpgp');

if (!process.send) {
  return console.error('This is an IPC worker. Use as is intended');
}

var d = require('domain').create();

var protocol = {
  SECRET_KEY: 1,
  PASSPHRASE: 2,
  ENCRYPTED_MESSAGE: 3,
  DECRYPT: 4,
  SECRET_KEY_DECRYPT_TIME: 5,
  MESSAGE_DECRYPT_TIME: 6,
  DECRYPTED_TEXT: 7,
  ERROR_OCCURRED: 8
}

d.on('error', function(err) {
  console.log('ERROR in program routine', err);
  process.send({ method: protocol.ERROR, error: err });

  process.exit(1);
});

//process.send({ hello: 'world', spam: 'meat' });

d.run(function() {
  var secretKey = null;
  var encryptedMessage = null;

  function decryptRoutine() {
    var startTime = process.hrtime();
    openpgp.decryptMessage(secretKey, encryptedMessage).then(function(text) {
      var elapsed = process.hrtime(startTime);
      secretKey = encryptedMessage = null
      process.send({ method: protocol.MESSAGE_DECRYPT_TIME, timeElapsed: elapsed });

      process.send({ method: protocol.DECRYPTED_TEXT, text: text });
    }, function(err) {
      d.run(function() {
        // Throw error to trigger crash
        throw err;
      });
    }).then(function() {
      process.exit(0);
    });
  }

  process.on('message', function(message) {
    if (message.method == protocol.SECRET_KEY) {
      console.log('parent sent secret key');
      secretKey = openpgp.key.readArmored(message.secretKey).keys[0];
    } else if (message.method == protocol.PASSPHRASE) {
      console.log('parent sent secret key passphrase');

      var startTime = process.hrtime();
      secretKey.decrypt(message.passphrase);
      var elapsed = process.hrtime(startTime);

      process.send({ method: protocol.SECRET_KEY_DECRYPT_TIME, timeElapsed: elapsed });
    } else if (message.method == protocol.ENCRYPTED_MESSAGE) {
      console.log('parent send encrypted message');
      encryptedMessage = openpgp.message.readArmored(message.encryptedMessage);
    } else if (message.method == protocol.DECRYPT) {
      decryptRoutine();
    }
  });
});