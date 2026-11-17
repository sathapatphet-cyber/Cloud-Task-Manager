
import json
import uuid
import boto3
import os

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(os.environ.get("TABLE_NAME", "Tasks"))

def response(status, data):
    return {
        "statusCode": status,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
        },
        "body": json.dumps(data, ensure_ascii=False)
    }

def lambda_handler(event, context):
    try:
        method = event.get("requestContext", {}).get(
            "http", {}
        ).get("method", "GET")

        params = event.get("pathParameters") or {}
        task_id = params.get("taskId")

        if method == "GET":
            items = table.scan().get("Items", [])
            return response(200, items)

        body = json.loads(event.get("body") or "{}")

        if method == "POST":
            title = str(body.get("title", "")).strip()
            if not title:
                return response(400, {"error": "Title required"})

            task = {
                "taskId": str(uuid.uuid4()),
                "title": title,
                "description": str(body.get("description", "")),
                "status": "Pending"
            }
            table.put_item(Item=task)
            return response(201, task)

        if method == "PUT":
            if not task_id:
                return response(400, {"error": "Missing taskId"})

            result = table.update_item(
                Key={"taskId": task_id},
                UpdateExpression=(
                    "SET #t = :title, #d = :description, "
                    "#s = :status"
                ),
                ExpressionAttributeNames={
                    "#t": "title",
                    "#d": "description",
                    "#s": "status"
                },
                ExpressionAttributeValues={
                    ":title": str(body.get("title", "")),
                    ":description": str(body.get("description", "")),
                    ":status": str(body.get("status", "Pending"))
                },
                ConditionExpression="attribute_exists(taskId)",
                ReturnValues="ALL_NEW"
            )
            return response(200, result["Attributes"])

        if method == "DELETE":
            if not task_id:
                return response(400, {"error": "Missing taskId"})

            table.delete_item(Key={"taskId": task_id})
            return response(200, {"message": "Task deleted"})

        return response(405, {"error": "Method not allowed"})

    except Exception as error:
        print(str(error))
        return response(500, {"error": "Internal server error"})
