"""Scrape problem statements (and images) for every problem in content/*.md.

The first link under each "## Title" decides the source:
  leetcode.com/problems/<slug>          LeetCode GraphQL (premium -> doocs/leetcode on GitHub)
  leetcode.com/contest/.../problems/<slug>
  geeksforgeeks.org/problems/<slug>     GFG practice API
  naukri.com/code360/problems/<slug>    Code360 API
  hackerrank.com/challenges/<slug>      HackerRank REST API

Output: content/problems.json  {url: {source, id, title, difficulty, tags, html | md}}
Images are downloaded to assets/img/ and the HTML is rewritten to point there.

Run from the repo root:  python3 tools/scrape.py          (only fetches missing entries)
                         python3 tools/scrape.py --force  (refetch everything)
Standard library only.
"""
import hashlib
import json
import pathlib
import re
import sys
import time
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT = ROOT / "content"
OUT = CONTENT / "problems.json"
IMG = ROOT / "assets" / "img"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"


def get(url, data=None, headers=None, binary=False):
    h = {"User-Agent": UA, **(headers or {})}
    for attempt in range(4):
        try:
            req = urllib.request.Request(url, data=data, headers=h)
            with urllib.request.urlopen(req, timeout=30) as r:
                body = r.read()
                return body if binary else body.decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code in (404, 403) and attempt >= 1:
                raise
            time.sleep(2 * (attempt + 1))
        except Exception:
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"failed: {url}")


# ---------- sources ----------
LC_Q = """query q($s:String!){question(titleSlug:$s){questionFrontendId title difficulty
isPaidOnly topicTags{name} content}}"""


def leetcode(slug):
    body = json.dumps({"query": LC_Q, "variables": {"s": slug}}).encode()
    q = json.loads(get("https://leetcode.com/graphql", body, {
        "Content-Type": "application/json",
        "Referer": f"https://leetcode.com/problems/{slug}/"}))["data"]["question"]
    if not q:
        raise RuntimeError("no such question")
    rec = {"source": "LeetCode", "id": q["questionFrontendId"], "title": q["title"],
           "difficulty": q["difficulty"], "tags": [t["name"] for t in q["topicTags"]],
           "html": q["content"], "paid": q["isPaidOnly"]}
    if not rec["html"]:
        rec["html"] = doocs(rec["id"], rec["title"])
    return rec


def doocs(fid, title):
    """Premium LeetCode problems: statement from the open-source doocs/leetcode repo."""
    n = int(fid)
    lo = n // 100 * 100
    folder = f"{lo:04d}-{lo + 99:04d}/{n:04d}.{title}"
    url = ("https://raw.githubusercontent.com/doocs/leetcode/main/solution/"
           + urllib.parse.quote(folder) + "/README_EN.md")
    md = get(url)
    m = re.search(r"<!-- description:start -->(.*?)<!-- description:end -->", md, re.S)
    return m.group(1).strip() if m else None


def gfg(slug):
    r = json.loads(get(f"https://practiceapi.geeksforgeeks.org/api/vr/problems/{slug}/"))["results"]
    return {"source": "GeeksforGeeks", "id": None, "title": r["problem_name"],
            "difficulty": r.get("difficulty"), "tags": r.get("tags", {}).get("topic_tags", []),
            "html": r["problem_question"]}


def naukri(slug):
    p = json.loads(get("https://www.naukri.com/code360/api/v3/public_section/problem_detail?slug="
                       + urllib.parse.quote(slug)))["data"]["offerable"]["problem"]
    return {"source": "Code360", "id": None, "title": p["name"],
            "difficulty": (p.get("difficulty") or "").title() or None,
            "tags": p.get("practice_topics") or [], "html": p["description"]}


