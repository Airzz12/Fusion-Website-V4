
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
    "minecraft_username": "string",
    "password": "string"
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
- **Description**: Submit new staff application
- **Requires**: Authentication
- **Body**:
  ```json
  {
    "in_game_name": "string",    // Minecraft username
    "reason": "string",          // Reason for applying
    "scenario": "string",        // Response to moderation scenario
    "availability": "string",    // Time availability
    "experience": "string"       // Previous staff/moderation experience
  }
  ```
- **Response**: 
  ```json
  {
    "success": "boolean",
    "message": "string"
  }
  ```


### GET /staff/ourstaff
- **Description**: Get list of staff members and their roles

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
- **Description**: Get Discord server member count
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
    "minecraft_username": "string"
  }
  ```

## News Endpoints

### GET /news/articles
- **Description**: Get news articles
- **Query Parameters**:
  - page: number
  - limit: number

### GET /news/article/:id
- **Description**: Get specific news article

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
