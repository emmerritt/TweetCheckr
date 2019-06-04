import os
import json
from botocore.vendored import requests

url = 'https://api.twitter.com/1.1/statuses/show.json'
bearer_token = os.environ['bearer']
headers = {'Authorization': f'Bearer {bearer_token}'}

def lambda_handler(event, context):
    url_param_value = event["queryStringParameters"]["id"]
    url_parameters = {"id":url_param_value}
    
    response = requests.request("GET", url, data="", headers=headers, params=url_parameters)

    return {
        "statusCode": 200,
        "headers": { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        "body": json.dump(response.text)
        }