content = open('src/assets/admin.css', 'rb').read(); content = content.replace(b'\x00', b''); content = content.replace(b'""', b''); open('src/assets/admin.css', 'wb').write(content)
