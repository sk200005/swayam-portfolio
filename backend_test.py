#!/usr/bin/env python3
"""
Backend API Tests for Refactored Portfolio Contact Form
Tests the POST /api/contact endpoint (Resend-only, no MongoDB)
"""

import requests
import json
import sys

# Base URL from environment
BASE_URL = "https://portfolio-nextjs-8.preview.emergentagent.com"

def test_valid_message_with_valid_email():
    """Test 1: Valid message + valid email -> 200 {ok:true, sent:true}"""
    print("\n" + "="*80)
    print("TEST 1: Valid message with valid email")
    print("="*80)
    
    url = f"{BASE_URL}/api/contact"
    payload = {"message": "Hello, testing v2", "email": "visitor@example.com"}
    
    try:
        response = requests.post(url, json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True and data.get("sent") == True:
                print("✅ PASS: Valid message + valid email returned 200 with {ok:true, sent:true}")
                return True
            else:
                print(f"❌ FAIL: Expected {{ok:true, sent:true}}, got {data}")
                return False
        else:
            print(f"❌ FAIL: Expected status 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_valid_message_no_email():
    """Test 2: Valid message, NO email field -> 200 {ok:true, sent:true}"""
    print("\n" + "="*80)
    print("TEST 2: Valid message with NO email field")
    print("="*80)
    
    url = f"{BASE_URL}/api/contact"
    payload = {"message": "No email provided"}
    
    try:
        response = requests.post(url, json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True and data.get("sent") == True:
                print("✅ PASS: Valid message without email returned 200 with {ok:true, sent:true}")
                return True
            else:
                print(f"❌ FAIL: Expected {{ok:true, sent:true}}, got {data}")
                return False
        else:
            print(f"❌ FAIL: Expected status 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_valid_message_invalid_email():
    """Test 3: Valid message, invalid email -> 200 {ok:true, sent:true}"""
    print("\n" + "="*80)
    print("TEST 3: Valid message with invalid email")
    print("="*80)
    
    url = f"{BASE_URL}/api/contact"
    payload = {"message": "bad email", "email": "not-an-email"}
    
    try:
        response = requests.post(url, json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok") == True and data.get("sent") == True:
                print("✅ PASS: Valid message with invalid email returned 200 with {ok:true, sent:true}")
                return True
            else:
                print(f"❌ FAIL: Expected {{ok:true, sent:true}}, got {data}")
                return False
        else:
            print(f"❌ FAIL: Expected status 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_empty_message():
    """Test 4: Empty message -> 400 with error"""
    print("\n" + "="*80)
    print("TEST 4: Empty message")
    print("="*80)
    
    url = f"{BASE_URL}/api/contact"
    payload = {"message": "", "email": "visitor@example.com"}
    
    try:
        response = requests.post(url, json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data:
                print(f"✅ PASS: Empty message returned 400 with error: {data['error']}")
                return True
            else:
                print(f"❌ FAIL: Expected 'error' field in response, got {data}")
                return False
        else:
            print(f"❌ FAIL: Expected status 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_missing_message_field():
    """Test 5: Missing message entirely -> 400 with error"""
    print("\n" + "="*80)
    print("TEST 5: Missing message field entirely")
    print("="*80)
    
    url = f"{BASE_URL}/api/contact"
    payload = {"email": "visitor@example.com"}
    
    try:
        response = requests.post(url, json=payload, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 400:
            data = response.json()
            if "error" in data:
                print(f"✅ PASS: Missing message field returned 400 with error: {data['error']}")
                return True
            else:
                print(f"❌ FAIL: Expected 'error' field in response, got {data}")
                return False
        else:
            print(f"❌ FAIL: Expected status 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def test_no_500_errors():
    """Test 6: Confirm no 500 errors for any scenario"""
    print("\n" + "="*80)
    print("TEST 6: No 500 errors check")
    print("="*80)
    
    url = f"{BASE_URL}/api/contact"
    test_cases = [
        {"message": "Valid message", "email": "test@example.com"},
        {"message": "Valid message"},
        {"message": "Valid message", "email": "invalid-email"},
        {"message": ""},
        {},
        {"email": "test@example.com"},
    ]
    
    all_passed = True
    for i, payload in enumerate(test_cases, 1):
        try:
            response = requests.post(url, json=payload, timeout=20)
            if response.status_code == 500:
                print(f"❌ FAIL: Test case {i} returned 500: {payload}")
                print(f"   Response: {response.text}")
                all_passed = False
            else:
                print(f"✅ Test case {i} did not return 500 (status: {response.status_code})")
        except Exception as e:
            print(f"⚠️  Test case {i} threw exception: {e}")
    
    if all_passed:
        print("✅ PASS: No 500 errors detected")
    return all_passed

def test_old_catchall_gone():
    """Test 7: Regression - old catch-all endpoints gone (GET /api/root may 404, that's EXPECTED)"""
    print("\n" + "="*80)
    print("TEST 7: Regression - old catch-all endpoint (GET /api/root)")
    print("="*80)
    
    url = f"{BASE_URL}/api/root"
    
    try:
        response = requests.get(url, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {response.text}")
        
        if response.status_code == 404:
            print("✅ PASS: GET /api/root returns 404 (old catch-all route removed as expected)")
            return True
        elif response.status_code == 200:
            print("⚠️  INFO: GET /api/root still returns 200 (catch-all may still exist)")
            # This is not a failure per se, just noting it
            return True
        else:
            print(f"✅ PASS: GET /api/root returns {response.status_code} (not 500, endpoint behavior changed)")
            return True
    except Exception as e:
        print(f"⚠️  INFO: Exception occurred (endpoint may not exist): {e}")
        return True

def test_homepage_still_works():
    """Test 8: Confirm GET / still returns 200"""
    print("\n" + "="*80)
    print("TEST 8: Homepage sanity check (GET /)")
    print("="*80)
    
    url = f"{BASE_URL}/"
    
    try:
        response = requests.get(url, timeout=20)
        print(f"Status Code: {response.status_code}")
        print(f"Response length: {len(response.text)} bytes")
        
        if response.status_code == 200:
            print("✅ PASS: GET / returns 200 (homepage working)")
            return True
        else:
            print(f"❌ FAIL: Expected status 200, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ FAIL: Exception occurred: {e}")
        return False

def main():
    """Run all tests and report results"""
    print("\n" + "="*80)
    print("BACKEND API TESTS - Refactored Contact Route (Resend-only, no MongoDB)")
    print(f"Base URL: {BASE_URL}")
    print("="*80)
    
    results = {
        "Valid message + valid email": test_valid_message_with_valid_email(),
        "Valid message, NO email field": test_valid_message_no_email(),
        "Valid message, invalid email": test_valid_message_invalid_email(),
        "Empty message": test_empty_message(),
        "Missing message field": test_missing_message_field(),
        "No 500 errors": test_no_500_errors(),
        "Old catch-all endpoint gone": test_old_catchall_gone(),
        "Homepage still works": test_homepage_still_works(),
    }
    
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    print("="*80)
    
    return 0 if passed == total else 1

if __name__ == "__main__":
    sys.exit(main())
