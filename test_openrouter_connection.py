import requests
import yaml
import json

def test_openrouter():
    print("=== Testing OpenRouter Connection ===")
    
    # 读取配置
    with open('text_providers.yaml', 'r') as f:
        config = yaml.safe_load(f)
    
    # 获取 OpenRouter 配置
    openrouter_config = config['providers']['third_party']
    api_key = openrouter_config['api_key']
    model = "openai/gpt-4o-mini"  # 先用简单模型
    
    print(f"API Key: {api_key[:15]}...")
    print(f"Testing model: {model}")
    
    # 准备请求
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "MagicBrush Test"
    }
    
    payload = {
        "model": model,
        "messages": [
            {"role": "user", "content": "Hello, are you working?"}
        ],
        "max_tokens": 50
    }
    
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        print(f"\nStatus Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ OpenRouter connection successful!")
            print(f"Response: {result['choices'][0]['message']['content']}")
        else:
            print(f"❌ Error {response.status_code}:")
            print(f"Response: {response.text}")
            
            # 如果是 401，检查 API Key
            if response.status_code == 401:
                print("\n⚠️  Authentication failed. Check your API Key.")
            elif response.status_code == 404:
                print("\n⚠️  Model not found. Check model name.")
            elif response.status_code == 429:
                print("\n⚠️  Rate limit exceeded.")
                
    except Exception as e:
        print(f"❌ Exception: {e}")

def test_openrouter_models():
    print("\n=== Checking Available Models ===")
    
    with open('text_providers.yaml', 'r') as f:
        config = yaml.safe_load(f)
    
    api_key = config['providers']['third_party']['api_key']
    
    headers = {
        "Authorization": f"Bearer {api_key}"
    }
    
    try:
        response = requests.get(
            "https://openrouter.ai/api/v1/models",
            headers=headers,
            timeout=10
        )
        
        if response.status_code == 200:
            models = response.json()['data']
            print(f"Found {len(models)} models")
            
            # 显示前10个模型
            print("\nFirst 10 available models:")
            for model in models[:10]:
                print(f"  - {model['id']}")
            
            # 显示 Google 模型
            print("\nGoogle models available:")
            google_models = [m for m in models if 'google' in m['id'].lower()]
            for model in google_models[:5]:
                print(f"  - {model['id']}")
                
            # 显示图片模型
            print("\nImage generation models:")
            image_models = [m for m in models if 'dall' in m['id'].lower() or 'stable' in m['id'].lower() or 'flux' in m['id'].lower()]
            for model in image_models[:5]:
                print(f"  - {model['id']}")
                
        else:
            print(f"Failed to get models: {response.status_code}")
            
    except Exception as e:
        print(f"Error getting models: {e}")

if __name__ == "__main__":
    test_openrouter()
    test_openrouter_models()
