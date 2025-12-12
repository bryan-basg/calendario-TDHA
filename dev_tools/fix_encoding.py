import os

files = [
    "auth.py",
    "crud.py",
    "main.py",
    "models.py",
    "schemas.py",
    "verify_auth.py",
    "tests/test_api.py",
    ".env",
]

for filename in files:
    try:
        if not os.path.exists(filename):
            print(f"File not found: {filename}")
            continue

        print(f"Checking {filename}...")

        with open(filename, "rb") as f:
            header = f.read(10)
        print(f"  Header (hex): {header.hex()}")

        # Try reading as UTF-8
        try:
            with open(filename, "r", encoding="utf-8") as f:
                content = f.read()
            print(f"  - UTF-8: OK")
        except UnicodeDecodeError:
            print(f"  - UTF-8: FAIL")

            # Try reading as UTF-16 (little endian)
            try:
                with open(filename, "r", encoding="utf-16") as f:
                    content = f.read()
                print(f"  - UTF-16: OK. Converting to UTF-8...")

                with open(filename, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"  - Converted to UTF-8 successfully.")

            except UnicodeDecodeError:
                print(f"  - UTF-16: FAIL")
                # Try latin-1
                try:
                    with open(filename, "r", encoding="latin-1") as f:
                        content = f.read()
                    print(f"  - Latin-1: OK. Converting to UTF-8")
                    with open(filename, "w", encoding="utf-8") as f:
                        f.write(content)
                except:
                    print(f"  - Latin-1: FAIL")

    except Exception as e:
        print(f"Error processing {filename}: {e}")
