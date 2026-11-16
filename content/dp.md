## Maximum Number of Moves in a Grid
[LeetCode](https://leetcode.com/problems/maximum-number-of-moves-in-a-grid/)

> **Problem:** Start in any cell of the first column. Move to the up-right, right or down-right cell, but only to a strictly larger value. Return the maximum number of moves.

### BFS level by level

Each BFS level is one move, so count levels instead of individual moves. A visited matrix avoids reprocessing cells.

```cpp
class Solution {
public:
    int maxMoves(vector<vector<int>>& grid) {
        vector<pair<int, int>> directions = {{-1, 1}, {0, 1}, {1, 1}};
        queue<pair<int, int>> q;
        vector<vector<bool>> visited(grid.size(), vector<bool>(grid[0].size(), false));
        int ans = 0;

        for (int i = 0; i < grid.size(); i++) {
            q.push({i, 0});
            visited[i][0] = true;
        }
        while (!q.empty()) {
            int n = q.size();
            bool moved = false;
            for (int i = 0; i < n; i++) {
                auto node = q.front();
                q.pop();
                int row = node.first;
                int col = node.second;

                for (auto& dir : directions) {
                    int newR = row + dir.first;
                    int newC = col + dir.second;
                    if (isValidCell(newR, newC, grid, visited)) {
                        if (grid[newR][newC] > grid[row][col]) {
                            visited[newR][newC] = true;
                            q.push({newR, newC});
                            moved = true;
                        }
                    }
                }
            }
            if (moved)
                ans++;
        }
        return ans;
    }

    bool isValidCell(int x, int y, vector<vector<int>>& grid, vector<vector<bool>>& visited) {
        return (x < grid.size() && y < grid[0].size() && x >= 0 && y >= 0 && !visited[x][y]);
    }
};
```

### Top-down DP

```cpp
class Solution {
public:
    const int dirs[3] = {-1, 0, 1};

    int dfs(int row, int col, vector<vector<int>>& grid, vector<vector<int>>& dp) {
        int M = grid.size(), N = grid[0].size();
        if (dp[row][col] != -1) {
            return dp[row][col];
        }
        int maxMoves = 0;
        for (int dir : dirs) {
            int new_r = row + dir, new_c = col + 1;
            if (new_r < M && new_c < N && new_r >= 0 && new_c >= 0 &&
                grid[new_r][new_c] > grid[row][col])
                maxMoves = max(maxMoves, 1 + dfs(new_r, new_c, grid, dp));
        }
        return dp[row][col] = maxMoves;
    }

    int maxMoves(vector<vector<int>>& grid) {
        int maxM = 0;
        vector<vector<int>> dp(grid.size(), vector<int>(grid[0].size(), -1));
        for(int i = 0; i < grid.size(); i++){
            maxM = max(maxM, dfs(i, 0, grid, dp));
        }
        return maxM;
    }
};
```

## Minimum Number of Removals to Make Mountain Array
[LeetCode](https://leetcode.com/problems/minimum-number-of-removals-to-make-mountain-array)

> **Problem:** Return the minimum number of elements to remove so the array becomes a mountain: strictly increasing, then strictly decreasing, with each side non-empty.

### DP — O(N²)

```cpp
class Solution {
public:
    int minimumMountainRemovals(vector<int>& nums) {
        int n = nums.size();
        vector<int> lis(n, 1);
        vector<int> lds(n, 1);

        for(int i = 0; i < n; i++){
            for(int j = i-1; j >= 0; j--){
                if(nums[i] > nums[j]){
                    lis[i] = max(lis[i], lis[j] + 1);
                }
            }
        }

        for(int i = n; i >= 0; i--){
            for(int j = i+1; j < n; j++){
                if(nums[i] > nums[j]){
                    // every element at index j should be strictly smaller than the ith element
                    lds[i] = max(lds[i], lds[j] + 1);
                }
            }
        }

        int minRemovals = INT_MAX;
        for(int i = 0; i < n; i++){
            if(lis[i] > 1 && lds[i] > 1){
                minRemovals = min(minRemovals, n + 1 - lds[i]- lis[i]);
            }
        }
        return minRemovals;
    }
};
```

### Binary search — O(N log N)

```cpp
class Solution {
public:
    vector<int> getLis(vector<int>& v) {
        vector<int> lisLen(v.size(), 1);
        vector<int> lis = {v[0]};

        for (int i = 1; i < v.size(); i++) {
            auto it = lower_bound(lis.begin(), lis.end(), v[i]);
            if (it == lis.end()) {
                lis.push_back(v[i]);
            }
            else {
                *it = v[i];
            }
            lisLen[i] = lis.size();
        }
        return lisLen;
    }

    int minimumMountainRemovals(vector<int>& nums) {
        int n = nums.size();
        vector<int> lisLength = getLis(nums);

        reverse(nums.begin(), nums.end());
        vector<int> ldsLength = getLis(nums);
        reverse(ldsLength.begin(), ldsLength.end());

        int minRemovals = INT_MAX;
        for(int i = 0; i < n; i++){
            if(lisLength[i] > 1 && ldsLength[i] > 1){
                minRemovals = min(minRemovals, n - lisLength[i] - ldsLength[i] + 1);
            }
        }
        return minRemovals;
    }
};
```

## Minimum Total Distance Traveled
[LeetCode](https://leetcode.com/problems/minimum-total-distance-traveled/) · Recursion with memoization

> **Problem:** Robots and factories sit on a line, and factory `j` can repair at most `limit_j` robots. Return the minimum total distance the robots travel to get repaired.

1. Sort robots and factories; flatten each factory into `limit` copies of its position.
2. For each `(robotIdx, factoryIdx)` either assign the robot to this factory slot and move both forward, or skip the slot.

```cpp
class Solution {
public:
    long long minimumTotalDistance(vector<int>& robot, vector<vector<int>>& factory) {
        sort(robot.begin(), robot.end());
        sort(factory.begin(), factory.end());

        // flatten the factory
        vector<int> factoryPositions;
        for (auto& f : factory) {
            for (int i = 0; i < f[1]; i++) {
                factoryPositions.push_back(f[0]);
            }
        }

        int robotCount = robot.size(), factoryCount = factoryPositions.size();
        vector<vector<long long>> memo(robotCount, vector<long long>(factoryCount, -1));

        return calculateMinDistance(0, 0, robot, factoryPositions, memo);
    }

    long long calculateMinDistance(int robotIdx, int factoryIdx, vector<int>& robot,
                                   vector<int>& factoryPositions, vector<vector<long long>>& memo) {
        if (robotIdx == robot.size()) {
            return 0;
        }
        if (factoryIdx == factoryPositions.size()) {
            return 1e12;
        }
        if (memo[robotIdx][factoryIdx] != -1)
            return memo[robotIdx][factoryIdx];

        long long assign = abs(robot[robotIdx] - factoryPositions[factoryIdx]) +
                           calculateMinDistance(robotIdx + 1, factoryIdx + 1, robot, factoryPositions, memo);

        long long skip = calculateMinDistance(robotIdx, factoryIdx + 1, robot, factoryPositions, memo);

        return memo[robotIdx][factoryIdx] = min(assign, skip);
    }
};
```

## House Robber
[LeetCode](https://leetcode.com/problems/house-robber/)

> **Problem:** You can't rob two adjacent houses. Return the maximum money you can rob.

Bottom-up with two variables (space optimised).

```cpp
class Solution {
public:
    int rob(vector<int>& nums) {
        int prev_1 = nums[0];
        int prev_2 = 0;

        for(int i = 1; i < nums.size(); i++){
            int take = nums[i];
            if(i > 1)
                take += prev_2;

            int non_take = prev_1;

            int cur = max(take, non_take);
            prev_2 = prev_1;
            prev_1 = cur;
        }
        return prev_1;
    }
};
```

## House Robber II
[LeetCode](https://leetcode.com/problems/house-robber-ii/)

> **Problem:** Same as House Robber, but the houses form a circle, so the first and last are adjacent.

Houses form a circle: run House Robber once without the first house and once without the last.

```cpp
class Solution {
public:
    int sub_rob(vector<int>& nums) {
        int prev_1 = nums[0];
        int prev_2 = 0;

        for (int i = 1; i < nums.size(); i++) {
            int take = nums[i];
            if (i > 1)
                take += prev_2;
            int non_take = prev_1;
            int cur = max(take, non_take);
            prev_2 = prev_1;
            prev_1 = cur;
        }
        return prev_1;
    }

    int rob(vector<int>& nums) {
        vector<int> temp1, temp2;
        int n = nums.size();
        if(n==1)
            return nums[0];
        for(int i = 0; i < n; i++){
            if(i != 0) temp1.push_back(nums[i]);
            if(i != n-1) temp2.push_back(nums[i]);
        }

        int ans1 = sub_rob(temp1);
        int ans2 = sub_rob(temp2);
        return max(ans1, ans2);
    }
};
```

## Ninja's Training
[Naukri Code 360](https://www.naukri.com/code360/problems/ninja-s-training_3621003) · [Solution walk-through](https://chatgpt.com/share/6728b8e8-56f8-800b-962c-6284b1b4fb89)

> **Problem:** Each day the ninja picks one of three activities, each with given points, but can't repeat the previous day's activity. Return the maximum total points.

Over N days Ninja does one of three activities per day, never the same one on consecutive days. `POINTS[i][j]` is the merit for activity j on day i. Maximise the total. Example: `[[1,2,5],[3,1,1],[3,3,3]]` → 11 (5 + 3 + 3).

### Recursion + memoization (top-down)

```cpp
int f(int day, int last, vector<vector<int>>& points, vector<vector<int>>& dp){
    if(dp[day][last] != -1)
        return dp[day][last];

    if(day == 0){
        int maxi = 0;
        for(int i = 0; i < 3; i++){
            if(i != last){
                maxi = max(maxi, points[day][i]);
            }
        }
        return maxi;
    }

    int maxi = 0;
    for(int task = 0; task < 3; task++){
        if(last != task){
            int point = points[day][task] + f(day-1, task, points, dp);
            maxi = max(maxi, point);
        }
    }
    return dp[day][last] = maxi;
}

int ninjaTraining(int n, vector<vector<int>> &points)
{
    vector<vector<int>> dp(n, vector<int>(4, -1));
    return f(n-1, 3, points, dp);
}
```

### Bottom-up

```cpp
int ninjaTraining(int n, vector<vector<int>> &points)
{
    vector<vector<int>> dp(n, vector<int>(4, 0));

    for(int last = 0; last < 4; last++){
        dp[0][last] = 0;
        for(int task = 0; task < 3; task++){
            if(task != last){
                dp[0][last] = max(dp[0][last], points[0][task]);
            }
        }
    }

    // Fill the DP table for days 1 to n-1
    for(int day = 1; day < n; day++) {
        for(int last = 0; last < 4; last++) {
            dp[day][last] = 0;
            for(int task = 0; task < 3; task++) {
                if(task != last) {
                    dp[day][last] = max(dp[day][last], points[day][task] + dp[day-1][task]);
                }
            }
        }
    }
    // The answer is the maximum points on the last day with no restriction on the last task
    return dp[n-1][3];
}
```

### Space optimised 1-D array

```cpp
int ninjaTraining(int n, vector<vector<int>> &points)
{
    vector<int> prev(4, 0);
    vector<int> curr(4, 0);

    for(int last = 0; last < 4; last++){
        prev[last] = 0;
        for(int task = 0; task < 3; task++){
            if(task != last){
                prev[last] = max(prev[last], points[0][task]);
            }
        }
    }

    for(int day = 1; day < n; day++) {
        for(int last = 0; last < 4; last++) {
            curr[last] = 0;
            for(int task = 0; task < 3; task++) {
                if(task != last) {
                    curr[last] = max(curr[last], points[day][task] + prev[task]);
                }
            }
        }
        prev = curr;
    }
    return prev[3];
}
```

## Unique Paths
[LeetCode](https://leetcode.com/problems/unique-paths/)

> **Problem:** A robot at the top-left of an `m × n` grid moves only right or down. Count the paths to the bottom-right.

```cpp
class Solution {
public:
    int uniquePaths(int m, int n) {
       vector<int> dp(n, 1);

        for(int i = 1; i < m; i++){
            for(int j = 1; j < n; j++){
                dp[j] = dp[j] + dp[j-1];
                        // up      // left
            }
        }
        return dp[n-1];
    }
};
```

### Generalising the 1D DP approach

Works for grid problems where only adjacent cells feed the current cell:

1. Initialise a 1D array with the base-case value (e.g. 1 for Unique Paths).
2. Iterate row by row, updating each column from the DP relation.
3. Update in place, reusing values already in the array.
4. The last element holds the answer.

## Triangle
[LeetCode](https://leetcode.com/problems/triangle/description/) · video: *DP 11. Triangle | Fixed Starting Point and Variable Ending Point*

> **Problem:** Return the minimum path sum from the top of the triangle to the bottom. From index `i` you move to `i` or `i+1` in the next row.

### Top-down

```cpp
class Solution {
public:
    int minimumTotal(vector<vector<int>>& triangle) {
        int m = triangle.size();
        vector<vector<int>> dp(m, vector<int>(m, -1));
        return recur(0, 0, triangle, dp);
    }

    int recur(int i, int j, vector<vector<int>>& a, vector<vector<int>>& dp){
        if(dp[i][j] != -1)
            return dp[i][j];

        if(i == a.size()-1){
            return a[i][j];
        }

        int diag = a[i][j] + recur(i+1, j+1, a, dp);
        int down = a[i][j] + recur(i+1, j, a, dp);

        return dp[i][j] = min(diag, down);
    }
};
```

### Space optimised bottom-up

```cpp
class Solution {
public:
    int minimumTotal(vector<vector<int>>& triangle) {
        int m = triangle.size();
        vector<int> dp(m, 0);

        for(int j = 0; j < triangle[m-1].size(); j++){
            dp[j] = triangle[m-1][j];
        }

        for(int i = m-2; i >= 0; i--){
            for(int j = 0; j <= i; j++){
                dp[j] = triangle[i][j] + min(dp[j], dp[j+1]);
            }
        }
        return dp[0];
    }
};
```

## Minimum Falling Path Sum
[LeetCode](https://leetcode.com/problems/minimum-falling-path-sum/)

> **Problem:** Return the minimum sum of a falling path through an `n × n` matrix. Each step goes down to the same column or a diagonal neighbour.

### Top-down

```cpp
class Solution {
public:
    int minFallingPathSum(vector<vector<int>>& matrix) {
        int m = matrix.size();
        vector<vector<int>> dp(m, vector<int>(m, -1));

        int minSum = INT_MAX;
        for(int j = 0; j < m; j++){
            minSum = min(minSum, recur(m-1, j, matrix, dp));
        }
        return minSum;
    }

    int recur(int i, int j, vector<vector<int>>& matrix, vector<vector<int>>& dp){
        if(j < 0 || j >= matrix.size()){
            return INT_MAX;
        } // first check index out of bounds

        if(dp[i][j] != -1)
            return dp[i][j];

        if(i == 0){
            return dp[i][j] = matrix[i][j];
        }

        int up = recur(i-1, j, matrix, dp);
        if(up != INT_MAX) up += matrix[i][j];

        int ld = recur(i-1, j-1, matrix, dp);
        if(ld != INT_MAX) ld += matrix[i][j];

        int rd = recur(i-1, j+1, matrix, dp);
        if(rd != INT_MAX) rd += matrix[i][j];

        return dp[i][j] = min({up, ld, rd});
    }
};
```

### Bottom-up, space optimised

```cpp
class Solution {
public:
    int minFallingPathSum(vector<vector<int>>& matrix) {
        int m = matrix.size();
        vector<int> prev(m), cur(m);

        for (int j = 0; j < m; j++) {
            prev[j] = matrix[0][j];
        }

        for (int i = 1; i < m; i++) {
            for (int j = 0; j < m; j++) {
                int up = prev[j] + matrix[i][j];

                int ld = matrix[i][j];
                if (j-1 >= 0) ld += prev[j - 1];
                else ld = INT_MAX;

                int rd = matrix[i][j];
                if(j + 1 < m) rd += prev[j + 1];
                else rd = INT_MAX;

                cur[j] = min({up, ld, rd});
            }
            prev = cur;
        }
        // minSum for the last row
        int minSum = INT_MAX;
        for (int j = 0; j < m; j++) {
            minSum = min(minSum, prev[j]);
        }
        return minSum;
    }
};
```

## Cherry Pickup II
[LeetCode](https://leetcode.com/problems/cherry-pickup-ii/) · a very interesting 3-D grid DP problem · video: *DP 13. Cherry Pickup II | 3D DP Made Easy*

> **Problem:** Two robots start in the top-left and top-right corners and move down one row at a time (down-left, down or down-right). Return the maximum cherries collected. A cell shared by both counts once.

### Top-down (recursion + memoization)

```cpp
class Solution {
public:
    int cherryPickup(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();
        vector<vector<vector<int>>> dp(m, vector<vector<int>>(n, vector<int>(n, -1)));
        return f(0, 0, n-1, grid, dp);
    }

    int f(int i, int j1, int j2, vector<vector<int>>& grid, vector<vector<vector<int>>>& dp) {
        // first clear out-of-bounds error
        if (j1 < 0 || j2 < 0 || j1 >= grid[0].size() || j2 >= grid[0].size()) {
            return -1e9;
        }

        if(dp[i][j1][j2] != -1) return dp[i][j1][j2];

        if (i == grid.size() - 1) {
            if (j1 == j2) { // same col
                return dp[i][j1][j2] = grid[i][j1];
            } else
                return (dp[i][j1][j2] = grid[i][j1] + grid[i][j2]);
        }
        int maxi = -1e9;
        for (int dj1 = -1; dj1 <= 1; dj1++) {
            for (int dj2 = -1; dj2 <= 1; dj2++) {
                int value = 0;
                if (j1 == j2) {
                    // same columns, pick only one
                    value = grid[i][j1];
                }
                else value = grid[i][j1] + grid[i][j2];
                value += f(i+1, j1+ dj1, j2 + dj2, grid, dp);
                maxi = max(maxi, value);
            }
        }
        return dp[i][j1][j2] = maxi;
    }
};
```

### Bottom-up (tabulation)

```cpp
class Solution {
public:
    int cherryPickup(vector<vector<int>>& grid) {
        int m = grid.size();
        int n = grid[0].size();

        vector<vector<vector<int>>> dp(m, vector<vector<int>>(n, vector<int>(n, 0)));

        // base case
        for (int j1 = 0; j1 < n; j1++) {
            for (int j2 = 0; j2 < n; j2++) {
                if (j1 == j2)
                    dp[m - 1][j1][j2] = grid[m - 1][j1];
                else
                    dp[m - 1][j1][j2] = grid[m - 1][j1] + grid[m - 1][j2];
            }
        }

        // build the dp table iteratively
        for (int i = m - 2; i >= 0; i--) {
            for (int j1 = 0; j1 < n; j1++) {
                for (int j2 = 0; j2 < n; j2++) {
                    int maxi = -1e9;
                    for (int dj1 = -1; dj1 <= 1; dj1++) {
                        for (int dj2 = -1; dj2 <= 1; dj2++) {
                            int value = 0;
                            if (j1 == j2) {
                                value = grid[i][j1]; // same columns, pick only one
                            } else
                                value = grid[i][j1] + grid[i][j2];
                            if(j1 + dj1 < n && j2 + dj2 < n && j1 + dj1 >= 0 && j2 + dj2 >= 0){
                                value += dp[i+1][j1+ dj1][j2+dj2];
                            }
                            else{
                                value += -1e9;
                            }
                            maxi = max(maxi, value);
                        }
                    }
                    dp[i][j1][j2] = maxi;
                }
            }
        }
        return dp[0][0][n-1];
    }
};
```

## Target Sum
[LeetCode](https://leetcode.com/problems/target-sum/)

> **Problem:** Put `+` or `-` before each number. Count the expressions that evaluate to `target`.

### 1. Memoization

[Walk-through](https://chatgpt.com/share/672cbb01-79c8-800b-8ea0-f0f91897b36b)

```cpp
class Solution {
public:
    int total = 0;
    int findTargetSumWays(vector<int>& nums, int target) {
        for(int num: nums)
            total += num;

        vector<vector<int>> dp(nums.size(),vector<int>(2*total+1 ,-1));
        return f(0, target, 0, nums, dp);
    }

    int f(int idx, int target, int sum, vector<int>& nums, vector<vector<int>>& dp) {
        if (idx == nums.size()) {
            if (sum == target) {
                return 1;
            }
            else {
                return 0;
            }
        } else {
            if (dp[idx][sum+total] != -1)
                return dp[idx][sum+total];

            int add = f(idx + 1, target, sum + nums[idx], nums, dp);
            int sub = f(idx + 1, target, sum - nums[idx], nums, dp);

            return dp[idx][sum + total] = add + sub;
        }
    }
};
```

### 2. Subset-count reduction

```cpp
class Solution {
public:
    int findTargetSumWays(vector<int>& nums, int target) {
        int sum = std::accumulate(nums.begin(), nums.end(), 0);

        if (sum < abs(target))
            return 0;

        sum += target;

        if (sum % 2 != 0)
            return 0;
        sum /= 2;
        return dfs(nums, sum);
    }

    int dfs(vector<int>& nums, int target){
        vector<int> dp(target + 1);
        dp[0] = 1;
        for (int x : nums){
            for (int i = target; i >= x; i--){
                dp[i] += dp[i - x];
            }
        }
        return dp[target];
    }
};
```

## Subset Sum Equal To K
[Naukri Code 360](https://www.naukri.com/code360/problems/subset-sum-equal-to-k_1550954)

> **Problem:** Return whether some subset of the array sums to `k`.

### 1. Memoization

```cpp
#include <bits/stdc++.h>

bool f(int idx, int target, vector<int> &arr, vector<vector<int>>& dp){
    if(target == 0)
        return dp[idx][target] = 1;

    if(dp[idx][target] != -1){
        return dp[idx][target];
    }

    if(idx == 0){
        return dp[0][target] = (int)(target == arr[idx]);
    }

    bool take = false;
    if(target >= arr[idx]){
        take = f(idx-1, target -arr[idx], arr, dp);
    }
    bool non_take = f(idx-1, target, arr, dp);

    return dp[idx][target] = (int)(take || non_take);
}

bool subsetSumToK(int n, int k, vector<int> &arr) {
    vector<vector<int>> dp(n, vector<int>(k+1, -1));
    return f(arr.size() -1, k, arr, dp);
}
```

### 2. Tabulation

```cpp
#include <bits/stdc++.h>

bool subsetSumToK(int n, int k, vector<int> &arr) {
    vector<vector<bool>> dp(n, vector<bool>(k+1, false));

    for(int i = 0; i < n; i++)
        dp[i][0] = true;

    dp[0][arr[0]] = true;

    for(int i = 1; i < n; i++){
        for(int target = 1; target <= k; target++){
            bool take = false;
            if(target >= arr[i]){
                take = dp[i-1][target -arr[i]];
            }
            bool non_take = dp[i-1][target];
            dp[i][target] = (take || non_take);
        }
    }
    return dp[n-1][k];
}
```

## Partition Equal Subset Sum
[LeetCode](https://leetcode.com/problems/partition-equal-subset-sum/)

> **Problem:** Return whether the array can be split into two subsets with equal sums.

Tabulation + space optimisation (written by self).

```cpp
class Solution {
public:
    bool canPartition(vector<int>& nums) {
        int sum = accumulate(nums.begin(), nums.end(), 0);
        vector<bool> prev(sum+1, false);
        vector<bool> cur(sum+1, false);

        if (sum % 2 != 0)
            return false;

        sum /= 2;

        for(int i = 0; i < nums.size(); i++)
            prev[0] = true;

        prev[nums[0]] = true;

        for (int i = 1; i < nums.size(); i++) {
            for (int target = 1; target <= sum; target++) {
                bool take = false;
                if (target >= nums[i])
                    take = prev[target - nums[i]];
                bool non_take = prev[target];
                cur[target] = take || non_take;
            }
            prev = cur;
        }
        return cur[sum];
    }
};
```

**Space:** O(sum) for each of `prev` and `cur`. **Time:** O(n × sum), where sum is half the total.

## Array Partition with Minimum Difference
[Naukri Code 360](https://www.naukri.com/code360/problems/partition-a-set-into-two-subsets-such-that-the-difference-of-subset-sums-is-minimum_842494)

> **Problem:** Split the array into two subsets so the absolute difference of their sums is minimised. Return that difference.

```cpp
int minSubsetSumDifference(vector<int>& arr, int n)
{
    int sum = accumulate(arr.begin(), arr.end(), 0);
    int k = sum;

    vector<vector<bool>> dp(n, vector<bool>(k+1, false));
    for(int i =0; i < n; i++){
        dp[i][0] = true;
    }
    dp[0][arr[0]] = true;

    for(int i =1; i < n; i++){
        for(int target = 1; target <= k; target++){
            bool take = false;
            if(target >= arr[i]){
                take = dp[i-1][target - arr[i]];
            }
            bool non_take = dp[i-1][target];
            dp[i][target] = take || non_take;
        }
    }

    int mini = INT_MAX;
    for(int s1 = 0; s1 <= sum/2; s1++){
        if(dp[n-1][s1] == true){
            mini = min(mini, abs(sum - 2*s1));
        }
    }
    return mini;
}
```

## Coin Change II
[LeetCode](https://leetcode.com/problems/coin-change-ii/)

> **Problem:** Given coin denominations (unlimited supply), return the number of combinations that make up `amount`.

### Top-down

```cpp
class Solution {
public:
    int change(int amount, vector<int>& coins) {
        int n = coins.size();
        vector<vector<int>> dp(n, vector<int>(amount+1, -1));
        return f(coins.size() - 1, amount, coins, dp);
    }

    int f(int i, int target, vector<int>& coins, vector<vector<int>>& dp){
        if(i == 0){
            return (dp[0][target] = (target % coins[0] == 0));
        }
        if(dp[i][target] != -1)
            return dp[i][target];

        int take = 0;
        if(target >= coins[i])
            take = f(i, target - coins[i], coins, dp);

        int non_take = f(i-1, target, coins, dp);

        return dp[i][target] = take + non_take;
    }
};
```

### Bottom-up

```cpp
class Solution {
public:
    int change(int amount, vector<int>& coins) {
        int n = coins.size();
        const int MOD = 1e18;

        vector<vector<long long>> dp(n, vector<long long>(amount + 1, 0));
        for(int i = 0; i < n; i++){
            dp[i][0] = 1;
        }
        for (int target = 1; target <= amount; target++) {
            if (target % coins[0] == 0) {
                dp[0][target] = 1;
            }
        }

        for (int i = 1; i < n; i++) {
            for (int target = 1; target <= amount; target++) {
                long long take = 0;
                if (target >= coins[i])
                    take = dp[i][target-coins[i]];
                long long non_take = dp[i-1][target];
                dp[i][target] = ((long long)take + (long long)non_take)%MOD;
            }
        }
        return dp[n-1][amount];
    }
};
```

### Space optimised 1D DP

```cpp
class Solution {
public:
    int change(int amount, vector<int>& coins) {
        const int MOD = 1e18;
        int n = coins.size();

        vector<long long> dp(amount + 1, 0);
        dp[0] = 1; // Base case

        for(auto &coin : coins){
            for(int j = coin; j <= amount; j++){
                dp[j] = (dp[j] + dp[j - coin]) % MOD;
            }
        }
        return dp[amount];
    }
};
```

## Maximum Product Subarray
[LeetCode](https://leetcode.com/problems/maximum-product-subarray)

> **Problem:** Return the largest product of any contiguous subarray.

```cpp
class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int maxProd = nums[0];
        int minProd = nums[0];
        int result = nums[0];

        for (int i = 1; i < nums.size(); i++) {
            if (nums[i] < 0) {
                swap(maxProd, minProd);
            }
            maxProd = max(nums[i], maxProd * nums[i]);
            minProd = min(nums[i], minProd * nums[i]);
            result = max(result, maxProd);
        }
        return result;
    }
};
```

## Unbounded Knapsack
[Naukri Code 360](https://www.naukri.com/code360/problems/unbounded-knapsack_1215029)

> **Problem:** Each item has a weight and a value and can be taken any number of times. Return the maximum value within capacity `W`.

### Memoization

```cpp
#include <bits/stdc++.h>

int f(int i, int wt ,vector<int> &weight, vector<int> &profit, vector<vector<int>>& dp){
    if(i == 0){
        int num = wt/weight[0];
        return dp[0][wt] = profit[0]*num;
    }
    if(dp[i][wt] != -1)
        return dp[i][wt];

    int non_take = f(i-1, wt, weight, profit, dp);
    int take = INT_MIN;
    if(wt >= weight[i]){
        take = profit[i] + f(i, wt - weight[i], weight, profit, dp);
    }
    return dp[i][wt] = max(take, non_take);
}

int unboundedKnapsack(int n, int w, vector<int> &profit, vector<int> &weight){
    vector<vector<int>> dp(n, vector<int>(w+1, -1));
    return f(n - 1, w, weight, profit, dp);
}
```

### Tabulation

```cpp
#include <bits/stdc++.h>

int unboundedKnapsack(int n, int w, vector<int> &profit, vector<int> &weight){
    vector<vector<int>> dp(n, vector<int>(w+1, 0));

    for(int wt = 0; wt <= w; wt++){
        dp[0][wt] = profit[0]*(wt/weight[0]);
    }

    for(int i = 1; i < n; i++){
        for(int wt = 0; wt <= w; wt++){
            int non_take = dp[i-1][wt];
            int take = 0;
            if(wt >= weight[i]){
                take = profit[i] + dp[i][wt - weight[i]];
            }
            dp[i][wt] = max(take, non_take);
        }
    }
    return dp[n-1][w];
}
```

## Minimum Cost For Tickets
[LeetCode](https://leetcode.com/problems/minimum-cost-for-tickets/editorial/)

> **Problem:** 1-day, 7-day and 30-day passes have given costs. Return the minimum cost to travel on every listed day.

### Bottom-up

```cpp
class Solution {
public:
    int mincostTickets(vector<int>& days, vector<int>& costs) {
        int n = days.size();
        int lastDay = days[n - 1];

        vector<int> dp(lastDay + 1, 0);

        int i = 0;
        for (int day = 1; day <= lastDay; day++) {
            if (day < days[i])
                dp[day] = dp[day - 1]; // no travel today: same cost as the previous day
            else {
                i++;
                int oneCost = costs[0] + dp[day - 1];
                int sevenCost = costs[1] + ((day >= 7)? dp[day - 7]: 0);
                int thirtyCost = costs[2] + ((day >= 30)? dp[day - 30]: 0);
                dp[day] = min({oneCost, sevenCost, thirtyCost});
            }
        }
        return dp[lastDay];
    }
};
```

### Top-down

```cpp
class Solution {
public:
    int mincostTickets(vector<int>& days, vector<int>& costs) {
        unordered_set<int> st(days.begin(), days.end());
        vector<int> dp(days[days.size() - 1] + 1, -1);
        return f(1, days, st, costs, dp);
    }

    int f(int day, vector<int>& days, unordered_set<int>& st, vector<int>& costs, vector<int>& dp){
        if(day > days[days.size() -1 ])
            return 0;

        if(st.find(day) == st.end())
            return f(day+1, days, st, costs, dp);

        if(dp[day] != -1)
            return dp[day];

        int cost_1 = costs[0] + f(day + 1, days, st, costs, dp);
        int cost_7 = costs[1] + f(day + 7, days, st, costs, dp);
        int cost_30 = costs[2] + f(day + 30, days, st, costs, dp);

        return dp[day] = min({cost_1, cost_7, cost_30});
    }
};
```

## Rod Cutting Problem
[Naukri Code 360](https://www.naukri.com/code360/problems/rod-cutting-problem_800284)

> **Problem:** Given the price of each piece length, cut a rod of length `n` to maximise the total price.

### Memoization

```cpp
int f(int i, int N, vector<int>& price, vector<vector<int>>& dp){
    if(i == 0){
        return N*price[i];
    }
    if(dp[i][N] != -1)
        return dp[i][N];

    int non_take = f(i-1, N, price, dp);
    int take = INT_MIN;
    if(N >= i+1){
        take = price[i] + f(i, N-i-1, price, dp);
    }
    return dp[i][N] = max(take, non_take);
}

int cutRod(vector<int> &price, int n)
{
    int size = price.size();
    vector<vector<int>> dp(size, vector<int>(n+1, -1));
    return f(n-1, n, price, dp);
}
```

### Tabulation

```cpp
int cutRod(vector<int> &price, int n)
{
    vector<vector<int>> dp(n, vector<int>(n+1, 0));

    for(int length = 0; length <= n; length++){
        dp[0][length] = length*price[0];
    }

    for(int i = 1; i < n; i++){
        for(int len = 0; len <= n; len++){
            int non_take = dp[i-1][len];
            int take = INT_MIN;
            if(len >= i+1){
                take = price[i] + dp[i][len-i-1];
            }
            dp[i][len] = max(take, non_take);
        }
    }
    return dp[n-1][n];
}
```

### 1-D space optimised

```cpp
int cutRod(vector<int> &price, int n)
{
    vector<int> dp(n+1, 0);

    for(int length = 0; length <= n; length++){
        dp[length] = length*price[0];
    }

    for(int i = 1; i < n; i++){
        for(int len = 0; len <= n; len++){
            int non_take = dp[len];
            int take = INT_MIN;
            if(len >= i+1){
                take = price[i] + dp[len-i-1];
            }
            dp[len] = max(take, non_take);
        }
    }
    return dp[n];
}
```

## Longest Common Subsequence
[LeetCode](https://leetcode.com/problems/longest-common-subsequence/description/)

> **Problem:** Return the length of the longest common subsequence of two strings.

### Top-down

Call as `f(n, m, text1, text2, dp)`.

```cpp
int f(int i, int j, string& text1, string& text2, vector<vector<int>>& dp) {
    // base case
    if (i == 0 || j == 0)
        return 0; // length is 0 if there's no string left

    if (dp[i][j] != -1)
        return dp[i][j];

    if (text1[i - 1] == text2[j - 1]) {
        return dp[i][j] = 1 + f(i - 1, j - 1, text1, text2, dp);
    }

    return dp[i][j] = max(f(i - 1, j, text1, text2, dp),
                          f(i, j - 1, text1, text2, dp));
}
```

### Bottom-up tabulation

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int n = text1.length(), m = text2.length();
        vector<vector<int>> dp(n + 1, vector<int>(m + 1, -1));

        for(int i = 0; i <= n; i++) dp[i][0] = 0;
        for(int j = 0; j <= m; j++) dp[0][j] = 0;

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (text1[i - 1] == text2[j - 1]) {
                    dp[i][j] = 1 + dp[i-1][j-1];
                }
                else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
            }
        }
        return dp[n][m];
    }
};
```

### Space optimised — two 1-D arrays

```cpp
class Solution {
public:
    int longestCommonSubsequence(string text1, string text2) {
        int n = text1.length(), m = text2.length();
        vector<int> prev(m+1, 0);
        vector<int> cur(m+1, 0);

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (text1[i - 1] == text2[j - 1]) {
                    cur[j] = 1 + prev[j-1];
                }
                else cur[j] = max(prev[j], cur[j-1]);
            }
            prev = cur;
        }
        return prev[m];
    }
};
```

## Longest Common Substring
[Naukri Code 360](https://www.naukri.com/code360/problems/longest-common-substring_1235207)

> **Problem:** Return the length of the longest common contiguous substring of two strings.

```cpp
int lcs(string &str1, string &str2){
    int n = str1.length(), m = str2.length();
    vector<vector<int>> dp(n+1, vector<int>(m+1, 0));

    int ans = 0;
    for(int i = 1; i <= n; i++){
        for(int j = 1; j <= m; j++){
            if(str1[i-1] == str2[j-1]){
                dp[i][j] = 1+ dp[i-1][j-1];
                ans = max(ans, dp[i][j]);
            }
            else dp[i][j] = 0;
        }
    }
    return ans;
}
```

## Longest Palindromic Subsequence
[LeetCode](https://leetcode.com/problems/longest-palindromic-subsequence/)

> **Problem:** Return the length of the longest subsequence of `s` that is a palindrome.

LCS of the string and its reverse.

```cpp
class Solution {
public:
    int longestPalindromeSubseq(string s) {
        string s1 = s;
        reverse(s.begin(), s.end());
        string s2 = s;

        int n = s.length();
        vector<vector<int>> dp(n+1, vector<int>(n+1, 0));

        for(int i = 1; i <=n; i++){
            for(int j = 1; j <= n; j++){
                if(s1[i-1] == s2[j-1]){
                    dp[i][j] = 1 + dp[i-1][j-1];
                }
                else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
            }
        }
        return dp[n][n];
    }
};
```

## Shortest Common Supersequence
[LeetCode](https://leetcode.com/problems/shortest-common-supersequence) · DP on Strings (LeetCode Hard)

> **Problem:** Return the shortest string that has both `str1` and `str2` as subsequences.

Build the LCS table, then walk back from `(n, m)`: take shared characters once and the non-LCS characters from whichever side the table came from.

```cpp
class Solution {
public:
    string shortestCommonSupersequence(string s1, string s2) {
        int n = s1.length(), m = s2.length();
        vector<vector<int>> dp(n+1, vector<int>(m+1, 0));

        for(int i =1; i <= n; i++){
            for(int j = 1; j <= m; j++){
                if(s1[i-1] == s2[j-1]){
                    dp[i][j] = 1 + dp[i-1][j-1];
                }
                else dp[i][j] = max(dp[i-1][j], dp[i][j-1]);
            }
        }

        int i = n, j = m;
        string ans = "";
        while(i > 0 && j > 0){
            if(s1[i-1] == s2[j-1]){
                ans += s1[i-1];
                i--; j--;
            }
            else if(dp[i-1][j] > dp[i][j-1]){
                ans += s1[i-1];
                i--;
            }
            else {
                ans += s2[j-1];
                j--;
            }
        }
        while(i > 0){ ans += s1[i-1]; i--; }
        while(j > 0){ ans += s2[j-1]; j--; }

        reverse(ans.begin(), ans.end());
        return ans;
    }
};
```

## Distinct Subsequences
[LeetCode](https://leetcode.com/problems/distinct-subsequences/) · video: *DP 32. Distinct Subsequences | 1D Array Optimisation*

> **Problem:** Count the distinct subsequences of `s` that equal `t`.

### Tabulation

```cpp
class Solution {
public:
    int numDistinct(string s, string t) {
        int n = s.length();
        int m = t.length();
        const long long mod = 1e18;
        vector<vector<long long>> dp(n + 1, vector<long long>(m + 1, 0));

        // base case
        for (int i = 0; i < n; i++) {
            dp[i][0] = 1;
        }

        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= m; j++) {
                if (s[i-1] == t[j-1]) {
                    long long value = dp[i-1][j-1] + dp[i-1][j];
                    dp[i][j] = value % mod;
                }
                else
                    dp[i][j] = dp[i-1][j];
            }
        }
        return dp[n][m] % mod;
    }
};
```

### 1-D array space optimisation

```cpp
class Solution {
public:
    int numDistinct(string s, string t) {
        int n = s.length();
        int m = t.length();
        const long long mod = 1e18;
        vector<long long> dp(m+1, 0);

        dp[0] = 1; // base case

        for (int i = 1; i <= n; i++) {
            for (int j = m; j >= 1; j--) {
                if (s[i-1] == t[j-1]) {
                    long long value = dp[j] + dp[j-1];
                    dp[j] = value % mod;
                }
            }
        }
        return dp[m] % mod;
    }
};
```

### Memoization

```cpp
class Solution {
public:
    int numDistinct(string s, string t) {
        int n = s.length();
        int m = t.length();
        vector<vector<int>> dp(n, vector<int>(m, -1));
        return f(n-1, m-1, s, t, dp);
    }

    int f(int i, int j, string s, string t, vector<vector<int>>& dp) {
        if (j < 0) return 1;
        if (i < 0) return 0;

        if(dp[i][j] != -1){
            return dp[i][j];
        }
        if (s[i] == t[j]) {
            return dp[i][j] = f(i - 1, j - 1, s, t, dp) + f(i - 1, j, s, t, dp);
        }
        else
            return dp[i][j] = f(i - 1, j, s, t, dp);
    }
};
```

## Painting the Walls
[LeetCode](https://leetcode.com/problems/painting-the-walls/)

> **Problem:** A paid painter paints wall `i` for `cost[i]` in `time[i]` units. A free painter paints any wall in 1 unit, but only while the paid painter is busy. Return the minimum cost to paint all walls.

`dp[i][remain]` = min cost to cover `remain` walls using painters from index `i` on. Paying for wall `i` paints it and frees `time[i]` walls for the free painter.

### Tabulation

```cpp
class Solution {
public:
    int paintWalls(vector<int>& cost, vector<int>& time) {
        int n = cost.size();
        vector<vector<int>> dp(n+1, vector<int>(n + 1, 0));

        // base case
        for(int i = 1; i <= n; i++){
            dp[n][i] = 1e9;
        }

        for (int i = n - 1; i >= 0; i--) {
            for (int remain = 1; remain <= n; remain++) {
                int take = cost[i] + dp[i+1][max(0,remain-1-time[i])];
                int non_take = dp[i+1][remain];
                dp[i][remain] = min(take, non_take);
            }
        }
        return dp[0][n];
    }
};
```

### Space optimised

```cpp
class Solution {
public:
    int paintWalls(vector<int>& cost, vector<int>& time) {
        int n = cost.size();

        vector<int> prev(n+1, 0);
        vector<int> cur(n+1, 0);

        // base case
        for(int i = 1; i <= n; i++){
            prev[i] = 1e9;
        }

        for (int i = n - 1; i >= 0; i--) {
            for (int remain = 1; remain <= n; remain++) {
                int take = cost[i] + prev[max(0,remain-1-time[i])];
                int non_take = prev[remain];
                cur[remain] = min(take, non_take);
            }
            prev = cur;
        }
        return prev[n];
    }
};
```

## Edit Distance
[LeetCode](https://leetcode.com/problems/edit-distance/)

> **Problem:** Return the minimum number of insert, delete and replace operations to turn `word1` into `word2`.

### Bottom-up

```cpp
int minDistance(string s1, string s2) {
    int n = s1.length(), m = s2.length();
    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));

    // base case
    for (int j = 0; j <= m; j++) dp[0][j] = j;
    for (int i = 0; i <= n; i++) dp[i][0] = i;

    for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= m; j++) {
            int match = INT_MAX;
            if (s1[i-1] == s2[j-1]) {
                match = dp[i-1][j-1];
            }
            int insert = 1 + dp[i][j-1];
            int del_op = 1 + dp[i-1][j];
            int replace = 1 + dp[i-1][j-1];

            dp[i][j] = min({match, insert, del_op, replace});
        }
    }
    return dp[n][m];
}
```

### Top-down

```cpp
int f(int i, int j, string s1, string s2, vector<vector<int>>& dp) {
    if (i < 0) return j + 1;
    if (j < 0) return i + 1;

    if (dp[i][j] != -1)
        return dp[i][j];

    int match = INT_MAX;
    if (s1[i] == s2[j]) {
        match = f(i - 1, j - 1, s1, s2, dp);
    }
    int insert = 1 + f(i, j - 1, s1, s2, dp);
    int del_op = 1 + f(i - 1, j, s1, s2, dp);
    int replace = 1 + f(i - 1, j - 1, s1, s2, dp);

    return dp[i][j] = min({match, insert, del_op, replace});
}
```

### 1-D space optimisation

```cpp
int minDistance(string s1, string s2) {
    int m = s2.length();
    int n = s1.length();
    vector<int> prev(m+1, 0), cur(m+1, 0);

    // base case
    for (int j = 0; j <= m; j++) {
        prev[j] = j;
    }

    for (int i = 1; i <= n; i++) {
        cur[0] = i;
        for (int j = 1; j <= m; j++) {
            if (s1[i-1] == s2[j-1]) {
                cur[j] = prev[j-1];
            }
            else{
                cur[j] = 1+min({cur[j-1], prev[j], prev[j-1]});
            }
        }
        prev = cur;
    }
    return prev[m];
}
```

## Wildcard Matching
[LeetCode](https://leetcode.com/problems/wildcard-matching/) · video: *DP 34. Wildcard Matching | Recursive to 1D Array Optimisation*

> **Problem:** Implement wildcard matching over the whole string, where `?` matches one character and `*` matches any sequence (including empty).

### Tabulation

```cpp
class Solution {
public:
    bool isMatch(string s, string p) {
        int n = p.length(), m = s.length();
        vector<vector<bool>> dp(n+1, vector<bool>(m+1, false));

        for(int i = 1; i <= n; i++){
            bool flag = true;
            for(int ii = 1; ii <= i; ii++){
                if(p[ii-1] != '*'){
                    flag = false;
                    break;
                }
            }
            dp[i][0] = flag;
        }
        for(int j = 1; j <= m; j++){
            dp[0][j] = false;
        }
        dp[0][0] = true;

        for(int i = 1; i <= n; i++){
            for(int j = 1; j <= m; j++){
                if(p[i-1] == s[j-1] || p[i-1] == '?'){
                    dp[i][j] = dp[i-1][j-1];
                }
                else if(p[i-1] == '*'){
                    dp[i][j] = dp[i-1][j] || dp[i][j-1];
                }
                else dp[i][j] = false;
            }
        }
        return dp[n][m];
    }
};
```

### 1-D space optimisation

```cpp
class Solution {
public:
    bool isMatch(string s, string p) {
        int n = p.length(), m = s.length();
        vector<bool> prev(m + 1, false), cur(m + 1, false);

        prev[0] = true;

        for (int i = 1; i <= n; i++) {
            bool flag = true;
            for (int ii = 1; ii <= i; ii++) {
                if (p[ii - 1] != '*') {
                    flag = false;
                    break;
                }
            }
            cur[0] = flag;

            for (int j = 1; j <= m; j++) {
                if (p[i - 1] == s[j - 1] || p[i - 1] == '?') {
                    cur[j] = prev[j - 1];
                }
                else if (p[i - 1] == '*') {
                    cur[j] = prev[j] || cur[j - 1];
                }
                else
                    cur[j] = false;
            }
            prev = cur;
        }
        return prev[m];
    }
};
```

## Best Time to Buy and Sell Stock II
[LeetCode](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/) · Buy & Sell Stock problems [DP]

> **Problem:** You may hold at most one share at a time but can trade as often as you like. Return the maximum profit.

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        vector<int> ahead(2, 0), cur(2, 0);

        ahead[0] = ahead[1] = 0;

        for (int i = n - 1; i >= 0; i--) {
            for (int buy = 0; buy <= 1; buy++) {
                int profit = 0;
                if (buy)
                    profit = max(-prices[i] + ahead[0], ahead[1]);
                else
                    profit = max(prices[i] + ahead[1], ahead[0]);
                cur[buy] = profit;
            }
            ahead = cur;
        }
        return ahead[1];
    }

    // memoization
    int f(int i, int buy, vector<int>& prices, vector<vector<int>>& dp) {
        if (i == prices.size())
            return 0;

        if (dp[i][buy] != -1)
            return dp[i][buy];

        int profit = 0;
        if (buy)
            profit = max(-prices[i] + f(i + 1, 0, prices, dp), f(i + 1, 1, prices, dp));
        else
            profit = max(prices[i] + f(i + 1, 1, prices, dp), f(i + 1, 0, prices, dp));

        return dp[i][buy] = profit;
    }
};
```

## Best Time to Buy and Sell Stock III
[LeetCode](https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/)

> **Problem:** You may complete at most two transactions (no overlapping holdings). Return the maximum profit.

State `(i, buy, cap)` where `cap` = transactions left; cap drops by one on each sale.

```cpp
class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int n = prices.size();
        vector<vector<int>> prev(2, vector<int>(3, 0));
        vector<vector<int>> cur(2, vector<int>(3, 0));

        for (int i = n - 1; i >= 0; i--) {
            for (int buy = 0; buy <= 1; buy++) {
                for (int cap = 1; cap <= 2; cap++) {
                    int profit = 0;
                    if (buy) {
                        profit = max(-prices[i] + prev[0][cap], prev[1][cap]);
                    }
                    // cap reduces after selling
                    else
                        profit = max(prices[i] + prev[1][cap-1], prev[0][cap]);

                    cur[buy][cap] = profit;
                }
                prev = cur;
            }
        }
        return prev[1][2];
    }

    int f(int i, int buy, int cap, vector<int>& prices, vector<vector<vector<int>>>& dp) {
        if (i == prices.size())
            return 0;
        if (cap == 0) // no transactions left
            return 0;
        if (dp[i][buy][cap] != -1)
            return dp[i][buy][cap];

        int profit = 0;
        if (buy) {
            profit = max(-prices[i] + f(i + 1, 0, cap, prices, dp), f(i + 1, 1, cap, prices, dp));
        }
        // cap reduces after selling
        else
            profit = max(prices[i] + f(i + 1, 1, cap - 1, prices, dp), f(i + 1, 0, cap, prices, dp));

        return dp[i][buy][cap] = profit;
    }
};
```

## Longest Increasing Subsequence
[LeetCode](https://leetcode.com/problems/longest-increasing-subsequence/)

> **Problem:** Return the length of the longest strictly increasing subsequence.

### 1. Top-down

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> dp(n, vector<int>(n+1, -1));
        return f(0, -1, nums, dp);
    }

    int f(int i, int prev_i, vector<int>& nums, vector<vector<int>>& dp){
        if(i == nums.size()){
            return 0;
        }
        if(dp[i][prev_i + 1] != -1)
            return dp[i][prev_i+1];

        int len = f(i+1, prev_i, nums, dp);

        // take
        if(prev_i == -1 || (nums[i] > nums[prev_i])){
            len = max(len, 1 + f(i+1, i, nums, dp));
        }
        return dp[i][prev_i + 1] = len;
    }
};
```

### 2. Tabulation

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();
        vector<vector<int>> dp(n+1, vector<int>(n + 1, 0));
        // base cases: for all prev_i, i=n has 0 value
        // run the loops backwards wrt the top-down approach
        for (int i = n-1; i >= 0; i--) {
            for (int prev_i = i-1; prev_i >= -1; prev_i--) {
                int len = dp[i+1][prev_i+1];
                // take
                if (prev_i == -1 || (nums[i] > nums[prev_i])) {
                    len = max(len, 1 + dp[i+1][i+1]);
                }
                dp[i][prev_i + 1] = len;
            }
        }
        return dp[0][0];
    }
};
```

### 3. 1-D array DP

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        int n = nums.size();
        vector<int> dp(n, 1);

        for(int i = 1; i < n; i++){
            for(int j = 0; j < i; j++){
                if(nums[j] < nums[i])
                    dp[i] = max(dp[i], 1+dp[j]);
            }
        }

        int ans = 0;
        for(int num: dp){
            ans = max(ans, num);
        }
        return ans;
    }
};
```

### 4. Binary search — O(n log n)

```cpp
class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> lis;
        int n = nums.size();

        lis.push_back(nums[0]);

        for(int i = 1; i < n; i++){
            if(nums[i] > lis.back()){
                lis.push_back(nums[i]);
            }
            else{
                auto it = lower_bound(lis.begin(), lis.end(), nums[i]);
                *it = nums[i];
            }
        }
        return lis.size();
    }
};
```

## Largest Divisible Subset
[LeetCode](https://leetcode.com/problems/largest-divisible-subset/) · a variation of LIS

> **Problem:** Return the largest subset in which every pair satisfies `a % b == 0` or `b % a == 0`.

```cpp
class Solution {
public:
    vector<int> largestDivisibleSubset(vector<int>& nums) {
        int n = nums.size();
        sort(nums.begin(), nums.end());

        vector<int> dp(n, 1);
        vector<int> hash(n);
        int maxi = 1;
        int lastIndex = 0;

        for (int i = 0; i < n; i++) {
            hash[i] = i;
            for (int j = 0; j < i; j++) {
                if (nums[i] % nums[j] == 0 && dp[i] < dp[j] + 1) {
                    dp[i] = dp[j] + 1;
                    hash[i] = j;
                }
            }
            if(dp[i] > maxi){
                maxi = dp[i];
                lastIndex = i;
            }
        }

        vector<int> ans;
        ans.push_back(nums[lastIndex]);
        while(hash[lastIndex] != lastIndex){
            lastIndex = hash[lastIndex];
            ans.push_back(nums[lastIndex]);
        }

        reverse(ans.begin(), ans.end());
        return ans;
    }
};
```

## Longest String Chain
[LeetCode](https://leetcode.com/problems/longest-string-chain/)

> **Problem:** Word A is a predecessor of B if inserting exactly one letter into A gives B. Return the length of the longest word chain.

Sort by length, then LIS where "increasing" means "is a predecessor" (one extra character).

```cpp
class Solution {
public:
    static bool comp(string &s1, string &s2){
        return s1.size() < s2.size();
    }
    int longestStrChain(vector<string>& words) {
        sort(words.begin(), words.end(), comp);

        int n = words.size();
        vector<int> dp(n, 1); // a single word is a chain of length 1

        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (stringCompare(words[i], words[j]) && dp[j] + 1 > dp[i])
                    dp[i] = dp[j] + 1;
            }
        }

        int ans = 0;
        for (int c : dp) {
            ans = max(ans, c);
        }
        return ans;
    }

    bool stringCompare(string a, string b) {
        int i = 0, j = 0;
        if (a.size() != b.size() + 1) {
            return false;
        }
        while (i < a.length()) {
            if (a[i] == b[j] && j < b.size()) {
                i++;
                j++;
            }
            else
                i++;
        }
        return (j == b.length());
    }
};
```

## Longest Bitonic Subsequence
[Naukri Code 360](https://www.naukri.com/code360/problems/longest-bitonic-sequence_1062688) · similar to *Minimum Number of Removals to Make Mountain Array*

> **Problem:** Return the length of the longest subsequence that strictly increases and then strictly decreases.

Uses binary search to get LIS lengths in O(n log n).

```cpp
vector<int> getLis(vector<int>& v) {
    vector<int> lisLen(v.size(), 1);
    vector<int> lis = {v[0]};

    for (int i = 1; i < v.size(); i++) {
        auto it = lower_bound(lis.begin(), lis.end(), v[i]);
        if (it == lis.end()) {
            lis.push_back(v[i]);
        }
        else {
            *it = v[i];
        }
        lisLen[i] = lis.size();
    }
    return lisLen;
}

int longestBitonicSubsequence(vector<int>& arr, int n)
{
    vector<int> lisLength = getLis(arr);

    reverse(arr.begin(), arr.end());
    vector<int> ldsLength = getLis(arr);
    reverse(ldsLength.begin(), ldsLength.end());

    int maxLen = INT_MIN;
    for(int i = 0; i < n; i++){
        if(lisLength[i] > 1 && ldsLength[i] > 1){
            maxLen = max(maxLen, lisLength[i] + ldsLength[i] - 1);
        }
        else if (lisLength[i] > 1 && ldsLength[i] == 1){
            maxLen = max(maxLen, lisLength[i]);
        }
        else{
            maxLen = max(maxLen, ldsLength[i]);
        }
    }
    return maxLen;
}
```

## Number of Longest Increasing Subsequence
[LeetCode](https://leetcode.com/problems/number-of-longest-increasing-subsequence/)

> **Problem:** Return how many longest strictly increasing subsequences there are.

```cpp
class Solution {
public:
    int findNumberOfLIS(vector<int>& nums) {
        int n = nums.size();

        vector<int> dp(n, 1);
        vector<int> count(n, 1);

        int maxi = 0;

        for(int i = 0; i < n; i++){
            for(int j = 0; j < i; j++){
                if(nums[i] > nums[j] && (dp[i] < dp[j] + 1)){
                    dp[i] = 1 + dp[j];
                    count[i] = count[j];
                }
                else if(nums[i] > nums[j] && (dp[i] == dp[j] + 1)){
                    count[i] += count[j];
                }
            }
            maxi = max(maxi, dp[i]);
        }

        int ans = 0;
        for(int i = 0; i < dp.size(); i++){
            if(dp[i] == maxi){
                ans += count[i];
            }
        }
        return ans;
    }
};
```

## Matrix Chain Multiplication
[Naukri Code 360](https://www.naukri.com/code360/problems/matrix-chain-multiplication_975344) · Partition DP

> **Problem:** Given matrix dimensions `arr`, return the minimum number of scalar multiplications needed to multiply the whole chain.

### Top-down

```cpp
#include <bits/stdc++.h>

int f(int i, int j, vector<int>& arr, vector<vector<int>>& dp){
    if(i == j)
        return 0;

    if(dp[i][j] != -1)
        return dp[i][j];

    int mini = INT_MAX;
    for(int k = i; k < j; k++){
        int steps = arr[i-1]*arr[k]*arr[j] + f(i, k, arr, dp) + f(k+1, j, arr, dp);
        mini = min(mini, steps);
    }
    return dp[i][j] = mini;
}

int matrixMultiplication(vector<int> &arr, int N)
{
    vector<vector<int>> dp(N, vector<int>(N, -1));
    return f(1, N-1, arr, dp);
}
```

### Bottom-up

```cpp
int matrixMultiplication(vector<int> &arr, int N)
{
    vector<vector<int>> dp(N, vector<int>(N, 0));

    for(int i = N-1; i>= 1; i--){
        for(int j = i+1; j < N; j++){
            int mini = INT_MAX;
            for(int k = i; k < j; k++){
                int steps = arr[i-1]*arr[k]*arr[j] + dp[i][k] + dp[k+1][j];
                mini = min(mini, steps);
            }
            dp[i][j] = mini;
        }
    }
    return dp[1][N-1];
}
```

## Minimum Cost to Cut a Stick
[LeetCode](https://leetcode.com/problems/minimum-cost-to-cut-a-stick/)

> **Problem:** Cutting a stick costs its current length. Given the cut positions, choose the order of cuts that minimises the total cost.

### Top-down

```cpp
class Solution {
public:
    int minCost(int n, vector<int>& cuts) {
        cuts.push_back(0);
        cuts.push_back(n);
        sort(cuts.begin(), cuts.end());
        int m = cuts.size();
        vector<vector<int>> dp(m, vector<int>(m, -1));
        return f(0, cuts.size() - 1, cuts, dp);
    }

    int f(int i, int j, vector<int>& cuts, vector<vector<int>>& dp) {
        // base case
        if (i + 1 == j)
            return 0;

        if (dp[i][j] != -1)
            return dp[i][j];

        int mini = INT_MAX;
        for (int k = i + 1; k < j; k++) {
            int cost = cuts[j] - cuts[i] + f(i, k, cuts, dp) + f(k, j, cuts, dp);
            mini = min(mini, cost);
        }
        return dp[i][j] = mini;
    }
};
```

### Bottom-up

```cpp
class Solution {
public:
    int minCost(int n, vector<int>& cuts) {
        cuts.push_back(0);
        cuts.push_back(n);
        sort(cuts.begin(), cuts.end());
        int m = cuts.size();
        vector<vector<int>> dp(m, vector<int>(m, 0));

        for (int length = 2; length < m; length++) {
            for (int i = 0; i + length < m; i++) {
                int j = i+ length;
                dp[i][j] = INT_MAX;
                for (int k = i + 1; k < j; k++) {
                    int cost = cuts[j] - cuts[i] + dp[i][k] + dp[k][j];
                    dp[i][j] = min(dp[i][j], cost);
                }
            }
        }
        return dp[0][m-1];
    }
};
```

- Build from the smallest sub-sticks up to the whole stick: `length = 2` has one cut point inside, `length = 3` has two, and so on to `m - 1`.
- For each `(i, j)`, try every cut `k` inside it: cost `cuts[j] - cuts[i] + dp[i][k] + dp[k][j]`, keeping the minimum.
- The answer is `dp[0][m-1]`.

## Burst Balloons
[LeetCode](https://leetcode.com/problems/burst-balloons/)

> **Problem:** Bursting balloon `i` earns `nums[left] * nums[i] * nums[right]` from its current neighbours. Return the maximum coins from bursting them all.

### Top-down

```cpp
int f(int i, int j, vector<int>& nums, vector<vector<int>>& memo) {
    if (i > j) {
        return 0;
    }
    if (memo[i][j] != -1)
        return memo[i][j];

    int maxi = 0;
    for (int k = i; k <= j; k++) {
        int cost = nums[i - 1] * nums[k] * nums[j + 1] +
                   f(i, k - 1, nums, memo) + f(k + 1, j, nums, memo);
        maxi = max(cost, maxi);
    }
    return memo[i][j] = maxi;
}
```

### Tabulation (with comments)

```cpp
class Solution {
public:
    int maxCoins(vector<int>& nums) {
        // Step 1: Augment the nums array with 1 at both ends
        nums.insert(nums.begin(), 1);
        nums.push_back(1);

        int n = nums.size();

        // Step 2: dp[i][j] = max coins from bursting balloons strictly between i and j
        vector<vector<int>> dp(n, vector<int>(n, 0));

        // Step 3: lengths start at 2 (length 1 has nothing in between)
        for(int length = 2; length < n; length++) {
            // Step 4: slide the window of size 'length'
            for(int left = 0; left + length < n; left++) {
                int right = left + length;
                dp[left][right] = 0;

                // Step 5: try every balloon k as the last one burst in the window
                for(int k = left + 1; k < right; k++) {
                    int coins = nums[left] * nums[k] * nums[right];
                    coins += dp[left][k] + dp[k][right];
                    dp[left][right] = max(dp[left][right], coins);
                }
            }
        }
        // Step 6: the result is stored in dp[0][n - 1]
        return dp[0][n - 1];
    }
};
```

Bursting `k` last in `(left, right)` means everything in `(left, k)` and `(k, right)` is already gone, so the total is `nums[left]·nums[k]·nums[right] + dp[left][k] + dp[k][right]`.

## Boolean Evaluation
[Naukri Code 360](https://www.naukri.com/code360/problems/problem-name-boolean-evaluation_1214650) · watch Striver's DP playlist

> **Problem:** Given an expression of `T`, `F` and the operators `&`, `|`, `^`, count the ways to parenthesise it so it evaluates to true (mod 1e9+7).

```cpp
#include <bits/stdc++.h>

#define ll long long
int mod = 1e9 + 7;

int f(int i, int j, int isTrue, string& exp, vector<vector<vector<ll>>>& dp){
    if(i > j){
        return 0;
    }
    if(i==j){
        if(isTrue) return exp[i] == 'T'; // looking for true
        else return exp[i] == 'F';       // looking for false
    }

    if(dp[i][j][isTrue] != -1) return dp[i][j][isTrue];

    ll ways = 0;

    for(int ind = i+1; ind <= j; ind++){
        ll lT = f(i, ind-1, 1, exp, dp);
        ll lF = f(i, ind-1, 0, exp, dp);
        ll rT = f(ind+1, j, 1, exp, dp);
        ll rF = f(ind+1, j, 0, exp, dp);

        if(exp[ind] == '&'){
            if(isTrue) ways = ((ways + lT*rT)%mod)%mod;
            else ways = (ways + (lF*rF)%mod + (lT*rF)%mod + (rT*lF)%mod)%mod;
        }
        else if(exp[ind] == '|'){
            if(isTrue) ways = (ways + (lT*rF)%mod + (rT*lF)%mod + (lT*rT)%mod)%mod;
            else ways = ((ways + lF*rF)%mod)%mod;
        }
        else {
            // XOR: opposites are true
            if(isTrue) ways = (ways + (lF*rT)%mod + (lT*rF)%mod)%mod;
            else ways = (ways + (lF*rF)%mod + (lT*rT)%mod)%mod;
        }
    }
    return dp[i][j][isTrue] = ways;
}

int evaluateExp(string & exp) {
    int n = exp.size();
    vector<vector<vector<ll>>> dp(n, vector<vector<ll>>(n, vector<ll>(2, -1)));
    return f(0, n-1, 1, exp, dp);
}
```

## Palindrome Partitioning II
[LeetCode](https://leetcode.com/problems/palindrome-partitioning-ii/) · Front partitioning

> **Problem:** Return the minimum number of cuts needed to split `s` into palindromic substrings.

### Top-down (Memory Limit Exceeded)

```cpp
class Solution {
public:
    int minCut(string s) {
        vector<int> dp(s.size(), -1);
        return f(0, s, dp) - 1;
    }

    int f(int i, string& s, vector<int>& dp) {
        int n = s.size();
        if (i == n)
            return 0;
        if(dp[i] != -1)
            return dp[i];

        int minCost = INT_MAX;
        for (int j = i; j < n; j++) {
            if (isPalindrome(i, j, s)) {
                int cost = 1 + f(j + 1, s, dp);
                minCost = min(cost, minCost);
            }
        }
        return dp[i] = minCost;
    }

    bool isPalindrome(int i, int j, string s) {
        while(i < j) {
            if (s[i] != s[j]) {
                return false;
            }
            i++;
            j--;
        }
        return true;
    }
};
```

### Space optimised DP (expand around the centre)

1. `dp[i]` = minimum cuts for `s[0..i]`, initialised to `i` (cut every character).
2. Treat each position as the centre of an odd (`i, i`) and even (`i, i+1`) palindrome and expand outward.
3. When `s[left..right]` is a palindrome: if `left == 0` then `dp[right] = 0`, otherwise `dp[right] = min(dp[right], dp[left-1] + 1)`.
4. The answer is `dp[n-1]`.

**Time:** O(n²). **Space:** O(n).

```cpp
class Solution {
public:
    int minCut(string s) {
        int n = s.size();

        vector<int> dp(n, 0);
        for(int i = 0; i < n; ++i) {
            dp[i] = i; // Maximum cuts possible (cutting each character)
        }

        for(int i = 0; i < n; i++){
            expandAndUpdate(i, i+1, s, dp); // even length has 2 centres
            expandAndUpdate(i, i, s, dp);   // odd length has 1
        }
        return dp[n-1];
    }

private:
    void expandAndUpdate(int left, int right, const string& s, vector<int>& dp) {
        // expand around the centre while s[left..right] is a palindrome
        int n = s.size();
        while (left >= 0 && right < n && s[left] == s[right]) {
            if (left == 0)
                dp[right] = 0;
            else{
                dp[right] = min(dp[right], 1+dp[left-1]);
            }
            left--;
            right++;
        }
    }
};
```

## Partition Array for Maximum Sum
[LeetCode](https://leetcode.com/problems/partition-array-for-maximum-sum/)

> **Problem:** Split the array into contiguous parts of length at most `k`, and replace every element in a part with that part's maximum. Return the largest possible sum.

### Top-down (recursion + memoization)

Time O(n·k) (n states, k partitions tried each). Space O(n) dp plus O(n) recursion stack.

```cpp
class Solution {
public:
    int maxSumAfterPartitioning(vector<int>& arr, int k) {
        int n = arr.size();
        vector<int> dp(n, -1);
        return f(0, arr, k, dp);
    }

    int f(int i, vector<int>& arr, int k, vector<int>& dp){
        int n = arr.size();
        if(i == n)
            return 0;
        if(dp[i] != -1)
            return dp[i];

        int maxSum = INT_MIN;
        int maxi = INT_MIN;
        int len = 0;

        for(int j = i; j < min(n, i+k); j++){
            len++;
            maxi = max(maxi, arr[j]);
            int sum = len*maxi + f(j+1, arr, k, dp);
            maxSum = max(maxSum, sum);
        }
        return dp[i] = maxSum;
    }
};
```

### Bottom-up (tabulation)

```cpp
class Solution {
public:
    int maxSumAfterPartitioning(vector<int>& arr, int k) {
        int n = arr.size();
        vector<int> dp(n + 1, 0);

        // base case i==n then 0; run the loop backwards
        for (int i = n - 1; i >= 0; i--) {
            int maxSum = INT_MIN;
            int maxi = INT_MIN;
            int len = 0;

            for (int j = i; j < min(n, i + k); j++) {
                len++;
                maxi = max(maxi, arr[j]);
                int sum = len * maxi + dp[j+1];
                maxSum = max(maxSum, sum);
            }
            dp[i] = maxSum;
        }
        return dp[0];
    }
};
```

## Maximal Rectangle
[LeetCode](https://leetcode.com/problems/maximal-rectangle/) · prerequisite: *Largest Rectangle in Histogram*

> **Problem:** In a binary matrix, return the area of the largest rectangle containing only 1s.

### Histogram helper (stack based)

- Append a `0` to `heights` so every bar gets popped by the end.
- While the current bar is `<=` the bar at the stack top, pop it: its height is `x`, the previous smaller bar is the new top (`r`, or `-1` if empty), and its width is `i - r - 1`. Update the best area `x · width`.
- Push the current index; the stack keeps heights increasing.

### Solution: build a histogram per row

```cpp
class Solution {
public:
    int maximalRectangle(vector<vector<char>>& matrix) {
        int n = matrix.size();
        int m = matrix[0].size();
        int ans = 0;

        vector<int> heights(m, 0);

        for(int i = 0; i < n; i++){
            for(int j = 0; j < m; j++){
                if(matrix[i][j] == '1'){
                    heights[j]++;
                }
                else heights[j] = 0;
            }
            ans = max(ans, largestRectangleArea(heights));
        }
        return ans;
    }

    int largestRectangleArea(vector<int>& heights) {
        stack<int> st;
        heights.push_back(0);

        int ans = 0;
        int n = heights.size();

        for(int i = 0; i < n; i++){
            while(!st.empty() && (heights[i] <= heights[st.top()])){
                int x = heights[st.top()];
                st.pop();

                int r;
                if(st.empty())
                    r = -1;
                else r = st.top();

                int width = i-r-1;
                ans = max(ans, x*width);
            }
            st.push(i);
        }
        return ans;
    }
};
```

## Count Square Submatrices with All Ones
[LeetCode](https://leetcode.com/problems/count-square-submatrices-with-all-ones/)

> **Problem:** Count the square submatrices that contain only 1s.

```cpp
class Solution {
public:
    int countSquares(vector<vector<int>>& matrix) {
        int row = matrix.size(), col = matrix[0].size();
        vector<vector<int>> dp(row + 1, vector<int>(col + 1, 0));
        int ans = 0;

        for(int i = 0; i < row; i++){
            for(int j = 0; j < col; j++){
                if(matrix[i][j] == 1){
                    ans += dp[i+1][j+1] = min({dp[i+1][j], dp[i][j+1], dp[i][j]}) +1;
                }
            }
        }
        return ans;
    }
};
```

## Count Submatrices With All Ones
[LeetCode](https://leetcode.com/problems/count-submatrices-with-all-ones/)

> **Problem:** Count all rectangular submatrices that contain only 1s.

### Simple DP — O(n·m²)

```cpp
int numSubmat(vector<vector<int>>& matrix) {
    int n = matrix.size();
    int m = matrix[0].size();
    int total = 0;

    vector<int> heights(m, 0);
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < m; j++) {
            if (matrix[i][j] == 1) {
                heights[j]++;
            } else
                heights[j] = 0;
        }

        for(int j = 0; j < m; j++){
            if(heights[j] == 0)
                continue;
            int minHeight = heights[j];

            for(int k = j; k >= 0; k--){
                if(heights[k] == 0)
                    break;
                minHeight = min(heights[k], minHeight);
                total += minHeight;
            }
        }
    }
    return total;
}
```

Per row, update `heights`. For each column `j`, walk left to `k`, tracking the minimum height; that minimum is the number of new rectangles ending at `(i, j)` that span back to column `k`. That is O(m²) per row, O(n·m²) overall: fine for the constraints but slower than the stack approach.

### Optimised: stack-based — O(n·m)

```cpp
class Solution {
public:
    int helper(vector<int>& heights){
        stack<int> st;
        vector<int> dp(heights.size(), 0);
        int count = 0;

        for(int i = 0; i < heights.size(); i++){
            while(!st.empty() && heights[i] < heights[st.top()]) st.pop();

            if(st.empty())
                dp[i] = heights[i]* (i+1);
            else {
                dp[i] = dp[st.top()] + heights[i]*(i-st.top());
            }
            count += dp[i];
            st.push(i);
        }
        return count;
    }

