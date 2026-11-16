## Optimal Account Balancing
[LeetCode](https://leetcode.com/problems/optimal-account-balancing/)

> **Problem:** Given transactions `[from, to, amount]`, return the minimum number of transactions needed to settle all debts.

- **Net balances:** compute each person's net balance from all transactions.
- **Non-zero extraction:** people with a zero balance are already settled, so keep only the non-zero balances.
- **Backtracking:** settle `balances[start]` against every later person with the opposite sign, recurse on `start+1`, then undo.
- **Pruning:** if a pair cancels out exactly, that is the best possible move, so stop trying other people.
```cpp
class Solution {
public:
    int backtrack(int start, vector<long>& balances){
        while(start < balances.size() && balances[start] == 0) start++;
        if(start == balances.size()) return 0;
        int ans = INT_MAX;
        for(int i = start+1; i < balances.size(); i++){
            if(balances[i]*balances[start] < 0){
                balances[i] += balances[start];
                ans = min(ans, 1 + backtrack(start+1, balances));
                balances[i] -= balances[start];
                if(balances[i] + balances[start] == 0) break;
            }
        }
        return ans;
    }
    int minTransfers(vector<vector<int>>& transactions) {
        unordered_map<int, long> net;
        for(auto &t : transactions){
            net[t[0]] -= t[2];
            net[t[1]] += t[2];
        }
        vector<long> balances;
        for(auto &[person, bal] : net){
            if(bal != 0) balances.push_back(bal);
        }
        return backtrack(0, balances);
    }
};
```
## Jump Game
[Naukri Code 360](https://www.naukri.com/code360/problems/minimum-jumps_1062693)

> **Problem:** Each element is the maximum jump length from that index. Return the minimum number of jumps to reach the last index, or -1 if it can't be reached.

Minimum jumps to reach the end; -1 if it can't be reached.
### Top-down
```cpp
int f(int i, vector<int> &arr, vector<int> &dp, int n){
    if(i >= n-1) return 0;
    if(dp[i] != -1) return dp[i];
    int mini = INT_MAX;
    for(int j = i+1; j <= min(n-1, i+arr[i]); j++){
        int res = f(j, arr, dp, n);
        if(res != INT_MAX) mini = min(mini, 1 + res);
    }
    return dp[i] = mini;
}
int minJumps(vector<int> &arr, int n){
    vector<int> dp(n, -1);
    int ans = f(0, arr, dp, n);
    return ans == INT_MAX ? -1 : ans;
}
```
### Bottom-up
```cpp
int minJumps(vector<int> &arr, int n){
    vector<int> dp(n+1, INT_MAX);
    dp[n] = INT_MAX;
    dp[n-1] = 0;
    for(int i = n-2; i >= 0; i--){
        int mini = INT_MAX;
        for(int j = i+1; j <= min(n-1, i+arr[i]); j++){
            if(dp[j] != INT_MAX) mini = min(mini, 1 + dp[j]);
        }
        dp[i] = mini;
    }
    return dp[0] == INT_MAX ? -1 : dp[0];
}
```
## Ways To Make Coin Change
[Naukri Code 360](https://www.naukri.com/code360/problems/ways-to-make-coin-change_630471)

> **Problem:** Given denominations (unlimited supply) and a `value`, count the ways to make that value.

Video: "DP 22. Coin Change 2". Space-optimised unbounded knapsack.
```cpp
long countWaysToMakeChange(int *den, int n, int value){
    vector<long> prev(value+1, 0), cur(value+1, 0);
    for(int t = 0; t <= value; t++){
        prev[t] = (t % den[0] == 0);
    }
    for(int i = 1; i < n; i++){
        for(int t = 0; t <= value; t++){
            long notTake = prev[t];
            long take = 0;
            if(den[i] <= t) take = cur[t-den[i]];
            cur[t] = take + notTake;
        }
        prev = cur;
    }
    return prev[value];
}
```
