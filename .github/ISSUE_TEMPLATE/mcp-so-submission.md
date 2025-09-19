---
name: MCP.so Submission Help
about: Guidance for submitting this tool to mcp.so
title: 'Help: Submitting to mcp.so'
labels: 'documentation, help'
assignees: ''
---

## Submitting Ultra Debugger to mcp.so

This tool is ready to be submitted to mcp.so. Here's how to do it:

### Prerequisites
- Make sure you have an account on mcp.so
- Ensure you have the latest version of the repository

### Submission Steps
1. Navigate to mcp.so and log in to your account
2. Go to the "Submit MCP" or similar section
3. Use the following configuration file:
   ```json
   {
     "mcpServers": {
       "ultra-debugger": {
         "command": "node",
         "args": ["src/mcp/ultra-debugger-mcp.js"],
         "env": {}
       }
     }
   }
   ```
4. Point to your local repository or provide the GitHub URL
5. Add the project icon: `ultra-debugger.png`
6. Submit the tool

### Common Issues
If you encounter the "invalid server config without mcpServers key" error:
- Make sure your configuration file includes the `mcpServers` key as shown above
- Ensure the file is properly formatted JSON
- Check that the paths to the JavaScript files are correct

### Additional Information
- Project icon: `ultra-debugger.png`
- Main entry point: `src/mcp/ultra-debugger-mcp.js`
- Configuration file: `mcp.config.json`

For more detailed instructions, refer to the main README.md file.