def hackerrank(slug):
    m = json.loads(get(f"https://www.hackerrank.com/rest/contests/master/challenges/{slug}"))["model"]
    parts = [m.get("problem_statement") or ""]
    for key, name in [("input_format", "Input Format"), ("constraints", "Constraints"),
                      ("output_format", "Output Format")]:
        if m.get(key):
            parts.append(f"**{name}**\n\n{m[key]}")
    # Sample input/output live in body_html as <pre> blocks.
    for pre in re.findall(r"<pre[^>]*>(.*?)</pre>", m.get("body_html") or "", re.S)[:4]:
        txt = re.sub(r"<[^>]+>", "", pre).strip()
        if txt:
            parts.append("```\n" + txt + "\n```")
    return {"source": "HackerRank", "id": None, "title": m["name"],
            "difficulty": m.get("difficulty_name"), "tags": [],
            # HackerRank's MathJax accepts "\\sum_\\limits"; KaTeX needs "\\sum\\limits_".
            "md": "\n\n".join(parts).replace("_\\limits", "\\limits_")}


def fetch(url):
    u = urllib.parse.urlparse(url)
    path = u.path
    if "leetcode.com" in u.netloc:
        m = re.search(r"/problems/([^/]+)", path)
        return leetcode(m.group(1)) if m else None
    if "geeksforgeeks.org" in u.netloc:
        m = re.search(r"/problems/([^/]+)", path)
        return gfg(m.group(1)) if m else None
    if "naukri.com" in u.netloc:
        m = re.search(r"/problems/([^/]+)", path)
        return naukri(m.group(1)) if m else None
    if "hackerrank.com" in u.netloc:
        m = re.search(r"/challenges/([^/]+)", path)
        return hackerrank(m.group(1)) if m else None
    return None


# ---------- cleanup ----------
def localise_images(html):
    def repl(m):
        src = m.group(2)
        if src.startswith("//"):
            src = "https:" + src
        if not src.startswith("http"):
            return m.group(0)
        ext = pathlib.Path(urllib.parse.urlparse(src).path).suffix.lower() or ".png"
        if ext not in (".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp"):
            ext = ".png"
        name = hashlib.sha1(src.encode()).hexdigest()[:16] + ext
        dest = IMG / name
        if not dest.exists():
            try:
                dest.write_bytes(get(src, binary=True))
            except Exception as e:
                print(f"    image failed {src}: {e}")
                return m.group(0)
        return f'{m.group(1)}assets/img/{name}{m.group(3)}'
    return re.sub(r'(<img\b[^>]*?\bsrc=["\'])([^"\']+)(["\'])', repl, html)


def clean(html):
    # Drop inline styles except on images (keeps their width/height).
    html = re.sub(r'(<(?!img\b)[a-z0-9]+\b[^>]*?)\s+style="[^"]*"', r"\1", html, flags=re.I)
    html = re.sub(r"<(script|style)\b.*?</\1>", "", html, flags=re.S | re.I)
    return localise_images(html)


# ---------- main ----------
def problem_urls():
    urls = []
    for md in sorted(CONTENT.glob("*.md")):
        lines = md.read_text().split("\n")
        for i, line in enumerate(lines):
            if line.startswith("## ") and i + 1 < len(lines):
                m = re.match(r"\[[^\]]*\]\((https?://[^)]+)\)", lines[i + 1])
                if m:
                    urls.append(m.group(1))
    return list(dict.fromkeys(urls))


def main():
    force = "--force" in sys.argv
    IMG.mkdir(parents=True, exist_ok=True)
    data = json.loads(OUT.read_text()) if OUT.exists() else {}
    for url in problem_urls():
        if url in data and not force:
            continue
        try:
            rec = fetch(url)
        except Exception as e:
            print(f"FAIL {url}: {e}")
            continue
        if not rec:
            continue
        if rec.get("html"):
            rec["html"] = clean(rec["html"])
        data[url] = rec
        print(f"ok   {rec['source']:<13} {rec['title']}")
        OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False))
        time.sleep(0.4)
    OUT.write_text(json.dumps(data, indent=1, ensure_ascii=False))
    empty = [u for u, r in data.items() if not (r.get("html") or r.get("md"))]
    print(f"\n{len(data)} problems scraped; {len(empty)} without a statement", *empty, sep="\n  ")


if __name__ == "__main__":
    main()
