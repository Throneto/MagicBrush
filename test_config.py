import yaml
import os

# 测试文本配置
print("=== Testing text_providers.yaml ===")
with open('text_providers.yaml', 'r') as f:
    text_config = yaml.safe_load(f)
    
print(f"Active provider: {text_config.get('active_provider')}")
if 'providers' in text_config:
    for name, config in text_config['providers'].items():
        print(f"\nProvider: {name}")
        print(f"  Type: {config.get('type')}")
        print(f"  Model: {config.get('model')}")
        print(f"  Base URL: {config.get('base_url')}")
        if config.get('api_key'):
            key = config['api_key']
            print(f"  API Key: {key[:10]}... (length: {len(key)})")

# 测试图片配置
print("\n=== Testing image_providers.yaml ===")
with open('image_providers.yaml', 'r') as f:
    image_config = yaml.safe_load(f)
    
print(f"Active provider: {image_config.get('active_provider')}")
if 'providers' in image_config:
    for name, config in image_config['providers'].items():
        print(f"\nProvider: {name}")
        print(f"  Type: {config.get('type')}")
        print(f"  Model: {config.get('model')}")
        print(f"  High Concurrency: {config.get('high_concurrency')}")
