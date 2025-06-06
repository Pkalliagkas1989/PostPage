# Instructions

## Guest view
curl  http://localhost:8080/forum/api/guest

## Get categories
curl http://localhost:8080/forum/api/categories

## Register a new user:

curl -X POST http://localhost:8080/forum/api/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

## Login

curl -X POST http://localhost:8080/forum/api/session/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}' \
  -c cookies.txt

## Logout

curl -X POST http://localhost:8080/forum/api/session/logout \
  -b cookies.txt


## Front

fetch("http://localhost:8080/forum/api/session/login", {
    method: "POST",
    credentials: "include", // IMPORTANT
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        email: "user@example.com",
        password: "supersecret"
    })
})



 ## Create a Post

 curl -X POST http://localhost:8080/forum/api/posts \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"category_id":1,"title":"My first post","content":"Hello forum!"}'

## Create a comment

curl -X POST http://localhost:8080/forum/api/comments \
  -H "Content-Type: application/json" \
  -d '{"post_id":"<POST_ID>","content":"Nice post!"}' \
  -b cookies.txt
