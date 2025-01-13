
## Authentication Endpoints

### POST /auth/login
- **Description**: Authenticate user and create session
- **Body**:
  ```json
  {
    "username": "string",
    "password": "string"
  }
  ```

### POST /auth/register
- **Description**: Register new user
- **Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "minecraft_username": "string"
  }
  ```

### POST /auth/logout
- **Description**: End user session
- **Requires**: Authentication

## Staff Endpoints

### GET /staff/applications
- **Description**: Get all staff applications
- **Requires**: Admin Authentication

### POST /staff/apply
- **Description**: Submit staff application
- **Requires**: Authentication
- **Body**:
  ```json
  {
    "minecraft_username": "string",
    "age": "number",
    "timezone": "string",
    "experience": "string",
    "why_join": "string",
    "position": "string"
  }
  ```

### GET /staff/application/:id
- **Description**: Get specific application
- **Requires**: Admin Authentication

### PUT /staff/application/:id
- **Description**: Update application status
- **Requires**: Admin Authentication
- **Body**:
  ```json
  {
    "status": "accepted|rejected|pending"
  }
  ```

## Server Status Endpoints

### GET /status/server
- **Description**: Get Minecraft server status
- **Returns**:
  ```json
  {
    "online": "boolean",
    "players": "number",
    "max_players": "number"
  }
  ```

### GET /status/discord
- **Description**: Get Discord server status
- **Returns**:
  ```json
  {
    "online": "boolean",
    "members": "number"
  }
  ```

## User Endpoints

### GET /user/profile
- **Description**: Get user profile
- **Requires**: Authentication

### PUT /user/profile
- **Description**: Update user profile
- **Requires**: Authentication
- **Body**:
  ```json
  {
    "minecraft_username": "string",
    "email": "string",
    "discord_tag": "string"
  }
  ```

## Forum Endpoints

### GET /forums/categories
- **Description**: Get forum categories

### GET /forums/posts
- **Description**: Get forum posts
- **Query Parameters**: 
  - category: string
  - page: number
  - limit: number

### POST /forums/post
- **Description**: Create forum post
- **Requires**: Authentication
- **Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "category": "string"
  }
  ```

### PUT /forums/post/:id
- **Description**: Update forum post
- **Requires**: Authentication/Post Owner
- **Body**:
  ```json
  {
    "title": "string",
    "content": "string"
  }
  ```

### DELETE /forums/post/:id
- **Description**: Delete forum post
- **Requires**: Authentication/Post Owner/Admin

## News Endpoints

### GET /news/articles
- **Description**: Get news articles
- **Query Parameters**:
  - page: number
  - limit: number

### POST /news/article
- **Description**: Create news article
- **Requires**: Admin Authentication
- **Body**:
  ```json
  {
    "title": "string",
    "content": "string",
    "banner_image": "string"
  }
  ```

### PUT /news/article/:id
- **Description**: Update news article
- **Requires**: Admin Authentication

### DELETE /news/article/:id
- **Description**: Delete news article
- **Requires**: Admin Authentication
