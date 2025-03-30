{pkgs}: {
  deps = [
    pkgs.rustc
    pkgs.openssl
    pkgs.libiconv
    pkgs.cargo
    pkgs.lsof
    pkgs.psmisc
    pkgs.mysql-client
    pkgs.mysql
    pkgs.pkg-config
    pkgs.libmysqlclient
    pkgs.zlib
    pkgs.tk
    pkgs.tcl
    pkgs.openjpeg
    pkgs.libxcrypt
    pkgs.libwebp
    pkgs.libtiff
    pkgs.libjpeg
    pkgs.libimagequant
    pkgs.lcms2
    pkgs.freetype
    pkgs.zip
    pkgs.postgresql
  ];
}
