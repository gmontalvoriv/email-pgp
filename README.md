
# Email PGP
## by Matt Bilker <me@mbilker.us>

### PROOF OF CONCEPT

Small package for decrypting PGP-encrypted email.

Currently only works with Facebook email, which is the only PGP-encrypted email
I receive.

Also, *currently* you need to stick your encrypted secret key at `$HOME/gpgkey`.
I am working on configuration options. The passphrase is also tricky. Currently
its embedded in the source code.

No spec tests are available for this package at the moment. I have not designed
them yet.

Do not trust the security of this package. It is not audited, fully tested,
or safe at all.
