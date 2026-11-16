## GFG Weekly 172
[Contest problems](https://practice.geeksforgeeks.org/contest/gfg-weekly-172-rated-contest/problems)

No solution recorded in the notes.

## Get Count — DFS on Tree (GFG Weekly 173)
[Contest problems](https://practice.geeksforgeeks.org/contest/gfg-weekly-173-rated-contest/problems)

Compute every subtree size with one DFS, count nodes whose subtree size is `x` and `y`, and return the product.

```cpp
#include <iostream>
#include <vector>
using namespace std;

class Solution {
  public:
    vector<int> subtree_size;
    vector<vector<int>> tree;

    // Perform DFS to calculate subtree sizes
    int dfs(int node, int parent) {
        subtree_size[node] = 1;  // Initialize size as 1 (counting the node itself)
        for (int neighbor : tree[node]) {
            if (neighbor != parent) {  // Avoid revisiting the parent node
                subtree_size[node] += dfs(neighbor, node);
            }
        }
        return subtree_size[node];
    }

    long long getCount(int n, vector<vector<int>> &edges, int x, int y) {
        subtree_size.assign(n + 1, 0);       // 1-indexed
        tree.assign(n + 1, vector<int>());   // 1-indexed adjacency list

        for (const auto &edge : edges) {
            int u = edge[0], v = edge[1];
            tree[u].push_back(v);
            tree[v].push_back(u);
        }

        // Perform DFS starting from node 1 (rooted at 1 as per the problem)
        dfs(1, -1);

        long long count_x = 0, count_y = 0;
        for (int i = 1; i <= n; ++i) {
            if (subtree_size[i] == x) count_x++;
            if (subtree_size[i] == y) count_y++;
        }
        // The total number of valid pairs is simply the product of the counts
        return count_x * count_y;
    }
};

int main() {
    Solution sol;
    int n = 8;
    vector<vector<int>> edges = {{1, 2}, {1, 3}, {2, 4}, {2, 5}, {3, 6}, {6, 7}, {5, 8}};
    int x = 3, y = 2;
    cout << sol.getCount(n, edges, x, y) << endl;  // Output should be 2
    return 0;
}
```

## Maximize the Total Height of Unique Towers (LC Biweekly 140)
[LeetCode](https://leetcode.com/contest/biweekly-contest-140/problems/maximize-the-total-height-of-unique-towers/)

> **Problem:** Assign each tower a positive height no greater than its `maximumHeight[i]`, with all heights distinct. Return the maximum total height, or -1 if that's impossible.

```cpp
class Solution {
public:
   long long maximumTotalSum(vector<int>& maximumHeight) {
       sort(maximumHeight.begin(), maximumHeight.end(), [](const int&a, const int &b) -> bool {
           return a > b;
       });

       long long total = 0;
       long long prev = (long long) INT_MAX;

       for(auto& h: maximumHeight){
           long long assign = min((long long)h , prev-1);
           if(assign <= 0){
               return -1;
           }
           total += assign;
           prev = assign;
       }
       return total;
   }
};
```

### Approach

1. **Sort in descending order** so the largest allowed heights are assigned first.
2. **Assign greedily:** start `prev` above any possible height (`INT32_MAX`). Each tower gets `min(h, prev - 1)`.
3. If an assigned height is `<= 0`, unique positive heights are impossible, so return `-1`.
4. Accumulate the assigned heights and return the total.

### Version with a test driver

```cpp
long long maxTowerHeightSum(vector<int>& maximumHeight) {
    // Sort the maximum heights in descending order
    sort(maximumHeight.begin(), maximumHeight.end(), [](const int &a, const int &b) -> bool {
        return a > b;
    });

    long long total = 0;
    long long prev = static_cast<long long>(INT32_MAX); // previous height starts large

    for(auto &h : maximumHeight){
        // Assign the minimum between the current maximum height and (prev - 1)
        long long assign = min(static_cast<long long>(h), prev - 1);
        // If the assigned height is not positive, it's impossible to assign unique heights
        if(assign <= 0){
            return -1;
        }
        total += assign;
        prev = assign;
    }
    return total;
}

int main(){
    vector<int> maximumHeight1 = {2, 3, 4, 3};
    cout << "Output for Example 1: " << maxTowerHeightSum(maximumHeight1) << endl; // 10

    vector<int> maximumHeight2 = {15, 10};
    cout << "Output for Example 2: " << maxTowerHeightSum(maximumHeight2) << endl; // 25

    vector<int> test1 = {1, 1};
    cout << "Output for Test Case 1 (All 1s): " << maxTowerHeightSum(test1) << endl; // -1

    vector<int> test2 = {1, 2, 3, 4, 5};
    cout << "Output for Test Case 2: " << maxTowerHeightSum(test2) << endl; // 15

    vector<int> test3 = {5, 4, 3, 3};
    cout << "Output for Test Case 3: " << maxTowerHeightSum(test3) << endl; // 14

    vector<int> test4 = {3, 3, 3, 3};
    cout << "Output for Test Case 4: " << maxTowerHeightSum(test4) << endl; // -1
    return 0;
}
```

### Complexity

- **Time:** sorting is O(n log n); the assignment pass is O(n). Overall O(n log n).
- **Space:** sorting is in place, so O(1) auxiliary space.

## GFG Weekly 175
[Contest problems](https://practice.geeksforgeeks.org/contest/gfg-weekly-175-rated-contest-1447/problems)

No solution recorded in the notes.

## Round Trip — DP on Trees (GFG Weekly 178)
[Contest problems](https://practice.geeksforgeeks.org/contest/gfg-weekly-178-rated-contest/problems)

`dp[u]` = the maximum excitement achievable on a round trip that starts at node `u` and stays in its subtree.

- `dp[u] = A[u]`
- for each child `v` reached by an edge of length `len`: `dp[u] += max(0, dp[v] - 2·len)` (the edge is walked there and back).

```cpp
class Solution {
  public:
    void dfs(int node, int parent,
    vector<vector<pair<int, int>>>& adj, vector<long long>& dp,
    vector<int>&a){

        dp[node] = a[node]; // reaching the node for the 1st time adds the excitement
        for(auto& neighbour: adj[node]){
            int next = neighbour.first;
            int len = neighbour.second;

            if(next == parent)
                continue;
            dfs(next, node, adj, dp, a);

            dp[node] += max(0LL, dp[next] - 2LL*len);
        }
    }

    long long roundTrip(int n, vector<int> &a, vector<vector<int>> &g) {
        vector<vector<pair<int, int>>> adj(n);

        for(int i = 0; i < n-1; i++)
        {
            int u = g[i][0], v = g[i][1], len = g[i][2];
            --u;
            --v;
            adj[u].push_back({v, len});
            adj[v].push_back({u, len});
        }

        vector<long long> dp(n);
        dfs(0, -1, adj, dp, a);

        long long ans = 0;
        for(int i = 0; i < n; i++){
            ans = max(ans, dp[i]);
        }
        return ans;
    }
};
```

## Difference Sum (GFG Weekly 180)
Given two complete binary trees, return the sum of absolute differences between corresponding nodes. A missing node counts as 0.

Level-order traverse both trees in lockstep.

```cpp
class Solution {
  public:
    int differenceSum(Node* root1, Node* root2) {
        if (!root1 && !root2) return 0;  // Both trees are empty, sum = 0

        queue<Node*> q1, q2;
        q1.push(root1);
        q2.push(root2);

        int sum = 0;

        while (!q1.empty() || !q2.empty()) {
            Node* node1 = nullptr;
            Node* node2 = nullptr;

            if (!q1.empty()) {
                node1 = q1.front();
                q1.pop();
            }
            if (!q2.empty()) {
                node2 = q2.front();
                q2.pop();
            }

            // Compute the absolute difference
            int val1 = node1 ? node1->data : 0;
            int val2 = node2 ? node2->data : 0;
            sum += abs(val1 - val2);

            // Push left and right children if nodes exist
            if (node1) {
                if (node1->left) q1.push(node1->left);
                if (node1->right) q1.push(node1->right);
            }
            if (node2) {
                if (node2->left) q2.push(node2->left);
                if (node2->right) q2.push(node2->right);
            }
        }
        return sum;
    }
};
```

## Sherlock and Cost (Mock Test 1)
[HackerRank](https://www.hackerrank.com/challenges/sherlock-and-cost/)

> **Problem:** Given `B`, build `A` with `1 ≤ A[i] ≤ B[i]` that maximises the sum of `|A[i] - A[i-1]|`. Return that maximum.

Each position takes either `1` or `B[i]`. Recursion with memoization on `(index, previous value)`.

```cpp
map<pair<int, int>, int> mp;
// Top --> i = 0 to i = n

int f(int i, int prevElement, vector<int>& B){
    // Base case
    if(i == B.size()){
        return 0;
    }
    if(mp.find({i, prevElement}) != mp.end())
        return mp[{i, prevElement}];

    int take_1 = abs(1 - prevElement) + f(i+1, 1, B);
    int take_ele = abs(B[i] - prevElement) + f(i+1, B[i], B);

    return mp[{i, prevElement}] = max(take_1, take_ele);
}

int cost(vector<int> B) {
    // take 1 or B[i], and calculate the max cost associated across all such decisions
    mp.clear();
    return max(f(1, 1, B), f(1, B[0], B));
}
```

## Roads and Libraries (Mock Test 1)
[HackerRank](https://www.hackerrank.com/challenges/torque-and-development/problem)

> **Problem:** Given cities, buildable roads, the cost of a library and the cost of a road, return the minimum cost so that every city can reach a library.

Find the minimum cost to give every city library access. If a library costs no more than a road, build a library in every city. Otherwise each connected component gets one library and `size - 1` roads.

```cpp
long long roadsAndLibraries(int n, int c_lib, int c_road, vector<vector<int>>& cities) {
    if (c_lib <= c_road) {
        // If a library costs no more than a road, build a library in each city.
        return (long long)c_lib * n;
    }

    vector<vector<int>> graph(n + 1);
    for (const auto& road : cities) {
        graph[road[0]].push_back(road[1]);
        graph[road[1]].push_back(road[0]);
    }

    vector<bool> visited(n + 1, false);
    long long cost = 0;

    for (int i = 1; i <= n; i++) {
        if (!visited[i]) {
            // This is a new connected component.
            cost += c_lib;  // Build a library in the first city of the component.

            // Use BFS to explore the connected component.
            queue<int> q;
            q.push(i);
            visited[i] = true;

            while (!q.empty()) {
                int current = q.front();
                q.pop();

                for (int neighbor : graph[current]) {
                    if (!visited[neighbor]) {
                        visited[neighbor] = true;
                        q.push(neighbor);
                        cost += c_road;  // Build a road to connect the cities.
                    }
                }
            }
        }
    }
    return cost;
}
```
