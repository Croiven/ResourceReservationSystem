# SonarQube MCP (Cursor)

This project uses SonarQube analysis via `sonar-project.properties`. The **SonarQube MCP Server** is configured in your **user** Cursor MCP file (not in this repo):

`%USERPROFILE%\.cursor\mcp.json`

## Self-hosted SonarQube (Docker Desktop on Windows)

When the MCP server runs via `docker run sonarsource/sonarqube-mcp`, use **`host.docker.internal`**, not `localhost`, so the MCP container can reach SonarQube on the host:

```json
{
  "mcpServers": {
    "sonarqube": {
      "command": "docker",
      "args": [
        "run",
        "--init",
        "--pull=always",
        "-i",
        "--rm",
        "-e",
        "SONARQUBE_TOKEN",
        "-e",
        "SONARQUBE_URL",
        "-e",
        "SONARQUBE_IDE_PORT",
        "sonarsource/sonarqube-mcp"
      ],
      "env": {
        "SONARQUBE_URL": "http://host.docker.internal:9000",
        "SONARQUBE_TOKEN": "<your-user-token>",
        "SONARQUBE_IDE_PORT": "64120"
      }
    }
  }
}
```

## Prerequisites

1. **Docker Desktop** running.
2. **SonarQube Server** reachable (e.g. container on port 9000).
3. **User token** from SonarQube (My Account → Security → Generate Tokens). Use a **user token**, not a project token.
4. **Restart Cursor** after changing `mcp.json`.

## Verify

In Cursor chat: *“Ping the SonarQube MCP server”* (uses the `ping_system` tool).

Or: **Settings → Tools & MCP** — `sonarqube` should show tools, not an error.

## SonarQube Cloud instead

Replace `SONARQUBE_URL` with `SONARQUBE_ORG` (see [Sonar Cursor quickstart](https://docs.sonarsource.com/sonarqube-mcp-server/setup/quickstart-guides/cursor)).

## Security

Do **not** commit tokens. Keep them only in `~/.cursor/mcp.json` or OS environment variables.
