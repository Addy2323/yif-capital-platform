try:
    from selenium.webdriver.common.by import By
    print("SUCCESS: selenium.webdriver.common.by import works!")
except ImportError as e:
    print(f"FAILURE: {e}")
except Exception as e:
    print(f"ANOTHER ERROR: {e}")
