# LeetCode Notes

Static site of my solved problems: topics and problems in the left sidebar; on the right, the original problem statement (with images) followed by my C++ solutions.

## Preview locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` via `file://` won't work, because the content is fetched over HTTP.

## Layout

- `content/*.md`: one file per topic. Each `## Heading` is one problem. Its first line is `[Source](url)`, which links the title and identifies the statement to scrape. `### Subheadings` become the "Solution" entries in the sidebar.
- `content/problems.json`: scraped statements (title, number, difficulty, tags, HTML), keyed by problem URL.
- `assets/img/`: problem images, downloaded so the site doesn't hotlink LeetCode.
- `tools/scrape.py`: fetches the statements from LeetCode (premium problems come from the open-source [doocs/leetcode](https://github.com/doocs/leetcode) repo), GeeksforGeeks, Code360 and HackerRank. Uses the standard library only.
- `tools/add_gists.py`: adds the one-line `> **Problem:**` summary. It's shown only when no scraped statement exists.

## Add a problem

1. Add a `## Title`, then a `[LeetCode](https://leetcode.com/problems/<slug>/)` line, then your notes and code, to the right `content/*.md` file.
2. Run `python3 tools/scrape.py`. It fetches only the problems that are missing. Use `--force` to refetch all of them.

## Deploy to GitHub Pages

1. Create an empty repo on GitHub, e.g. `leetcode-notes`.
2. Push this folder:
   ```sh
   git init && git add . && git commit -m "LeetCode notes site"
   git branch -M main
   git remote add origin https://github.com/<you>/leetcode-notes.git
   git push -u origin main
   ```
3. On GitHub, go to Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
4. The site appears at `https://<you>.github.io/leetcode-notes/`.
