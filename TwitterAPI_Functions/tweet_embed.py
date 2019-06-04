import os
import json
from botocore.vendored import requests

url = 'https://publish.twitter.com/oembed'
bearer_token = os.environ['bearer']
headers = {'Authorization': f'Bearer {bearer_token}'}

def lambda_handler(event, context):
    user_name = event["queryStringParameters"]["screen_name"]
    tweet_id = event["queryStringParameters"]["id"]
    tweet_url = f'https://twitter.com/{user_name}/status/{tweet_id}'
    url_parameters = {"url":tweet_url, "hide_threat":"true", "align":"center", "maxwidth":"550"
    }
    
    response = requests.request("GET", url, data="", headers=headers, params=url_parameters)

    return {
        "statusCode": 200,
        "headers": { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        "body": json.dump(response.text)
        }