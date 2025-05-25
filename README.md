[dbDiagram](https://dbdiagram.io/)

```bash
Table USER_PROFILES {
    user_id integer [primary key]
    username string [unique]
    display_name string
    email string [unique]
    created_at datetime
    updated_at datetime
}

Table USER_AUTH {
    user_id integer [primary key]
    password_hash string
    is_active boolean
    last_login datetime
    password_changed_at datetime
    Note: "USER_PROFILES ||--|| USER_AUTH : belongs_to"
}

Table POSTS {
    post_id integer [primary key]
    user_id integer
    title string
    content text
    created_at datetime
    updated_at datetime
    Note: "USER_PROFILES ||--o{ POSTS : creates"
}

Table COMMENTS {
    comment_id integer [primary key]
    post_id integer
    user_id integer
    content text
    created_at datetime
    updated_at datetime
    Note: "USER_PROFILES ||--o{ COMMENTS : writes"
}

Table CATEGORIES {
    category_id integer [primary key]
    name string [unique]
    description string
}

Table POST_CATEGORIES {
    post_id integer
    category_id integer
    Note: "POST_CATEGORIES }o--|| POSTS : links\nPOST_CATEGORIES }o--|| CATEGORIES : links"
}

Table REACTIONS {
    reaction_id integer [primary key]
    user_id integer
    entity_type string
    entity_id integer
    reaction_type integer
    created_at datetime
    Note: "USER_PROFILES ||--o{ REACTIONS : gives\nCOMMENTS ||--o{ REACTIONS : receives\nPOSTS ||--o{ REACTIONS : receives"
}

Table SESSIONS {
    session_id string [primary key]
    user_id integer
    token_hash string
    ip_address string
    user_agent string
    created_at datetime
    expires_at datetime
    Note: "USER_AUTH ||--o{ SESSIONS : has"
}

Ref: USER_AUTH.user_id > USER_PROFILES.user_id
Ref: POSTS.user_id > USER_PROFILES.user_id
Ref: COMMENTS.user_id > USER_PROFILES.user_id
Ref: COMMENTS.post_id > POSTS.post_id
Ref: REACTIONS.user_id > USER_PROFILES.user_id
Ref: REACTIONS.entity_id > POSTS.post_id
Ref: POST_CATEGORIES.post_id > POSTS.post_id
Ref: POST_CATEGORIES.category_id > CATEGORIES.category_id
Ref: SESSIONS.user_id > USER_PROFILES.user_id

```
[diagram](DOCS/forum.pdf)