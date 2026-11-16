## Clone Graph
[LeetCode](https://leetcode.com/problems/clone-graph/)

> **Problem:** Return a deep copy of a connected undirected graph, given a reference to one node.

```cpp
class Solution {
public:
    unordered_map<Node*, Node*> clonedNodes;

    Node* cloneGraph(Node* node) {
        if(node == nullptr){
            return nullptr;
        }
        if(clonedNodes.find(node) != clonedNodes.end()){
            return clonedNodes[node];
        }

        Node* clone = new Node(node->val);
        clonedNodes[node] = clone;

        for(auto& next: node->neighbors){
            clone->neighbors.push_back(cloneGraph(next));
        }
        return clone;
    }
};
```

## Flood Fill
[LeetCode](https://leetcode.com/problems/flood-fill/) · Graph BFS

> **Problem:** Starting from `(sr, sc)`, recolour every 4-directionally connected pixel of the same original colour with `color`.

```cpp
class Solution {
public:
    vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {
        int currentColor = image[sr][sc];

        vector<vector<bool>> visited(image.size(), vector<bool>(image[0].size(), false));

        vector<vector<int>> direction = {{-1, 0}, {0, -1}, {1, 0}, {0, 1}};

        // bfs
        visited[sr][sc] = true;
        image[sr][sc] = color;

        queue<pair<int, int>> q;
        q.push({sr, sc});

        while(!q.empty()){
            auto node = q.front();
            q.pop();
            for(auto& dir : direction){
                int newX = node.first + dir[0], newY = node.second + dir[1];
                if(isValidCell(newX, newY, image, currentColor, visited)){
                    visited[newX][newY] = true;
                    image[newX][newY] = color;
                    q.push({newX, newY});
                }
            }
        }
        return image;
    }

    bool isValidCell(int x, int y, vector<vector<int>>& image, int& currentColor, vector<vector<bool>>& visited){
        // First, check if (x, y) is within bounds
        if (x < 0 || x >= image.size() || y < 0 || y >= image[0].size()) {
            return false;
        }
        // Then, check if the cell is unvisited and matches the current color
        if (!visited[x][y] && image[x][y] == currentColor) {
            return true;
        }
        return false;
    }
};
```

## DFS of Graph
[GeeksforGeeks](https://www.geeksforgeeks.org/problems/depth-first-traversal-for-a-graph/)

> **Problem:** Return the depth-first traversal of a graph, starting from vertex 0 and visiting neighbours in adjacency-list order.

```cpp
class Solution {
  public:
    // Function to return a list containing the DFS traversal of the graph.
    vector<int> dfsOfGraph(vector<vector<int>>& adj) {
        vector<int> ans;
        vector<int> visited(adj.size(), 0);
        visited[0] = 1;
        dfs(0, ans, adj, visited);
        return ans;
    }

    void dfs(int node, vector<int>& arr, vector<vector<int>>& adj, vector<int>& visited){
        arr.push_back(node);
        for(auto& next: adj[node]){
            if(!visited[next]){
                visited[next] = 1;
                dfs(next, arr, adj, visited);
            }
        }
    }
};
```

## Word Ladder
[LeetCode](https://leetcode.com/problems/word-ladder/) · BFS on an undirected, unweighted graph to find the shortest path.

> **Problem:** Change one letter at a time, with every intermediate word in `wordList`. Return the number of words in the shortest sequence from `beginWord` to `endWord` (0 if impossible).

```cpp
class Solution {
public:
    int ladderLength(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> s(wordList.begin(), wordList.end());

        if(s.find(endWord) == s.end()){
            return 0;
        }

        queue<pair<string, int>> q;
        q.push({beginWord, 1});

        if(s.find(beginWord) != s.end()){
            s.erase(beginWord);
        }

        while(!q.empty()){
            pair p = q.front();
            q.pop();

            string currentWord = p.first;
            int depth = p.second;

            for(int i = 0; i < currentWord.size(); i++){
                char originalChar = currentWord[i];

                for(char c = 'a'; c <= 'z'; c++){
                    if(c == originalChar) continue;
                    currentWord[i] = c;

                    if(currentWord == endWord){
                        return depth+1;
                    }
                    if(s.find(currentWord) != s.end()){
                        q.push({currentWord, depth+1});
                        s.erase(currentWord);
                    }
                }
                currentWord[i] = originalChar;
            }
        }
        return 0;
    }
};
```

## Word Ladder II
[LeetCode](https://leetcode.com/problems/word-ladder-ii/)

> **Problem:** Same as Word Ladder, but return every shortest transformation sequence.

### TLE: BFS storing whole paths

```cpp
class Solution {
public:
    vector<vector<string>> findLadders(string beginWord, string endWord, vector<string>& wordList) {
        unordered_set<string> words(wordList.begin(), wordList.end());
        queue<vector<string>> q;
        q.push({beginWord});

        vector<string> usedOnLevel;
        usedOnLevel.push_back(beginWord);

        vector<vector<string>> ans;
        int level = 0;

        while(!q.empty()){
            vector<string> vec = q.front();
            q.pop();
            if(vec.size() > level){
                level++;
                for(auto it: usedOnLevel){
                    words.erase(it);
                }
            }

            string curr = vec.back();

            if(curr == endWord){
                if(ans.size() == 0){
                    ans.push_back(vec);
                }
                else if(ans[0].size() == vec.size()){
                    ans.push_back(vec);
                }
            }

            for(int i = 0; i < curr.length(); i++){
                char original = curr[i];
                for(char c = 'a'; c <= 'z'; c++){
                    curr[i] = c;
                    if(words.count(curr)){
                        vec.push_back(curr);
                        q.push(vec);
                        vec.pop_back();
                        usedOnLevel.push_back(curr);
                    }
                }
                curr[i] = original;
            }
        }
        return ans;
    }
};
```

### Accepted solution

1. Use the Word Ladder I BFS to record the minimum step at which each word is reached (hash map).
2. DFS from `endWord` back to `beginWord`, only stepping to words exactly one level lower, and record each path.

```cpp
class Solution {
public:
    unordered_map<string, int> mp;
    vector<vector<string>> ans;
    string b;

    vector<vector<string>> findLadders(string beginWord, string endWord, vector<string>& wordList) {
        b = beginWord;
        queue<string> q;
        unordered_set<string> st(wordList.begin(), wordList.end());
        st.erase(beginWord);
        q.push({beginWord});
        mp[beginWord] = 1; // first level of the branch leading to endWord

        int sz = beginWord.size();

        while(!q.empty()){
            string curr = q.front();
            q.pop();
            int step = mp[curr];
            if(curr == endWord) break;
            for(int i = 0; i < sz; i++){
                char original = curr[i];
                for(char c = 'a'; c <= 'z'; c++){
                    curr[i] = c;
                    if(st.count(curr)){
                        q.push(curr);
                        st.erase(curr);
                        mp[curr] = step + 1;
                    }
                }
                curr[i] = original;
            }
        }

        if(mp.find(endWord) != mp.end()){
            vector<string> seq;
            seq.push_back(endWord);
            dfs(endWord, seq);
        }
        return ans;
    }

    void dfs(string word, vector<string>& seq){
        if(b == word){
            reverse(seq.begin(), seq.end());
            ans.push_back(seq);
            reverse(seq.begin(), seq.end());
            return;
        }
        int steps = mp[word];
        int sz = word.size();
        for(int i = 0; i < sz; i++){
            char original = word[i];
            for(char c = 'a'; c <= 'z'; c++){
                word[i] = c;
                if(mp.find(word) != mp.end() && mp[word] + 1 == steps){
                    seq.push_back(word);
                    dfs(word, seq);
                    // backtrack
                    seq.pop_back();
                }
            }
            word[i] = original;
        }
    }
};
```

## Detect Cycle in an Undirected Graph
[GeeksforGeeks](https://www.geeksforgeeks.org/problems/detect-cycle-in-an-undirected-graph/1)

> **Problem:** Return whether an undirected graph contains a cycle.

### Brute force (DFS)

```cpp
class Solution {
  public:
    // Function to detect cycle in an undirected graph.
    bool isCycle(vector<vector<int>> adj) {
        // Approaches: edge count (n nodes, n-1 edges => no cycle), union find, DFS
        vector<bool> visited(adj.size(), false);

        for(int i = 0; i < adj.size(); i++){
            if(!visited[i]){
                if(dfs(i, -1, visited, adj)){
                    return true;
                }
            }
        }
        return false;
    }

    bool dfs(int node, int parent, vector<bool>& visited, vector<vector<int>>& adj){
        visited[node] = true;

        for(auto next: adj[node]){
            if(!visited[next]){
                if(dfs(next, node, visited, adj)){
                    return true;
                }
            }
            // next is visited but not the node's parent
            else if(next != parent)
                return true;
        }
        return false;
    }
};
```

### Union-Find (optimised)

If we try to connect two nodes already in the same component, DSU detects a cycle. Uses union by rank and path compression.

```cpp
class Solution {
  public:
    bool isCycle(vector<vector<int>> adj) {
        int V = adj.size();

        vector<int> rank_(V, 1);
        vector<int> parent(V);

        for(int i = 0; i < V; i++){
            parent[i] = i;
        }

        for(int u = 0; u < V; u++){
            for(auto&v : adj[u]){
                if(v>u){
                    int set_u = find_set(u, parent);
                    int set_v = find_set(v, parent);

                    // cycle detection
                    if(set_u == set_v)
                        return true;

                    // otherwise merge
                    if(rank_[set_u] < rank_[set_v]){
                        parent[set_u] = set_v;
                    }
                    else if(rank_[set_u] > rank_[set_v]){
                        parent[set_v] = set_u;
                    }
                    else{
                        parent[set_u] = set_v;
                        rank_[set_v]++;
                    }
                }
            }
        }
        return false;
    }

    int find_set(int x, vector<int>& parent){
        if(parent[x] != x){
            parent[x] = find_set(parent[x], parent); // Path Compression
        }
        return parent[x];
    }
};
```

**Overall time complexity:** O(V + E).

### Explanation

- **Initialization:** `parent[i] = i`; `rank_[i]` keeps trees shallow when merging.
- **Avoid double processing:** the adjacency list stores each undirected edge twice, so only handle edges with `v > u`.
- **Cycle detection:** if both endpoints already have the same representative, adding the edge closes a cycle.
- **Union:** otherwise merge by rank.
- **Related checks:** a connected simple graph with n nodes and exactly n−1 edges is a tree (acyclic). For disconnected graphs, each component with k nodes must have k−1 edges.

## Rotting Oranges
[LeetCode](https://leetcode.com/problems/rotting-oranges/) · multi-source BFS

> **Problem:** Each minute, rotten oranges rot their 4-directional fresh neighbours. Return the minutes until no fresh orange remains, or -1 if some never rot.

```cpp
class Solution {
public:
    int orangesRotting(vector<vector<int>>& grid) {
        vector<vector<int>> directions = {{0,1}, {0,-1}, {1, 0}, {-1, 0}};
        // multi-source bfs
        queue<pair<int, int>> q;
        int fresh = 0;

        for(int i = 0 ; i < grid.size(); i++){
            for(int j = 0; j < grid[0].size(); j++){
                if(grid[i][j] == 2){
                    q.push({i, j});
                }
                if(grid[i][j] == 1){
                    fresh++;
                }
            }
        }

        if(fresh == 0)
            return 0;

        int minutes = 0;

        while(!q.empty() && fresh > 0){
            int len = q.size();
            bool rotted = false;

            for(int i = 0; i < len; i++){
                int row = q.front().first;
                int col = q.front().second;
                q.pop();

                for(auto& dir: directions){
                    int r = row + dir[0];
                    int c = col + dir[1];
                    if(isValidCell(r, c, grid)){
                        grid[r][c] = 2;
                        fresh--;
                        rotted = true;
                        q.push({r,c});
                    }
                }
            }
            if(rotted){
                minutes++;
            }
        }
        return (fresh == 0)? minutes: -1;
    }

    bool isValidCell(int x, int y, vector<vector<int>>& grid){
        if(x < 0 || y < 0 || x >= grid.size() || y >= grid[0].size() || grid[x][y] != 1){
            return false;
        }
        return true;
    }
};
```

## 01 Matrix
[LeetCode](https://leetcode.com/problems/01-matrix/description/)

> **Problem:** For each cell of a binary matrix, return its distance to the nearest 0.

BFS from all the 0s at once. All distances start at `INT_MAX`; the 0 cells start at distance 0. Time O(M·N).

```cpp
class Solution {
public:
    vector<vector<int>> updateMatrix(vector<vector<int>>& mat) {
        int rows = mat.size();
        if (rows == 0) return {};
        int cols = mat[0].size();

        // Initialize the answer matrix with a large number
        vector<vector<int>> ans(rows, vector<int>(cols, INT32_MAX));

        // Directions for adjacent cells: up, down, left, right
        vector<vector<int>> directions = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};

        queue<pair<int, int>> q;

        // Enqueue all 0 cells and set their distance to 0
        for(int i = 0; i < rows; i++) {
            for(int j = 0; j < cols; j++) {
                if(mat[i][j] == 0){
                    q.push({i, j});
                    ans[i][j] = 0;
                }
            }
        }

        // BFS from all 0s simultaneously
        while(!q.empty()){
            pair<int, int> current = q.front();
            q.pop();
            int r = current.first;
            int c = current.second;

            for(auto &dir : directions){
                int newRow = r + dir[0];
                int newCol = c + dir[1];

                if(newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols)
                    continue;

                // If the new distance is better, update and enqueue
                if(ans[newRow][newCol] > ans[r][c] + 1){
                    ans[newRow][newCol] = ans[r][c] + 1;
                    q.push({newRow, newCol});
                }
            }
        }
        return ans;
    }
};
```

## Network Delay Time
[LeetCode](https://leetcode.com/problems/network-delay-time/) · Dijkstra's Algorithm

> **Problem:** A signal is sent from node `k` along weighted directed edges. Return the time for all nodes to receive it, or -1 if some can't.

Goal from the notes: solve 5–10 Dijkstra problems this week.

```cpp
typedef pair<int, int> pii;

class Solution {
public:
    int networkDelayTime(vector<vector<int>>& times, int n, int k) {
        // Build adjacency list
        vector<vector<pii>> adj(n + 1);
        for(auto &time : times){
            adj[time[0]].emplace_back(time[1], time[2]);
        }

        // Min-heap: (current_time, node)
        priority_queue<pii, vector<pii>, std::greater<pii>> pq;
        pq.emplace(0, k);

        // Distance vector
        vector<int> dist(n + 1, INT_MAX);
        dist[k] = 0;

        while(!pq.empty()){
            auto [current_time, u] = pq.top(); pq.pop();
            if(current_time > dist[u]) continue;

            for(auto &[v, w] : adj[u]){
                if(current_time + w < dist[v]){
                    dist[v] = current_time + w;
                    pq.emplace(dist[v], v);
                }
            }
        }

        int result = 0;
        for(int i = 1; i <= n; ++i){
            if(dist[i] == INT_MAX) return -1;
            result = max(result, dist[i]);
        }
        return result;
    }
};
```

### Complexity analysis

- The outer loop processes each node at most once when its shortest distance is final (up to V pops).
- Across all iterations, the inner loop looks at each edge once (E total).
- Each heap push/pop is O(log V): up to E pushes (O(E log V)) and V pops (O(V log V)).
- Building the adjacency list is O(E); computing the result is O(V).
- Overall: **O(E log V)**, since E ≥ V in connected graphs (E can reach V² in dense graphs).

## Path With Minimum Effort
[LeetCode](https://leetcode.com/problems/path-with-minimum-effort/)

> **Problem:** A path's effort is its largest absolute height difference between consecutive cells. Return the minimum effort to go from the top-left to the bottom-right.

Dijkstra where a path's cost is its maximum step difference. Time O(m·n·log(m·n)), space O(m·n).

```cpp
typedef pair<int, pair<int, int>> pii; // diff, row, col
class Solution {
public:
    int minimumEffortPath(vector<vector<int>>& heights) {
        priority_queue<pii, vector<pii>, greater<pii>> pq;

        int rows = heights.size();
        int cols = heights[0].size();

        vector<vector<bool>> visited(rows, vector<bool>(cols, false));

        pq.push({0, {0, 0}});

        vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        while (!pq.empty()) {
            auto top = pq.top();
            pq.pop();

            int diff = top.first;
            int row = top.second.first;
            int col = top.second.second;

            if (visited[row][col])
                continue;

            if (row == rows - 1 && col == cols - 1) {
                return diff;
            }
            for (auto& dir : directions) {
                int newR = row + dir[0];
                int newC = col + dir[1];

                if (isValidCell(newR, newC, rows, cols) && !visited[newR][newC]) {
                    visited[row][col] = true;
                    int newDiff = max(diff, abs(heights[newR][newC] - heights[row][col]));
                    pq.push({newDiff, {newR, newC}});
                }
            }
        }
        return -1; // this will never reach here
    }

private:
    bool isValidCell(int x, int y, int rows, int cols) {
        return (x >= 0 && y >= 0 && x < rows && y < cols);
    }
};
```

## Number of Ways to Arrive at Destination
[LeetCode](https://leetcode.com/problems/number-of-ways-to-arrive-at-destination/)

> **Problem:** In a weighted undirected graph, count the shortest-time paths from node 0 to node `n-1` (mod 1e9+7).

Dijkstra that also counts shortest paths. Time O(E log V).

```cpp
typedef pair<long, long> pii;
class Solution {
public:
    int countPaths(int n, vector<vector<int>>& roads) {
        vector<pii> adj[n];

        for(auto it: roads){
            adj[it[0]].push_back({it[1], it[2]});
            adj[it[1]].push_back({it[0], it[2]});
        }

        priority_queue<pii, vector<pii>, greater<pii>> pq;
        vector<long long> dist(n, 1e18+7);
        vector<long long> ways(n, 0);

        dist[0] = 0;
        ways[0] = 1;
        pq.push({0, 0});

        const int mod = 1000000007;
        while(!pq.empty()){
            auto top = pq.top();
            long cur_dist = top.first;
            long cur_node = top.second;
            pq.pop();

            for(auto& neighbour_pair: adj[cur_node]){
                // count ways, push the minimum path
                long v = neighbour_pair.first;
                long wt = neighbour_pair.second;

                if(dist[v] > wt + cur_dist){
                    dist[v] = wt + cur_dist;
                    pq.push({dist[v], v});
                    ways[v] = ways[cur_node];
                }
                else if(dist[v] == wt + cur_dist){
                    ways[v] = (ways[v] + ways[cur_node])%mod;
                }
            }
        }
        return ways[n-1]%mod;
    }
};
```

## Shortest Path in Binary Matrix
[LeetCode](https://leetcode.com/problems/shortest-path-in-binary-matrix/)

> **Problem:** Return the length of the shortest 8-directional clear path (all 0s) from the top-left to the bottom-right, or -1 if there's none.

Graph without weights: use BFS to find the shortest path.

```cpp
class Solution {
public:
    int shortestPathBinaryMatrix(vector<vector<int>>& grid) {
        int n = grid.size();

        // If the starting or ending cell is blocked, return -1
        if (grid[0][0] != 0 || grid[n-1][n-1] != 0) {
            return -1;
        }

        // Directions for 8-directional movement
        vector<vector<int>> directions = {
            {-1, 0}, {1, 0},  {0, -1},  {0, 1},
            {1, 1},  {1, -1}, {-1, -1}, {-1, 1}
        };

        queue<pair<int, int>> q;
        q.push({0, 0});

        // Mark the starting cell as visited by setting it to 1
        grid[0][0] = 1;

        int path_length = 1;

        while (!q.empty()) {
            int size = q.size();
            for(int i = 0; i < size; ++i){
                auto [row, col] = q.front();
                q.pop();

                // If we've reached the end, return the path length
                if (row == n-1 && col == n-1) {
                    return path_length;
                }

                for (auto& dir : directions) {
                    int newR = row + dir[0];
                    int newC = col + dir[1];

                    // Check boundaries and if the cell is unvisited and passable
                    if (newR >= 0 && newC >= 0 && newR < n && newC < n && grid[newR][newC] == 0) {
                        q.push({newR, newC});
                        grid[newR][newC] = 1; // Mark as visited
                    }
                }
            }
            path_length++;
        }
        // If the end is not reachable
        return -1;
    }
};
```

## Number of Operations to Make Network Connected
[LeetCode](https://leetcode.com/problems/number-of-operations-to-make-network-connected/)

> **Problem:** You can move any cable to connect two computers. Return the minimum number of moves to connect the whole network, or -1 if there aren't enough cables.

Count connected components with DSU; the answer is `components - 1`.

```cpp
class Solution {
public:
    int no_of_components;
    int makeConnected(int n, vector<vector<int>>& connections) {
        if (connections.size() < n - 1)
            return -1;

        vector<int> parent(n);
        vector<int> rank(n, 1);

        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
        no_of_components = n;

        for(auto connection: connections){
            unionSet(parent, rank, connection[0], connection[1]);
        }
        return no_of_components-1;
    }

private:
    int find(int x, vector<int>& parent) {
        if (parent[x] != x)
            return parent[x] = find(parent[x], parent);
        return parent[x];
    }

    void unionSet(vector<int>& parent, vector<int>& rank, int x, int y) {
        int s_x = find(x, parent), s_y = find(y, parent);

        if (s_x == s_y)
            return; // same parent means already connected

        if (rank[s_x] < rank[s_y]) {
            parent[s_x] = s_y;
        }
        else if (rank[s_x] > rank[s_y]) {
            parent[s_y] = s_x;
        }
        else {
            parent[s_y] = s_x;
            rank[s_x]++;
        }
        no_of_components--;
    }
};
```

## Making a Large Island
[LeetCode](https://leetcode.com/problems/making-a-large-island/)

> **Problem:** Change at most one 0 to 1, then return the size of the largest island.

### First attempt

```cpp
class Solution {
public:
    int largestIsland(vector<vector<int>>& grid) {
        int n = grid.size();
        UnionFind uf(n * n);

        vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                int current = i * n + j;
                if (grid[i][j] == 1) {
                    for (auto& dir : directions) {
                        int ni = i + dir[0];
                        int nj = j + dir[1];
                        if (ni < n && nj < n && ni >= 0 && nj >= 0 &&
                            grid[ni][nj] == 1) { // union when the cell value is equal to 1
                            int neighbour = ni * n + nj;
                            uf.unionNodes(current, neighbour);
                        }
                    }
                }
            }
        }

        int maxIslands = 0;
        vector<int> componentSizes(n * n, 0);

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 1) {
                    int root = uf.find(i * n + j);
                    componentSizes[root]++;
                    maxIslands = max(maxIslands, componentSizes[root]);
                }
            }
        }

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 0) { // check if flipping this 0 will increase component size
                    unordered_set<int> uniqueRoots;
                    for (auto& dir : directions) {
                        int ni = i + dir[0];
                        int nj = j + dir[1];
                        if (ni < n && nj < n && ni >= 0 && nj >= 0 && grid[ni][nj] == 1) {
                            uniqueRoots.insert(uf.find(ni * n + nj));
                        }
                    }
                    int currentSize = 1;
                    for(auto root: uniqueRoots){
                        currentSize += componentSizes[root];
                    }
                    maxIslands = max(maxIslands, currentSize);
                }
            }
        }
        return maxIslands;
    }

private:
    class UnionFind {
    public:
        vector<int> rank;
        vector<int> parent;
        int componentCount;
        unordered_set<int> uniqueNodes;

        UnionFind(int n) {
            parent.resize(n, -1);
            rank.resize(n, 0);
            componentCount = 0;
        }

        int find(int node) {
            if (uniqueNodes.find(node) == uniqueNodes.end()) {
                componentCount++;
                uniqueNodes.insert(node);
            }
            if (parent[node] == -1) {
                return node;
            }
            return parent[node] = find(parent[node]);
        }

        void unionNodes(int node1, int node2) {
            int root1 = find(node1);
            int root2 = find(node2);
            if (root1 == root2) {
                return;
            }
            if (rank[root1] > rank[root2]) {
                parent[root2] = root1;
                rank[root2]++;
                componentCount--;
            }
            else if (rank[root1] < rank[root2]) {
                parent[root1] = root2;
                rank[root1]++;
                componentCount--;
            }
            else {
                parent[root1] = root2;
                rank[root1]++;
                componentCount--;
            }
        }
    };
};
```

### Approach

1. **Union-Find:** union every land cell with its adjacent land cells (up, down, left, right). Path compression and union by rank/size keep operations nearly O(1).
2. **Edge case:** if the grid is all 1s, the answer is the whole grid.
3. **Component sizes:** after all unions, record each island's size and the maximum.
4. **Evaluate flips:** for each 0, collect the unique adjacent island roots (to avoid double counting), sum their sizes plus 1, and update the max.

**Time:** O(n²) for an n×n grid.

### Revised code (DSU with size)

```cpp
class DSU {
public:
    vector<int> parent;
    vector<int> size;

    DSU(int n) {
        parent.resize(n);
        size.assign(n, 1);
        for (int i = 0; i < n; i++)
            parent[i] = i;
    }

    int find(int x) {
        if (parent[x] == x)
            return x;
        else
            return parent[x] = find(parent[x]);
    }

    void Union(int a, int b) {
        int set_a = find(a);
        int set_b = find(b);
        if (set_a != set_b) {
            if (size[set_a] < size[set_b]) {
                swap(set_a, set_b);
            }
            parent[set_b] = set_a;
            size[set_a] += size[set_b];
        }
    }
};

class Solution {
public:
    int largestIsland(vector<vector<int>>& grid) {
        vector<vector<int>> directions = {{-1, 0}, {0, 1}, {0, -1}, {1, 0}};
        int n = grid.size();

        DSU dsu(n * n);
        int max_island = 0;
        bool has_zero = false;

        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                // Union only if 1
                if (grid[i][j] == 0) {
                    has_zero = true;
                    continue;
                }
                int current = n * i + j;
                for (auto& dir : directions) {
                    int ni = i + dir[0];
                    int nj = j + dir[1];
                    // adjacent cell within bounds and is land
                    if (ni >= 0 && nj >= 0 && ni < n && nj < n && grid[ni][nj] == 1) {
                        int next = ni * n + nj;
                        dsu.Union(current, next);
                    }
                }
            }
        }

        for (int i = 0; i < n * n; i++) {
            if (dsu.find(i) == i) { // If i is a root node
                max_island = max(max_island, dsu.size[dsu.find(i)]);
            }
        }
        // if all are 1's return max_island which is the component size
        if (!has_zero)
            return max_island;

        // check if flipping one 0 to 1 maximises the area of the resulting component
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < n; j++) {
                unordered_set<int> node_set;
                if (grid[i][j] == 1)
                    continue;
                for (auto& dir : directions) {
                    int ni = i + dir[0];
                    int nj = j + dir[1];
                    if (ni >= 0 && nj >= 0 && ni < n && nj < n && grid[ni][nj] == 1) {
                        int next = ni * n + nj;
                        node_set.insert(dsu.find(next));
                    }
                }
                int sizeTotal = 1;
                for (auto it : node_set) {
                    sizeTotal += dsu.size[dsu.find(it)];
                }
                max_island = max(max_island, sizeTotal);
            }
        }
        return max_island;
    }
};
```

## Accounts Merge
[LeetCode](https://leetcode.com/problems/accounts-merge/)

> **Problem:** Merge accounts that share any email, and return each person's sorted emails.

```cpp
class DSU{
public:
    vector<int> parent;
    vector<int> size;

    DSU(int sz) : parent(sz), size(sz){
        for(int i = 0; i < sz; i++){
            parent[i] = i;
            size[i] = 1;
        }
    }

    int findParent(int x){
        if(parent[x] == x){
            return x;
        }
        return parent[x] = findParent(parent[x]);
    }

    void unionBySize(int a, int b){
        int parentA = findParent(a);
        int parentB = findParent(b);
        if(parentA == parentB)
            return;
        if(size[parentA] >= size[parentB]){
            size[parentA] += size[parentB];
            parent[parentB] = parentA;
        }
        else{
            size[parentB] += size[parentA];
            parent[parentA] = parentB;
        }
    }
};

class Solution {
public:
    vector<vector<string>> accountsMerge(vector<vector<string>>& accounts) {
        unordered_map<string, int> emailGroup;
        int n = accounts.size();
        DSU dsu(n);

        for(int i = 0; i < n; i++){
            int accSize = accounts[i].size();
            for(int j = 1; j < accSize; j++){
                string email = accounts[i][j];
                if(emailGroup.find(email) == emailGroup.end()){
                    emailGroup[email] = i;
                }
                else{
                    dsu.unionBySize(i, emailGroup[email]);
                }
            }
        }

        unordered_map<int, vector<string>> components;
        for(auto& emailIt: emailGroup){
            int group = emailIt.second;
            string email = emailIt.first;
            components[dsu.findParent(group)].push_back(email);
        }

        vector<vector<string>> mergedAccounts;
        for(auto componentIt: components){
            int group = componentIt.first;
            vector<string> component = {accounts[group][0]};
            component.insert(component.end(), componentIt.second.begin(), componentIt.second.end());
            sort(component.begin() + 1, component.end());
            mergedAccounts.push_back(component);
        }
        return mergedAccounts;
    }
};
```

## Shortest Bridge
[LeetCode](https://leetcode.com/problems/shortest-bridge/) · marked **V.imp**

> **Problem:** A grid contains exactly two islands. Return the minimum number of 0s to flip to connect them.

DFS marks the first island and enqueues all its cells; then BFS expands outward until it reaches the second island.

```cpp
class Solution {
public:
    vector<int> directions[4] = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
    queue<pair<int, int>> q;

    int shortestBridge(vector<vector<int>>& grid) {
        vector<vector<bool>> visited(grid.size(), vector<bool>(grid[0].size(), false));

        bool found = false;
        int n = grid.size();

        for(int i = 0; i < n && !found; i++) {
            for(int j = 0; j < n && !found; j++) {
                if(grid[i][j] == 1){
                    dfs(i, j, grid, visited);
                    found = true;
                }
            }
        }

        int steps = 0;
        while (!q.empty()) {
            int size = q.size();
            for (int i = 0; i < size; i++) {
                auto node = q.front();
                q.pop();
                int row = node.first;
                int col = node.second;
                for (auto& dir: directions) {
                    int newR = row + dir[0];
                    int newC = col + dir[1];
                    if (isValidCell(newR, newC, grid) && !visited[newR][newC]) {
                        if (grid[newR][newC] == 1) {
                            return steps;
                        }
                        q.push({newR, newC});
                        visited[newR][newC] = true;
                    }
                }
            }
            steps++;
        }
        return -1;
    }

    void dfs(int x, int y, vector<vector<int>>& grid, vector<vector<bool>>& visited) {
        if (x < 0 || y < 0 || x >= grid.size() || y >= grid.size() ||
            visited[x][y] || grid[x][y] == 0)
            return;

        visited[x][y] = true;
        q.push({x, y});

        for (auto& dir : directions) {
            int newX = x + dir[0];
            int newY = y + dir[1];
            dfs(newX, newY, grid, visited);
        }
    }

    bool isValidCell(int x, int y, vector<vector<int>>& grid) {
        if (x < 0 || y < 0 || x >= grid.size() || y >= grid.size())
            return false;
        return true;
    }
};
```

## Find Eventual Safe States
[LeetCode](https://leetcode.com/problems/find-eventual-safe-states/) · Topological sort

> **Problem:** A node is safe if every path from it ends at a terminal node. Return all safe nodes, sorted.

**Insight:** a node is safe exactly when it is not part of any cycle, so no path from it leads back to itself and every path ends at a terminal node.

```cpp
class Solution {
public:
    vector<int> eventualSafeNodes(vector<vector<int>>& graph) {
        int n = graph.size();

        vector<vector<int>> adjList(n);
        vector<int> outdegree(n, 0);

        // reverse the graph
        for(int i = 0; i < n; i++){
            for(auto& node: graph[i]){
                adjList[node].push_back(i);
            }
            outdegree[i] = graph[i].size();
        }

        queue<int> q;
        for (int i = 0; i < n; i++) {
            if(outdegree[i] == 0)
                q.push(i);
        }

        vector<int> ans;
        while (!q.empty()) {
            int node = q.front();
            q.pop();
            ans.push_back(node);

            for (auto& nbr : adjList[node]) {
                outdegree[nbr]--;
                if(outdegree[nbr] == 0){
                    q.push(nbr);
                }
            }
        }
        sort(ans.begin(), ans.end());
        return ans;
    }
};
```

### Kahn's algorithm on the reversed graph

1. **Reverse the graph:** for every edge `i -> j`, add `i` to `reverseAdjList[j]`.
2. **Outdegrees:** `outdegree[i] = graph[i].size()`.
3. **Queue:** start with terminal nodes (outdegree 0).
4. **Process:** pop a node; decrement the outdegree of each predecessor. When a predecessor reaches 0, all its paths lead to terminal nodes, so enqueue it.
5. **Collect** the safe nodes and sort them.

## Alien Dictionary
[GeeksforGeeks](https://www.geeksforgeeks.org/problems/alien-dictionary/1) · video: *G-26. Alien Dictionary – Topological Sort*

> **Problem:** Given words sorted in an alien language, derive an order of its characters (empty if invalid).

```cpp
class Solution {
private:
    vector<int> topoSort(int V, vector<vector<int>>& adj){
        vector<int> indegree(V, 0);
        for(int i = 0; i < V; i++){
            for(auto& it: adj[i]){
                indegree[it]++;
            }
        }
        queue<int> q;
        for(int i = 0; i < V; i++){
            if(indegree[i] == 0){
                q.push(i);
            }
        }

        vector<int> topoArr;
        while(!q.empty()){
            int node = q.front();
            q.pop();
            topoArr.push_back(node);

            for(auto& next: adj[node]){
                if((--indegree[next]) == 0){
                    q.push(next);
                }
            }
        }
        return topoArr;
    }
public:
    string findOrder(vector<string> dict, int k) {
        vector<vector<int>> adj(k);
        int n = dict.size();

        for(int i = 0; i < n - 1; i++){
            string s1 = dict[i];
            string s2 = dict[i+1];
            int len = min(s1.size(), s2.size());

            for(int k = 0; k < len; k++){
                if(s1[k] != s2[k]){
                    adj[s1[k] - 'a'].push_back(s2[k] - 'a');
                    break;
                }
            }
        }

        vector<int> topo = topoSort(k, adj);
        string ans = "";
        for(auto& it: topo){
            ans += (char)(it + 'a');
        }
        return ans;
    }
};
```

### When is a topological order impossible?

1. A longer string appears before its own prefix, e.g. `abcd` before `abc`.
2. Cyclic dependency, e.g. `abcd, bat, abd`: topological ordering does not exist for directed cyclic graphs.

## Evaluate Division
[LeetCode](https://leetcode.com/problems/evaluate-division/) · DFS (can be optimised using memoization)

> **Problem:** Given equations `a / b = k`, answer queries `x / y`, returning -1 when a query can't be determined.

Build a weighted graph where `a -> b` has weight `a/b` and `b -> a` has `1/(a/b)`. A query is the product of weights along a path.

```cpp
class Solution {
public:
   vector<double> calcEquation(vector<vector<string>>& equations,
                               vector<double>& values,
                               vector<vector<string>>& queries) {
       unordered_map<string, vector<pair<string, double>>> adj;

       for (int i = 0; i < values.size(); i++) {
           adj[equations[i][0]].emplace_back(equations[i][1], values[i]);
           adj[equations[i][1]].emplace_back(equations[i][0], 1.0 / values[i]);
       }

       vector<double> ans;

       for (auto& query : queries) {
           string c = query[0];
           string d = query[1];

           if (adj.find(c) == adj.end() || adj.find(d) == adj.end()) {
               ans.push_back(-1.0);
           }
           else if (c == d) {
               ans.push_back(1.0);
           }
           else {
               double score = 1.0;
               unordered_set<string> visited;
               double result = dfs(query[0], query[1], adj, visited, score);
               ans.push_back(result);
           }
       }
       return ans;
   }

   double dfs(string& current, string& target,
              unordered_map<string, vector<pair<string, double>>>& adj,
              unordered_set<string>& visited, double accumulated) {
       if (current == target) return accumulated;

       visited.insert(current);

       for (auto& neighbor : adj[current]) {
           string nextNode = neighbor.first;
           double value = neighbor.second;

           if (!visited.count(nextNode)) {
               double result = dfs(nextNode, target, adj, visited, accumulated * value);
               if (result != -1.0) {
                   return result;
               }
           }
       }
       return -1.0;
   }
};
```

## Critical Connections in a Network
[LeetCode](https://leetcode.com/problems/critical-connections-in-a-network/) · Tarjan's Algorithm · video: *G-55. Bridges in Graph*

> **Problem:** Return every bridge: an edge whose removal disconnects some servers.

- `disc[u]`: discovery time of `u` (`-1` = unvisited). `low[u]`: lowest discovery time reachable from `u`'s subtree.
- For each neighbour `v` of `u` (skipping the parent): if unvisited, recurse, then `low[u] = min(low[u], low[v])`; if `low[v] > disc[u]`, edge `(u, v)` is a bridge. If already visited, `low[u] = min(low[u], disc[v])` (back edge).
- DFS starts from node 0 (graph is connected). For a disconnected graph, start from every unvisited node.

```cpp
class Solution {
public:
    vector<vector<int>> bridges;
    int counter = 0;
    vector<vector<int>> criticalConnections(int n, vector<vector<int>>& connections) {
        vector<vector<int>> graph(n);
        for (auto& edge : connections) {
            graph[edge[0]].push_back(edge[1]);
            graph[edge[1]].push_back(edge[0]);
        }

        vector<int> low(n, -1);  // -1 means unvisited
        vector<int> disc(n, -1); // discovery time

        dfs(0, -1, graph, low, disc);
        return bridges;
    }

    void dfs(int u, int parent, vector<vector<int>>& graph, vector<int>& low, vector<int>& disc) {
        disc[u] = low[u] = counter;
        counter++;

        for (auto& v : graph[u]) {
            if (v == parent) {
                continue;
            }
            if (disc[v] == -1) {
                dfs(v, u, graph, low, disc);
                low[u] = min(low[u], low[v]);

                if (low[v] > disc[u]) {
                    bridges.push_back({u, v});
                }
            }
            // v is visited but not the parent
            else{
                low[u] = min(low[u], disc[v]);
            }
        }
    }
};
```

**Bridge detection:** after visiting child `v` from `u`, `low[v] > disc[u]` means no back edge from `v` or its descendants reaches `u` or its ancestors, so `(u, v)` is a bridge.

## Longest Increasing Path in a Matrix
[LeetCode](https://leetcode.com/problems/longest-increasing-path-in-a-matrix/) · DFS + DP. Time O(m·n).

> **Problem:** Return the length of the longest strictly increasing path through 4-directional moves.

```cpp
class Solution {
public:
    vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    int longestIncreasingPath(vector<vector<int>>& matrix) {
        int m = matrix.size();
        int n = matrix[0].size();
        vector<vector<int>> dp(m, vector<int>(n, -1));

        int len = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                len = max(len, dfs(i, j, matrix, dp));
            }
        }
        return len;
    }

    int dfs(int x, int y, vector<vector<int>>& matrix, vector<vector<int>>& dp) {
        if (dp[x][y] != -1)
            return dp[x][y];

        int m = matrix.size();
        int n = matrix[0].size();
        int len = 1;

        for (auto& dir : directions) {
            int newX = x + dir[0], newY = y + dir[1];
            if (isValidCell(newX, newY, m, n) && matrix[newX][newY] > matrix[x][y]) {
                len = max(len, 1 + dfs(newX, newY, matrix, dp));
            }
        }
        return dp[x][y] = len;
    }

    bool isValidCell(int x, int y, int m, int n) {
        return (x >= 0 && y >= 0 && x < m && y < n);
    }
};
```

## Reconstruct Itinerary
[LeetCode](https://leetcode.com/problems/reconstruct-itinerary/) · Eulerian path

> **Problem:** Using every flight ticket exactly once and starting from "JFK", return the lexicographically smallest itinerary.

An Eulerian path uses every edge exactly once. Return the lexicographically smallest such path.

- **Graph:** adjacency list of destinations, sorted in **reverse** lexical order so `pop_back()` yields the smallest.
- **DFS:** while the current airport has destinations, pop the smallest and recurse; after exhausting them, append the airport to the route.
- The route is built in reverse, so reverse it at the end.

### Recursive DFS

```cpp
class Solution {
public:
    vector<string> ans;

    vector<string> findItinerary(vector<vector<string>>& tickets) {
        unordered_map<string, vector<string>> graph;
        for (auto& ticket : tickets) {
            graph[ticket[0]].push_back(ticket[1]);
            sort(graph[ticket[0]].begin(), graph[ticket[0]].end(), greater<string>());
        }

        dfs("JFK", graph);
        reverse(ans.begin(), ans.end());
        return ans;
    }

    void dfs(string current, unordered_map<string, vector<string>>& graph) {
        while (!graph[current].empty()) {
            // pop_back the last element and visit all the neighbours
            string dest = graph[current].back();
            graph[current].pop_back();
            dfs(dest, graph);
        }
        ans.push_back(current);
    }
};
```

### Iterative DFS with a stack

Start the stack with `"JFK"`. Look at the top: if it has no destinations left, add it to the route and pop; otherwise pop its smallest destination and push that.

```cpp
class Solution {
public:
    vector<string> findItinerary(vector<vector<string>>& tickets) {
        unordered_map<string, vector<string>> graph;
        for(auto &ticket : tickets){
            graph[ticket[0]].push_back(ticket[1]);
        }
        // Sort the destinations in reverse lexical order
        for(auto &entry : graph){
            sort(entry.second.begin(), entry.second.end(), greater<string>());
        }

        vector<string> route;
        stack<string> st;
        st.push("JFK");

        while(!st.empty()){
            // if there are no more destinations then add the top most into the route
            string current = st.top();
            if(graph[current].empty() || graph.find(current) == graph.end()){
                route.push_back(current);
                st.pop();
            }
            else{
                string dest = graph[current].back();
                graph[current].pop_back();
                st.push(dest);
            }
        }
        reverse(route.begin(), route.end());
        return route;
    }
};
```

## Redundant Connection II
[LeetCode](https://leetcode.com/problems/redundant-connection-ii/) · Union Find · related video: *G-19. Detect cycle in a directed graph using DFS*

> **Problem:** A rooted tree had one extra directed edge added. Return the edge to remove so it's a rooted tree again (the last such edge in the input).

**Problem:** a rooted tree with nodes `1..n` had one extra directed edge added. The result has a cycle or a node with two parents. Return the edge to remove (the last one in input order if several work).

**Solution overview**

1. **Find a node with two parents.** If one exists, its two incoming edges are the candidates (`cand1` earlier, `cand2` later).
2. **Union-Find with `cand2` removed:**
   - cycle found and a node has two parents → return `cand1`;
   - no cycle but a node has two parents → return `cand2` (e.g. `[[1,2],[1,3],[2,3]]` → `[2,3]`);
   - no node with two parents but a cycle → return the edge that closes the cycle (e.g. `[[1,2],[2,3],[3,4],[4,1],[1,5]]` → `[4,1]`).

```cpp
class Solution {
public:
    vector<int> findRedundantDirectedConnection(vector<vector<int>>& edges) {
        int n = edges.size();
        vector<int> cand1, cand2;
        vector<int> parent(n+1, 0);

        for(auto& edge: edges){
            int u = edge[0];
            int v = edge[1];

            if(parent[v] == 0)
                parent[v] = u;
            else{
                cand1 = {parent[v], v};
                cand2 = {u, v};
                edge[0] = -1;
                edge[1] = -1;
            }
        }

        vector<int> dsu(n+1, 0);
        for(int i = 1; i <= n; i++){ // 1-based indexing
            dsu[i] = i; // each node is its own parent
        }

        // perform dsu on this modified graph (a DSU with one vector)
        for(auto& edge: edges){
            if(edge[0] == -1 && edge[1] == -1)
                continue;

            int u = edge[0], v = edge[1];
            int parentU = findParent(u, dsu);
            int parentV = findParent(v, dsu);

            // same component and we connect them with an edge => a cycle exists
            if(parentU == parentV){
                if(!cand1.empty()) // node has two parents and a cycle exists
                    return cand1;  // return the first conflicting edge
                // no node has two parents but a cycle exists: return the edge causing it
                else return edge;
            }
            dsu[parentV] = parentU; // u --> v
        }
        return cand2;
    }
private:
    int findParent(int& x, vector<int>& dsu){
        if(dsu[x] == x)
            return dsu[x];
        return dsu[x] = findParent(dsu[x], dsu);
    }
};
```

**Why it works:** invalidating the second conflicting edge removes one parent, so any cycle that remains must go through `cand1`. If no cycle remains, `cand2` was the extra edge.

## Satisfiability of Equality Equations
[LeetCode](https://leetcode.com/problems/satisfiability-of-equality-equations/)

> **Problem:** Given equations like `a==b` and `a!=b`, return whether variables can be assigned values that satisfy them all.

Union all letters joined by `==`; then any `!=` between letters in the same component makes it unsatisfiable.

```cpp
class DSU{
public:
    vector<int> parent;
    vector<int> size;
    DSU(int n){
        parent.resize(n);
        size.assign(n, 1);
        for(int i = 0; i < n; i++){
            parent[i] = i;
        }
    }

    int find(int x){
        if(parent[x] == x)
            return x;
        return parent[x] = find(parent[x]);
    }

    void unite(int a, int b){
        int set_a = find(a);
        int set_b = find(b);
        if(set_a != set_b){
            if(size[set_a] < size[set_b])
                swap(set_a, set_b);
            parent[set_b] = set_a;
            size[set_a] += size[set_b];
        }
    }
};

class Solution {
public:
    bool equationsPossible(vector<string>& equations) {
        DSU dsu(26);

        for(auto& e: equations){
            if(e[1] == '=') // union
            {
                dsu.unite(e[0]-'a', e[3]-'a');
            }
        }

        // all unions are done, now check if the not-equals are in these components
        for(auto& e: equations){
            if(e[1] == '!'){
                if(dsu.find(e[0]-'a') == dsu.find(e[3]-'a'))
                    return false;
            }
        }
        return true;
    }
};
```

## Lexicographically Smallest Equivalent String
[LeetCode](https://leetcode.com/problems/lexicographically-smallest-equivalent-string/)

> **Problem:** `s1[i]` and `s2[i]` are equivalent characters (equivalence is transitive). Return the lexicographically smallest equivalent form of `baseStr`.

Basic Union Find on letters, close to the previous problem.

```cpp
class DSU{
public:
    vector<int> parent;
    vector<int> size;
    DSU(int n){
        parent.resize(n);
        size.assign(n, 1);
        for(int i = 0; i < n; i++){
            parent[i] = i;
        }
    }

    int find(int x){
        if(parent[x] == x)
            return x;
        return parent[x] = find(parent[x]);
    }

    void unite(int a, int b){
        int set_a = find(a);
        int set_b = find(b);
        if(set_a != set_b){
            if(size[set_a] < size[set_b])
                swap(set_a, set_b);
            parent[set_b] = set_a;
            size[set_a] += size[set_b];
        }
    }
};

class Solution {
public:
    string smallestEquivalentString(string s1, string s2, string baseStr) {
        int n = s1.length();
        DSU dsu(26);

        for(int i = 0; i < n; i++){
            dsu.unite(s1[i]-'a', s2[i] - 'a'); // union by indices and not characters
        }
        // After all unions are done, find the smallest character for each root
        vector<char> smallest(26, '\0');
        for(int c = 0; c < 26; c++){
            int root = dsu.find(c);
            char ch = 'a' + c;
            if(smallest[root] == '\0' || ch < smallest[root]){
                smallest[root] = ch;
            }
        }
        // replace each char in baseStr with the smallest char in its component
        for(int i = 0; i < baseStr.size(); i++){
            int root = dsu.find(baseStr[i]-'a');
            baseStr[i] = smallest[root];
        }
        return baseStr;
    }
};
```

## Similar String Groups
[LeetCode](https://leetcode.com/problems/similar-string-groups/)

> **Problem:** Two anagram strings are similar if they're equal or one swap apart. Count the groups formed by connected similarity.

- **`areSimilar`:** identical strings are similar. Otherwise record differing positions; more than two means not similar; exactly two must swap into each other.
- **`numSimilarGroups`:** union every similar pair, then count distinct roots.

```cpp
class DSU {
private:
    vector<int> parent;
    vector<int> size;
public:
    DSU(int n) {
        parent.resize(n);
        size.assign(n, 1);
        for (int i = 0; i < n; i++) {
            parent[i] = i;
        }
    }

    void unite(int x, int y) {
        int rootX = find(x);
        int rootY = find(y);
        if (rootX != rootY) {
            if (size[rootX] < size[rootY]) {
                parent[rootX] = rootY;
                size[rootY] += size[rootX];
            }
            else {
                parent[rootY] = rootX;
                size[rootX] += size[rootY];
            }
        }
    }

    int find(int x) {
        if (parent[x] == x)
            return x;
        return parent[x] = find(parent[x]);
    }
};

class Solution {
public:
    bool areSimilar(string a, string b) {
        if (a == b)
            return true;

        vector<int> diff;
        for (int i = 0; i < a.size(); i++) {
            if (a[i] != b[i]) {
                diff.push_back(i);
                if(diff.size() > 2) return false;
            }
        }
        if (diff.size() != 2)
            return false;

        int i = diff[0], j = diff[1];
        return (a[i] == b[j] || a[j] == b[i]);
    }

    int numSimilarGroups(vector<string>& strs) {
        int n = strs.size();
        DSU dsu(n);

        for(int i = 0; i < n; i++){
            for(int j = i+1; j < n; j++){
                if(areSimilar(strs[i], strs[j])){
                    dsu.unite(i, j);
                }
            }
        }
        unordered_set<int> numSet;
        for (int i = 0; i < n; i++){
            numSet.insert(dsu.find(i));
        }
        return numSet.size();
    }
};
```

**Time:** O(N²·L) for pairwise comparison; union-find is near O(1) per operation. With N ≤ 300 and L ≤ 300 this is fast enough.

## Nearest Exit from Entrance in Maze
[LeetCode](https://leetcode.com/problems/nearest-exit-from-entrance-in-maze/) · standard BFS on a matrix

> **Problem:** Return the fewest steps from `entrance` to the nearest exit (an empty border cell other than the entrance), or -1 if there's none.

```cpp
class Solution {
public:
    int nearestExit(vector<vector<char>>& maze, vector<int>& entrance) {
        vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        int m = maze.size();
        int n = maze[0].size();

        vector<vector<bool>> visited(m, vector<bool>(n, false));
        queue<pair<int, int>> q;
        q.emplace(entrance[0], entrance[1]);
        visited[entrance[0]][entrance[1]] = true;

        int steps = 0;
        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                auto node = q.front();
                q.pop();
                int x = node.first, y = node.second;

                if ((x == 0 || y == 0 || x == m - 1 || y == n - 1) &&
                    maze[x][y] == '.' && !((x == entrance[0]) && (y == entrance[1]))) {
                    return steps;
                }
                for (auto& dir : directions) {
                    int ni = x + dir[0], nj = y + dir[1];
                    if (isValid(ni, nj, m, n) && maze[ni][nj] == '.' && !visited[ni][nj]) {
                        visited[ni][nj] = true;
                        q.emplace(ni, nj);
                    }
                }
            }
            steps++;
        }
        return -1;
    }

    bool isValid(int x, int y, int m, int n) {
        return (x >= 0 && y >= 0 && x < m && y < n);
    }
};
```

## Shortest Path to Get All Keys
[LeetCode](https://leetcode.com/problems/shortest-path-to-get-all-keys/) · BFS with bit masking (Imp.)

> **Problem:** In a grid with walls, keys (`a–f`) and locks (`A–F`), return the fewest moves to collect every key, or -1 if that's impossible.

State is `(row, col, keysMask)`; visited has 64 mask slots per cell.

```cpp
class Solution {
public:
    int shortestPathAllKeys(vector<string>& grid) {
        vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        int m = grid.size(), n = grid[0].size();
        int total_keys = 0;
        int start_x = 0, start_y = 0;

        queue<tuple<int, int, int>> q;
        vector<vector<vector<bool>>> visited(m, vector<vector<bool>>(n, vector<bool>(64, false)));

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                char c = grid[i][j];
                if (c == '@') {
                    start_x = i;
                    start_y = j;
                }
                if (c >= 'a' && c <= 'f') {
                    total_keys |= (1 << (c - 'a'));
                }
            }
        }

        q.emplace(start_x, start_y, 0);
        visited[start_x][start_y][0] = true;

        int steps = 0;
        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                auto [x, y, keys] = q.front();
                q.pop();
                if (keys == total_keys) {
                    return steps;
                }
                for (auto& dir : directions) {
                    int nx = x + dir[0], ny = y + dir[1];
                    int nkeys = keys;

                    if (nx < 0 || ny < 0 || nx >= m || ny >= n)
                        continue;
                    if (grid[nx][ny] == '#')
                        continue;

                    // if we walk over a key, we take it (set the corresponding bit)
                    if (grid[nx][ny] >= 'a' && grid[nx][ny] <= 'f') {
                        nkeys |= (1 << (grid[nx][ny] - 'a'));
                    }
                    // if we walk on a lock we check if we have its key
                    if (grid[nx][ny] >= 'A' && grid[nx][ny] <= 'F') {
                        if(!(keys & (1 << (grid[nx][ny] - 'A'))))
                            continue;
                    }

                    if(!visited[nx][ny][nkeys]){
                        visited[nx][ny][nkeys] = true;
                        q.emplace(nx, ny, nkeys);
                    }
                }
            }
            steps++;
        }
        return -1;
    }
};
```

## Number of Enclaves
[LeetCode](https://leetcode.com/problems/number-of-enclaves/) · multi-source BFS from the boundary

> **Problem:** Count the land cells from which you can't walk off the grid's boundary.

```cpp
class Solution {
public:
    int numEnclaves(vector<vector<int>>& grid) {
        // first traverse the boundary of the matrix and enqueue all the 1's
        int m = grid.size(), n = grid[0].size();
        vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

        queue<pair<int, int>> q;
        vector<vector<bool>> visited(m, vector<bool>(n, false));

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || j == 0 || i == m - 1 || j == n - 1) {
                    if (grid[i][j] == 1) {
                        q.emplace(i, j);
                        visited[i][j] = true;
                    }
                }
            }
        }

        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                auto node = q.front();
                q.pop();
                int x = node.first, y = node.second;
                for (auto& dir : directions) {
                    int nx = x + dir[0], ny = y + dir[1];
                    if (nx < 0 || ny < 0 || nx >= m || ny >= n)
                        continue;
                    if (!visited[nx][ny] && grid[nx][ny] == 1) {
                        q.emplace(nx, ny);
                        visited[nx][ny] = true;
                    }
                }
            }
        }

        // the remaining unvisited 1's are the answer
        int count = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (grid[i][j] == 1 && visited[i][j] == false)
                    count++;
            }
        }
        return count;
    }
};
```

## Number of Closed Islands
[LeetCode](https://leetcode.com/problems/number-of-closed-islands/)

> **Problem:** Count the islands of 0s that are completely surrounded by 1s, so they don't touch the border.

First flood every land region touching the boundary; then each remaining unvisited land region is a closed island.

```cpp
class Solution {
public:
    vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    int closedIsland(vector<vector<int>>& grid) {
        int m = grid.size(), n = grid[0].size();
        vector<vector<bool>> visited(m, vector<bool>(n, false));

        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (i == 0 || j == 0 || i == m - 1 || j == n - 1) {
                    if (grid[i][j] == 0) {
                        bfs(i, j, grid, visited);
                    }
                }
            }
        }

        int count = 0;
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                if (!visited[i][j] && grid[i][j] == 0) {
                    count++;
                    bfs(i, j, grid, visited);
                }
            }
        }
        return count;
    }

private:
    void bfs(int row, int col, vector<vector<int>>& grid, vector<vector<bool>>& visited) {
        int m = grid.size(), n = grid[0].size();
        visited[row][col] = true;
        queue<pair<int, int>> q;
        q.emplace(row, col);

        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                pair node = q.front();
                q.pop();
                for (auto& dir : directions) {
                    int x = node.first, y = node.second;
                    int nx = x + dir[0], ny = y + dir[1];
                    if (nx < 0 || ny < 0 || nx >= m || ny >= n)
                        continue;
                    if(!visited[nx][ny] && grid[nx][ny] == 0){
                        q.emplace(nx, ny);
                        visited[nx][ny] = true;
                    }
                }
            }
        }
    }
};
```

## Pacific Atlantic Water Flow
[LeetCode](https://leetcode.com/problems/pacific-atlantic-water-flow/)

> **Problem:** Water flows to neighbours of equal or lower height. Return the cells from which water can reach both the Pacific (top/left) and the Atlantic (bottom/right).

DFS uphill from each ocean's borders; cells reached from both oceans are the answer.

```cpp
class Solution {
public:
    int m, n;
    vector<vector<int>> directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};

    void dfs(int r, int c, vector<vector<int>>& heights, vector<vector<bool>>& visited) {
        visited[r][c] = true;
        for(auto& dir: directions){
            int nr = r + dir[0], nc = c + dir[1];
            if(nr < 0 || nc < 0 || nr >= m || nc >= n){
                continue;
            }
            if(heights[nr][nc] >= heights[r][c] && !visited[nr][nc]){
                dfs(nr, nc, heights, visited);
            }
        }
    }

    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        m = heights.size(), n = heights[0].size();

        vector<vector<bool>> pacific(m, vector<bool>(n, false));
        vector<vector<bool>> atlantic(m, vector<bool>(n, false));

        // pacific
        for(int j = 0; j < n; j++) dfs(0, j, heights, pacific);    // top border
        for(int i = 0; i < m; i++) dfs(i, 0, heights, pacific);    // left border

        // atlantic
        for(int j = 0; j < n; j++) dfs(m-1, j, heights, atlantic); // bottom border
        for(int i = 0; i < m; i++) dfs(i, n-1, heights, atlantic); // right border

        vector<vector<int>> result;
        for(int i = 0; i < m; i++){
            for(int j = 0; j < n; j++){
                if(pacific[i][j] && atlantic[i][j])
                    result.push_back({i, j});
            }
        }
        return result;
    }
};
```

## Bus Routes
[LeetCode](https://leetcode.com/problems/bus-routes/)

> **Problem:** `routes[i]` is a bus loop. Return the fewest buses to take from `source` to `target`, or -1 if it can't be done.

BFS over routes: map each stop to the routes serving it; each BFS level is one more bus.

```cpp
class Solution {
public:
    int numBusesToDestination(vector<vector<int>>& routes, int source, int target) {
        if(source == target) return 0;
        unordered_map<int, vector<int>> adj;

        for(int i = 0; i < routes.size(); i++){
            for(auto&stop: routes[i]){
                adj[stop].push_back(i);
            }
        }

        queue<int> q;
        unordered_set<int> visited;

        for(auto route: adj[source]){
            q.push(route);
            visited.insert(route);
        }

        int busCount = 1;

        while(!q.empty()){
            int size = q.size();
            for(int i = 0; i < size; i++){
                int route = q.front();
                q.pop();

                for(auto& stop: routes[route]){
                    if(target == stop){
                        return busCount;
                    }
                    for(auto& nextStop: adj[stop]){
                        if(!visited.count(nextStop)){
                            visited.insert(nextStop);
                            q.push(nextStop);
                        }
                    }
                }
            }
            busCount++;
        }
        return -1;
    }
};
```

## Maximum Candies You Can Get from Boxes
[LeetCode 1298](https://leetcode.com/problems/maximum-candies-you-can-get-from-boxes/)

> **Problem:** Boxes can be open or locked and contain candies, keys and other boxes. Starting from the initial boxes, return the maximum candies you can collect.

```cpp
class Solution {
public:
   int maxCandies(vector<int>& status, vector<int>& candies, vector<vector<int>>& keys,
                  vector<vector<int>>& containedBoxes, vector<int>& initialBoxes) {
       int n = status.size();

       vector<bool> hasBox(n), canOpen(n), used(n);
       for(int i = 0; i < n; i++){
           canOpen[i] = (status[i] == 1);
       }

       queue<int> q;
       int ans = 0;

       for(int box: initialBoxes){
           hasBox[box] = true;
           if(canOpen[box]){
               q.push(box);
               used[box] = true;
               ans += candies[box];
           }
       }

       while(!q.empty()){
           int big_box = q.front();
           q.pop();

           for(int key: keys[big_box]){
               canOpen[key] = true;
               if(!used[key] && hasBox[key]){
                   q.push(key);
                   used[key] = true;
                   ans += candies[key];
               }
           }

           for(int box: containedBoxes[big_box]){
               hasBox[box] = true;
               if(!used[box] && canOpen[box]){
                   q.push(box);
                   used[box] = true;
                   ans += candies[box];
               }
           }
       }
       return ans;
   }
};
```

## Minimum Cost to Make at Least One Valid Path in a Grid
[LeetCode](https://leetcode.com/problems/minimum-cost-to-make-at-least-one-valid-path-in-a-grid/) · 0-1 BFS

> **Problem:** Each cell has an arrow pointing to a neighbour, and changing one costs 1. Return the minimum cost to make a path from the top-left to the bottom-right.

Following the arrow costs 0 (push front); changing direction costs 1 (push back).

```cpp
class Solution {
public:
    int minCost(vector<vector<int>>& grid) {
        vector<vector<int>> directions = {{0, 1}, {0, -1}, {1, 0}, {-1, 0}};

        int m = grid.size();
        int n = grid[0].size();

        deque<pair<int, int>> q;
        vector<vector<int>> minCost(m, vector<int>(n, INT_MAX));

        q.push_front({0, 0});
        minCost[0][0] = 0;

        while (!q.empty()) {
            auto [x, y] = q.front();
            q.pop_front();

            for (int dir = 0; dir < 4; dir++) {
                int nx = x + directions[dir][0];
                int ny = y + directions[dir][1];

                int cost = (grid[x][y] != (dir+1)) ? 1 : 0;

                if(isValid(nx, ny, m, n) && minCost[x][y] + cost < minCost[nx][ny]){
                    minCost[nx][ny] = minCost[x][y] + cost;
                    if(cost == 1){
                        q.push_back({nx, ny});
                    }
                    else{
                        q.push_front({nx, ny});
                    }
                }
            }
        }
        return minCost[m - 1][n - 1];
    }

private:
    bool isValid(int row, int col, int m, int n){
        return (row < m && col < n && row >= 0 && col >= 0);
    }
};
```

## Trapping Rain Water II
[LeetCode](https://leetcode.com/problems/trapping-rain-water-ii/)

> **Problem:** Given a 2D height map, return how much water it can trap.

Min-heap of boundary cells. Always expand from the lowest boundary; a lower neighbour traps `boundary - height` water.

```cpp
class Solution {
public:
    int trapRainWater(vector<vector<int>>& heightMap) {
        // Direction arrays
        int dRow[4] = {0, 0, -1, 1};
        int dCol[4] = {-1, 1, 0, 0};

        int numOfRows = heightMap.size();
        int numOfCols = heightMap[0].size();

        vector<vector<bool>> visited(numOfRows, vector<bool>(numOfCols, false));

        // Priority queue (min-heap) to process boundary cells in increasing height order
        priority_queue<Cell> boundary;

        for (int i = 0; i < numOfRows; i++) {
            boundary.push(Cell(heightMap[i][0], i, 0));
            boundary.push(Cell(heightMap[i][numOfCols - 1], i, numOfCols - 1));
            // Mark left and right boundary cells as visited
            visited[i][0] = visited[i][numOfCols - 1] = true;
        }

        for(int i = 0; i < numOfCols; i++){
            boundary.push(Cell(heightMap[0][i], 0, i));
            boundary.push(Cell(heightMap[numOfRows - 1][i], numOfRows - 1, i));
            visited[0][i] = visited[numOfRows - 1][i] = true;
        }

        int totalWaterVolume = 0;

        while(!boundary.empty()){
            Cell currentCell = boundary.top();
            boundary.pop();

            int currentRow = currentCell.row;
            int currentCol = currentCell.col;
            int minBoundaryHeight = currentCell.height;

            for(int direction = 0; direction < 4; direction++){
                int newRow = currentRow + dRow[direction];
                int newCol = currentCol + dCol[direction];

                if(isValidCell(newRow, newCol, numOfRows, numOfCols) && !visited[newRow][newCol]){
                    int newHeight = heightMap[newRow][newCol];
                    if(newHeight < minBoundaryHeight){
                        totalWaterVolume += minBoundaryHeight - newHeight;
                    }
                    boundary.push(Cell(max(newHeight, minBoundaryHeight), newRow, newCol));
                    visited[newRow][newCol] = true;
                }
            }
        }
        return totalWaterVolume;
    }
private:
    // Struct to store the height and coordinates of a cell in the grid
    class Cell {
    public:
        int height;
        int row;
        int col;

        Cell(int height, int row, int col)
            : height(height), row(row), col(col) {}

        // Reverse comparison so the priority queue is a min-heap on height
        bool operator<(const Cell& other) const {
            return height >= other.height;
        }
    };

    bool isValidCell(int row, int col, int numOfRows, int numOfCols) {
        return row >= 0 && col >= 0 && row < numOfRows && col < numOfCols;
    }
};
```

## Maximal Network Rank
[LeetCode](https://leetcode.com/problems/maximal-network-rank/)

> **Problem:** The network rank of a pair of cities is the number of roads touching either one, with a shared road counted once. Return the maximum rank over all pairs.

The network rank of cities A and B is `degree(A) + degree(B)`, minus 1 if a road joins them directly (it would otherwise be counted twice). Track degrees and a connected matrix, then try every pair.

**Complexity:** O(m) for degrees plus O(n²) for pairs; with n ≤ 100 that is at most 10,000 checks.

```cpp
class Solution {
public:
    int maximalNetworkRank(int n, vector<vector<int>>& roads) {
        vector<int> degree(n, 0);
        vector<vector<bool>> connected(n, vector<bool>(n, false));
        for(auto& road: roads){
            degree[road[0]]++;
            degree[road[1]]++;
            connected[road[0]][road[1]] = true;
            connected[road[1]][road[0]] = true;
        }

        int maxRank = 0;
        for(int i = 0; i < n; i++){
            for(int j = i+1; j < n; j++){
                int rank = degree[i]+degree[j]-(connected[i][j] ? 1 : 0);
                maxRank = max(maxRank, rank);
            }
        }
        return maxRank;
    }
};
```

## Snakes and Ladders
[LeetCode](https://leetcode.com/problems/snakes-and-ladders/)

> **Problem:** On a boustrophedon-numbered board, each move rolls 1–6 and follows any snake or ladder. Return the fewest moves to reach square `n²`, or -1 if impossible.

```cpp
class Solution {
public:
    int n;
    int snakesAndLadders(vector<vector<int>>& board) {
        n = board.size();

        queue<pair<int, int>> q; // number and no. of moves to get to that num
        vector<int> visited(n * n + 1, 0);
        q.emplace(1, 0);
        visited[1] = 1;

        while (!q.empty()) {
            int node = q.front().first;
            int moves = q.front().second;
            q.pop();

            if (node == n * n)
                return moves;

            for (int j = 1; j <= 6; j++) {
                int next = node + j;
                if (next > n * n)
                    break;

                pair coord = numToPos(next);
                int r = coord.first, c = coord.second;

                if (board[r][c] != -1) {
                    next = board[r][c];
                }
                if (!visited[next]) {
                    visited[next] = 1;
                    q.emplace(next, moves + 1);
                }
            }
        }
        return -1;
    }

    pair<int, int> numToPos(int num) {
        int r = n - 1 - (num - 1) / n;
        int c = (num - 1) % n;
        if ((n - 1 - r) % 2 ) {
            c = n - 1 - c;
        }
        return {r, c};
    }
};
```

For `n = 6` the numbering zigzags:

```
36 35 34 33 32 31
25 26 27 28 29 30
24 23 22 21 20 19
13 14 15 16 17 18
12 11 10  9  8  7
 1  2  3  4  5  6
```

The `if ((n - 1 - r) % 2)` check handles the zigzag: on odd-numbered rows (counted from the bottom) the direction is right-to-left, so the column flips to `n - 1 - c`.

## Maximum Employees to Be Invited to a Meeting
[LeetCode](https://leetcode.com/problems/maximum-employees-to-be-invited-to-a-meeting/) · Longest cycle and extended paths · video: *Leetcode 2127 – Python*

> **Problem:** Each employee will attend only if they can sit next to their favourite person at a round table. Return the maximum number who can be invited.

Two possibilities:

1. A complete cycle of length ≥ 3 — it cannot connect to anything else.
2. Cycles of length 2 — each can be extended by the longest chain into either endpoint, and all such structures can sit together.

```cpp
class Solution {
public:
    int maximumInvitations(vector<int>& favorite) {
        // Reverse the graph: i --> favorite[i] becomes favorite[i] --> i
        int n = favorite.size();
        vector<vector<int>> adj(n);
        for(int i = 0; i < n; i++){
            adj[favorite[i]].push_back(i);
        }

        // cycle detection
        int longestCycle = 0, twoCycleInvitations = 0;
        vector<bool> visited(n, false);

        for(int person = 0; person < n; person++){
            if(!visited[person]){
                unordered_map<int, int> visitedPerson;
                int current = person;
                int dist = 0;
                while(true){
                    if(visited[current]) break;

                    visited[current] = true;
                    visitedPerson[current] = dist++;
                    int next = favorite[current];
                    // cycle detected
                    if(visitedPerson.count(next)){
                        int cycleLength = dist - visitedPerson[next];
                        longestCycle = max(longestCycle, cycleLength);

                        // starting bfs for 2 length cycles
                        if(cycleLength == 2){
                            unordered_set<int> visitedNodes = {current, next};
                            twoCycleInvitations += bfs(visitedNodes, adj, current) + bfs(visitedNodes, adj, next) + 2;
                        }
                        break;
                    }
                    current = next;
                }
            }
        }
        return max(longestCycle, twoCycleInvitations);
    }

    int bfs(unordered_set<int>& visited, vector<vector<int>>& adj, int node){
        queue<pair<int, int>> q;
        q.emplace(node, 0);
        int max_distance = 0;
        while(!q.empty()){
            auto [currNode, dist] = q.front();
            q.pop();
            for(auto& next: adj[currNode]){
                if(visited.find(next) == visited.end()){
                    q.emplace(next, dist+1);
                    visited.insert(next);
                    max_distance = max(max_distance, dist+1);
                }
            }
        }
        return max_distance;
    }
};
```

## Shortest Cycle in a Graph
[LeetCode](https://leetcode.com/problems/shortest-cycle-in-a-graph/)

> **Problem:** Return the length of the shortest cycle in an undirected graph, or -1 if there's no cycle.

BFS from every node; meeting an already-visited non-parent node closes a cycle of length `dist[node] + dist[next] + 1`.

```cpp
class Solution {
public:
    int findShortestCycle(int n, vector<vector<int>>& edges) {
        int minLen = INT_MAX;
        vector<vector<int>> adj(n);

        for(auto& edge: edges){
            adj[edge[0]].push_back(edge[1]);
            adj[edge[1]].push_back(edge[0]);
        }

        for(int start = 0; start < n; start++){
            vector<int> dist(n, -1);
            queue<pair<int, int>> q; // {node, parent}

            q.push({start, -1});
            dist[start] = 0;

            while(!q.empty()){
                auto [node, parent] = q.front();
                q.pop();

                for(auto& next : adj[node]){
                    if(dist[next] == -1) {
                        dist[next] = dist[node] + 1;
                        q.push({next, node});
                    } else if(next != parent) {
                        // Cycle found
                        minLen = min(minLen, dist[node] + dist[next] + 1);
                    }
                }
            }
        }
        return minLen == INT_MAX ? -1 : minLen;
    }
};
```

## Course Schedule IV
[LeetCode](https://leetcode.com/problems/course-schedule-iv/) · Floyd Warshall

> **Problem:** Given prerequisite pairs, answer whether course `u` is a (direct or indirect) prerequisite of course `v` for each query.

### Transitive closure — O(N³)

If `i` is a prerequisite of `k` and `k` of `j`, then `i` is a prerequisite of `j` (`k` = intermediate, `i` = source, `j` = target).

```cpp
class Solution {
public:
    vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
      vector<vector<bool>> isPrereq(numCourses, vector<bool>(numCourses, false));

      for(auto& edge: prerequisites){
        isPrereq[edge[0]][edge[1]] = true;
      }

      for(int k = 0; k < numCourses; k++){
        for(int i = 0; i < numCourses; i++){
            for(int j = 0; j < numCourses; j++){
                isPrereq[i][j] = isPrereq[i][j] || (isPrereq[i][k] && isPrereq[k][j]);
            }
        }
      }
      vector<bool> ans;
      for(auto& q: queries){
        ans.push_back(isPrereq[q[0]][q[1]]);
      }
      return ans;
    }
};
```

### Improved: topological BFS — O(N² + Q)

```cpp
class Solution {
public:
    vector<bool> checkIfPrerequisite(int numCourses, vector<vector<int>>& prerequisites, vector<vector<int>>& queries) {
        vector<vector<int>> adj(numCourses);
        vector<int> indegree(numCourses, 0);
        vector<unordered_set<int>> reach(numCourses);

        for (auto& pre : prerequisites) {
            adj[pre[0]].push_back(pre[1]);
            indegree[pre[1]]++;
        }

        queue<int> q;
        for (int i = 0; i < numCourses; i++) {
            if (indegree[i] == 0) {
                q.push(i);
            }
        }

        while (!q.empty()) {
            int node = q.front();
            q.pop();

            for (int next : adj[node]) {
                reach[next].insert(node);
                reach[next].insert(reach[node].begin(), reach[node].end());

                if (--indegree[next] == 0) {
                    q.push(next);
                }
            }
        }

        vector<bool> ans;
        for (auto& query : queries) {
            ans.push_back(reach[query[1]].count(query[0]));
        }
        return ans;
    }
};
```

## Find the City With the Smallest Number of Neighbors at a Threshold Distance
[LeetCode](https://leetcode.com/problems/find-the-city-with-the-smallest-number-of-neighbors-at-a-threshold-distance/) · Floyd Warshall, O(n³) time, O(n²) space

> **Problem:** Return the city that can reach the fewest other cities within `distanceThreshold`. On ties, return the city with the largest number.

```cpp
class Solution {
public:
    int findTheCity(int n, vector<vector<int>>& edges, int threshold) {
        // first build the cost matrix
        vector<vector<int>> cost(n, vector<int>(n, INT_MAX));
        for(int i = 0; i < n; i++) cost[i][i] = 0;
        for (auto& edge : edges) {
            int u = edge[0], v = edge[1], weight = edge[2];
            cost[u][v] = weight;
            cost[v][u] = weight;
        }

        for (int k = 0; k < n; k++) {
            for (int i = 0; i < n; i++) {
                for (int j = 0; j < n; j++) {
                    if(cost[i][k] == INT_MAX || cost[k][j] == INT_MAX) continue;
                    cost[i][j] = min(cost[i][j], cost[i][k] + cost[k][j]);
                }
            }
        }

        int city = -1;
        int globalCount = n;
        for (int i = 0; i < n; i++) {
            int count = 0;
            for (int j = 0; j < n; j++) {
                if (cost[i][j] <= threshold) {
                    count++;
                }
            }
            if (count <= globalCount) {
                globalCount = count;
                city = i;
            }
        }
        return city;
    }
};
```

## Divide Nodes Into the Maximum Number of Groups
[LeetCode](https://leetcode.com/problems/divide-nodes-into-the-maximum-number-of-groups/)

> **Problem:** Assign nodes to numbered groups so that every edge connects groups whose numbers differ by exactly 1. Return the maximum number of groups, or -1 if impossible.

The graph must be bipartite. For each component, the maximum number of groups is its longest shortest path (BFS depth) over all choices of start node, like the height of the component rooted at the best node. Sum those over components.

```cpp
class Solution {
public:
    int magnificentSets(int n, vector<vector<int>>& edges) {
        vector<vector<int>> adj(n);

        for (auto& edge : edges) {
            // 0-based indexing
            adj[edge[0] - 1].push_back(edge[1] - 1);
            adj[edge[1] - 1].push_back(edge[0] - 1);
        }

        vector<int> colors(n, -1);
        for(int i = 0; i < n; i++){
            if(colors[i] == -1){
                colors[i] = 0;
            }
            if(!isBipartite(i, colors, adj)) return -1;
        }

        vector<int> distances(n);
        for (int node = 0; node < n; node++) {
            distances[node] = getLongestShortestPath(node, adj, n);
        }

        int maxNumberOfGroups = 0;
        vector<bool> visited(n, false);
        for (int node = 0; node < n; node++) {
            if (visited[node]) continue;
            // Add the number of groups for this component to the total
            maxNumberOfGroups += getNumberOfGroupsForComponent(adj, node, distances, visited);
        }
        return maxNumberOfGroups;
    }

    int getNumberOfGroupsForComponent(vector<vector<int>>& adj, int node, vector<int>& distances, vector<bool>& visited){
        int max_groups = distances[node];
        visited[node] = true;
        for(auto& next: adj[node]){
            if(!visited[next]){
                max_groups = max(max_groups, getNumberOfGroupsForComponent(adj, next, distances, visited));
            }
        }
        return max_groups;
    }

    int getLongestShortestPath(int node, vector<vector<int>>& adj, int n) {
        queue<int> q;
        vector<int> visited(n);
        visited[node] = 1;
        q.push(node);

        int depth = 0;
        while (!q.empty()) {
            int sz = q.size();
            for (int i = 0; i < sz; i++) {
                int cur_node = q.front();
                q.pop();
                for (auto& next : adj[cur_node]) {
                    if (!visited[next]) {
                        visited[next] = 1;
                        q.push(next);
                    }
                }
            }
            ++depth;
        }
        return depth;
    }

    bool isBipartite(int node, vector<int>& colors, vector<vector<int>>& adj){
        for(int next: adj[node]){
            if(colors[next] == colors[node])
            {
                return false;
            }
            if(colors[next] != -1) continue;

            colors[next] = (colors[node] + 1)%2;
            if(isBipartite(next, colors, adj) == false) return false;
        }
        return true;
    }
};
```

## Count the Number of Complete Components
[LeetCode](https://leetcode.com/problems/count-the-number-of-complete-components/)

> **Problem:** Count the connected components in which every pair of vertices is joined by an edge.

A component with `k` nodes is complete when it has exactly `k·(k−1)/2` edges.

```cpp
class Solution {
public:
    int countCompleteComponents(int n, vector<vector<int>>& edges) {
        vector<vector<int>> adj(n);
        for(auto& edge: edges){
            adj[edge[0]].push_back(edge[1]);
            adj[edge[1]].push_back(edge[0]);
        }
        vector<int> visited(n, 0);
        int ans = 0;
        // for each connected component, count the no. of edges and nodes
        for(int i = 0; i < n; i++){
            if(!visited[i]){
                int nodeCount = 0;

                queue<int> q;
                q.push(i);
                visited[i] = 1;
                vector<int> componentNodes;
                componentNodes.push_back(i);

                while(!q.empty()){
                    auto node = q.front();
                    q.pop();
                    nodeCount++;
                    for(auto& nbr: adj[node]){
                        if(!visited[nbr]){
                            visited[nbr] = 1;
                            q.push(nbr);
                            componentNodes.push_back(nbr);
                        }
                    }
                }

                // count the no. of edges
                int edgeCount = 0;
                for(auto& node: componentNodes){
                    edgeCount += adj[node].size();
                }
                edgeCount /= 2;

                if(edgeCount == nodeCount*(nodeCount - 1)/2){
                    ans++;
                }
            }
        }
        return ans;
    }
};
```

## Find Minimum Diameter After Merging Two Trees
[LeetCode](https://leetcode.com/problems/find-minimum-diameter-after-merging-two-trees/) · LeetCode Daily

> **Problem:** Connect one node from each of two trees with an edge. Return the minimum possible diameter of the resulting tree.

**Intuition:** let `L` be a tree's diameter (longest path). Joining the two trees at their centres gives `ceil(L1/2) + ceil(L2/2) + 1`. The answer is the max of that and both original diameters.

**Approach** ([longest path in an undirected tree](https://www.geeksforgeeks.org/longest-path-undirected-tree/)) — two BFS passes:

1. From any node, find the farthest node `x`.
2. From `x`, find the farthest node `y`.
3. The distance from `x` to `y` is the diameter.

**Time:** O(V + E) per tree; a tree has n−1 edges, so O(n + m) total.

```cpp
class Solution {
public:
    int minimumDiameterAfterMerge(vector<vector<int>>& edges1, vector<vector<int>>& edges2) {
        // convert to adj_list A and B
        int n = edges1.size() + 1;
        int m = edges2.size() + 1;
        vector<vector<int>> adjA(n), adjB(m);

        for (auto& edge : edges1) {
            adjA[edge[0]].push_back(edge[1]);
            adjA[edge[1]].push_back(edge[0]);
        }
        for (auto& edge : edges2) {
            adjB[edge[0]].push_back(edge[1]);
            adjB[edge[1]].push_back(edge[0]);
        }

        int dia1 = findDiameter(n, adjA);
        int dia2 = findDiameter(m, adjB);

        int mergeDia = ceil(dia1/2.0) + ceil(dia2/2.0) + 1; // +1 for the new edge

        return max({dia1, dia2, mergeDia});
    }

    int findDiameter(int n, vector<vector<int>>& adj) {
        int farthestNode = findFarthestNode(n, adj, 0).first;
        int distance = findFarthestNode(n, adj, farthestNode).second;
        return distance;
    }

    pair<int, int> findFarthestNode(int n, vector<vector<int>>& adj, int source) {
        int max_d = 0;
        queue<int> q;
        vector<bool> visited(n, false);

        q.push(source);
        visited[source] = true;
        int farthestNode = source;

        while (!q.empty()) {
            int n = q.size();
            for (int i = 0; i < n; i++) {
                int node = q.front();
                q.pop();
                farthestNode = node;
                for (auto& next : adj[node]) {
                    if (!visited[next]) {
                        visited[next] = true;
                        q.push(next);
                    }
                }
            }
            if (!q.empty())
                max_d++;
        }
        return {farthestNode, max_d};
    }
};
```
