# Instructions to Upload Ultra Debugger to GitHub

Follow these steps to create a new repository on GitHub and upload the Ultra Debugger project:

## Step 1: Create a New Repository on GitHub

1. Go to https://github.com/new
2. Sign in to your GitHub account if you haven't already
3. Fill in the repository details:
   - Repository name: `ultra-debugger`
   - Description: `An automated debugging tool for AI-generated software`
   - Public (recommended)
4. Do NOT initialize the repository with a README, .gitignore, or license
5. Click "Create repository"

## Step 2: Push Your Local Repository to GitHub

After creating the repository, you'll see instructions for pushing an existing repository. Follow these steps:

1. Open a terminal/command prompt in the `ultra-debugger` directory
2. Add the remote origin (replace `YOUR_USERNAME` with your actual GitHub username):
   ```
   git remote add origin https://github.com/YOUR_USERNAME/ultra-debugger.git
   ```

3. Verify the remote was added:
   ```
   git remote -v
   ```

4. Push the code to GitHub:
   ```
   git branch -M main
   git push -u origin main
   ```

## Alternative: Using GitHub CLI

If you prefer to use the GitHub CLI:

1. Install GitHub CLI if you haven't already: https://cli.github.com/
2. Open a terminal in the `ultra-debugger` directory
3. Run the following commands:
   ```
   gh repo create ultra-debugger --public --source=. --remote=origin
   git branch -M main
   git push -u origin main
   ```

## Verification

After pushing, visit your repository on GitHub to verify that all files have been uploaded correctly:
https://github.com/YOUR_USERNAME/ultra-debugger

You should see:
- All source code files in `src/` directory
- README.md with project documentation
- package.json with project metadata
- Example files in `test/` directory
- CLI entry point `ultra-debugger.js`