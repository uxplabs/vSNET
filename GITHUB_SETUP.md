# Connect vSNET to GitHub

The project is ready to push to GitHub. Follow these steps:

## 1. Create a new repository on GitHub

1. Go to [github.com/new](https://github.com/new)
2. Enter a repository name (e.g. `vSNET`)
3. Choose **Public** or **Private**
4. **Do not** initialize with a README, .gitignore, or license (the project already has these)
5. Click **Create repository**

## 2. Add the remote and push

Replace `YOUR_USERNAME` and `REPO_NAME` with your GitHub username and repo name:

```bash
cd /Users/tony/Dev/vSNET
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

Or if you use SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## 3. (Optional) Use GitHub CLI

If you have [GitHub CLI](https://cli.github.com/) installed:

```bash
cd /Users/tony/Dev/vSNET
gh repo create vSNET --source=. --push
```