    int numSubmat(vector<vector<int>>& mat) {
        int n = mat.size();
        int m = mat[0].size();

        vector<int> heights(m, 0);
        int ans = 0;

        for(int i = 0; i < n; i++){
            for(int j = 0; j < m; j++){
                if(mat[i][j] == 1) heights[j]++;
                else heights[j] = 0;
            }
            ans += helper(heights);
        }
        return ans;
    }
};
```

**Amortized analysis:** each column index is pushed once and popped at most once per row, so the nested `while` is O(m) per row in total. Updating heights is also O(m), giving O(n·m) overall.

Further practice: [Advanced DP problems](https://leetcode.com/discuss/study-guide/6074423/advanced-dp-problems-for-practice).

## Two Best Non-Overlapping Events
[LeetCode](https://leetcode.com/problems/two-best-non-overlapping-events/) · Top-down DP

> **Problem:** Each event has a start, an end and a value. Choose at most two non-overlapping events to maximise the total value.

Sort by start; for each event either take it (then binary-search the next event starting after its end) or skip it, with at most 2 taken.

```cpp
class Solution {
public:
    int maxTwoEvents(vector<vector<int>>& events) {
        sort(events.begin(), events.end(), [](auto& a, auto& b) { return a[0] < b[0]; });

        vector<vector<int>> dp(events.size(), vector<int>(3, -1));
        return f(0, events, 0, dp);
    }

    int f(int idx, vector<vector<int>>& events, int count, vector<vector<int>>& dp) {
        if (idx >= events.size() || count == 2)
            return 0;

        if (dp[idx][count] == -1) {
            int end = events[idx][1];
            int lo = idx + 1, hi = (int)events.size();

            while (lo < hi) {
                int mid = lo + ((hi - lo) >> 1);
                if (events[mid][0] > end)
                    hi = mid;
                else
                    lo = mid + 1;
            }
            int take = events[idx][2] + 0;
            // take the current event and move on to the next valid event with start-time > end-time
            if (lo < events.size() && events[lo][0] > end)
                take += f(lo, events, count + 1, dp);

            int non_take = f(idx + 1, events, count, dp);
            dp[idx][count] = max(take, non_take);
        }
        return dp[idx][count];
    }
};
```
