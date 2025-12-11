import requests

def test_suggestions():
    # Login to get token first
    try:
        auth = requests.post("http://127.0.0.1:8000/token", data={"username": "test@example.com", "password": "testpassword"})
        if auth.status_code != 200:
            print("Login failed", auth.text)
            return
        
        token = auth.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}
        
        # Test low energy
        print("Testing energy=low...")
        r = requests.get("http://127.0.0.1:8000/tasks/suggestions?energy=low", headers=headers)
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_suggestions()
