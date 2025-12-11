import jwt
import auth

token = "eyJhbGciOiJIUzI1NiIs" # This is just part of a token, but let's try to generate a real one first
# Or import create_access_token from auth

def test():
    print("Reading token from file...")
    with open("token.txt", "r") as f:
        token = f.read().strip()
    print(f"Token: {token}")
    
    print("Decoding token...")
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        print(f"Payload: {payload}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
