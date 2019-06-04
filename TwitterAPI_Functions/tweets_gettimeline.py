import os
import json
from botocore.vendored import requests

url = 'https://api.twitter.com/1.1/statuses/user_timeline.json'
bearer_token = os.environ['bearer']
headers = {'Authorization': f'Bearer {bearer_token}'}

def lambda_handler(event, context):
    url_param_value = event["queryStringParameters"]["screen_name"]
    url_parameters = {"screen_name":url_param_value, "count":"10"}
    
    response = requests.request("GET", url, data="", headers=headers, params=url_parameters)

    return {
        "statusCode": 200,
        "headers": { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        "body": json.dump(response.text)
        }