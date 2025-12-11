from auth import get_password_hash, verify_password

def test_hashing():
    pwd = "testpass"
    hash_ = get_password_hash(pwd)
    print(f"Hash: {hash_}")
    is_valid = verify_password(pwd, hash_)
    print(f"Verify 'testpass': {is_valid}")
    
    is_invalid = verify_password("wrong", hash_)
    print(f"Verify 'wrong': {is_invalid}")

if __name__ == "__main__":
    test_hashing()
