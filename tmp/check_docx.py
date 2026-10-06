import zipfile, sys, xml.etree.ElementTree as ET

def check_file(path, label):
    with zipfile.ZipFile(path) as z:
        for name in z.namelist():
            if name.endswith('.xml'):
                data = z.read(name)
                try:
                    ET.fromstring(data)
                except Exception as e:
                    print(f"FAILED [{label}] {name}: {e}")
                    # Print the exact line and column
                    # e has msg, filename, lineno, offset
                    lines = data.decode('utf-8', errors='ignore').split('\n')
                    print(f"Total lines: {len(lines)}")
                    sys.exit(1)
    print(f"PASSED [{label}]")

if __name__ == '__main__':
    check_file(sys.argv[1], sys.argv[2])
