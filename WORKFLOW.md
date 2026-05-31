<!-- managed:linked-repos -->
## Linked Repositories
- HomeWiseGuides/homewise-guides
<!-- /managed:linked-repos -->

# Daily Dollar Ebooks — Code Workflow

## Branch Strategy
- All work goes on feature branches (`feature/description-of-change`)
- The `main` branch is the production deployment target

## PR Process
1. Members push code to feature branches
2. The lead reviews submitted work
3. The lead merges PRs using squash merge
4. After merge, feature branches are deleted

## Deployment
- `main` branch is deployed to production
- Static site (HTML/CSS/JS) — deployable to Netlify, Vercel, or GitHub Pages
